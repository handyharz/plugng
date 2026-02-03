import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export const optimizeAndUploadImage = async (
    fileBuffer: Buffer,
    folder: string = 'products'
): Promise<{ url: string; key: string }> => {
    try {
        const uniqueId = uuidv4();
        const key = `${folder}/${uniqueId}.webp`;

        // Optimize image using Sharp
        const optimizedBuffer = await sharp(fileBuffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            Body: optimizedBuffer,
            ContentType: 'image/webp',
        });

        await s3Client.send(command);

        const url = `${process.env.R2_PUBLIC_URL}/${key}`;

        return { url, key };
    } catch (error) {
        console.error('Error optimizing/uploading image:', error);
        throw new Error('Image upload failed');
    }
};
