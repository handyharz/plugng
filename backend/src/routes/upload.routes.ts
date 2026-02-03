import express, { Router } from 'express';
import { upload, uploadImage } from '../controllers/upload.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Protect all upload routes
router.use(protect);
router.use(restrictTo('admin'));

router.post('/image', upload.single('image'), uploadImage);

export default router;
