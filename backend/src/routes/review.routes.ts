import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = Router();

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.use(protect);
router.post('/', reviewController.createReview);
router.get('/my-reviews', reviewController.getMyReviews);

export default router;
