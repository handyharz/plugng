import express, { Router } from 'express';
import { createProduct, getProducts, getProduct, getFilterOptions } from '../controllers/product.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router: Router = express.Router();

// Public Routes
router.get('/', getProducts);
router.get('/filters/options', getFilterOptions);
router.get('/:id', getProduct);

// Protected Routes (Admin only)
router.post(
    '/',
    protect,
    restrictTo('admin'),
    upload.fields([{ name: 'images', maxCount: 10 }]), // Allow up to 10 main images
    createProduct
);

export default router;
