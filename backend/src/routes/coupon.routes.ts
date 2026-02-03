import express, { Router } from 'express';
import { validateCoupon } from '../controllers/coupon.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Publicly validate coupon (though usually requires login to actually use)
router.get('/validate/:code', protect, validateCoupon);

export default router;
