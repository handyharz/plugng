import { Request, Response, NextFunction } from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import multer from 'multer';
import path from 'path';

// R2 Configuration
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || '',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'plugng-shop';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-your-id.r2.dev';

// Multer Storage (Memory)
const storage = multer.memoryStorage();

// Multer Filter (Images only)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'));
    }
};

// Export multer middleware
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload Controller
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ status: 'fail', message: 'No file uploaded' });
            return;
        }

        const file = req.file;
        const fileExt = path.extname(file.originalname);
        const fileName = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

        // Upload to R2
        const upload = new Upload({
            client: r2Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            },
        });

        await upload.done();

        const fileUrl = `${PUBLIC_URL}/${fileName}`;

        res.status(200).json({
            status: 'success',
            data: {
                url: fileUrl,
                key: fileName
            }
        });
    } catch (error) {
        console.error('Upload Error:', error);
        next(error);
    }
};
