import express, { Router } from 'express';
import {
    createCategory,
    getCategories,
    getCategoryTree,
    getCategory,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:slug', getCategory);

// Protected routes (Admin only)
router.post('/', protect, restrictTo('admin'), createCategory);
router.put('/:id', protect, restrictTo('admin'), updateCategory);
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);

export default router;
