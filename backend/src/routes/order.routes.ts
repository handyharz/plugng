
import express, { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { createOrder, verifyPayment, getMyOrders, getOrderById } from '../controllers/order.controller';

const router: Router = express.Router();

// Paystack redirects back to this route, so verification must not depend on a browser session.
router.get('/verify', verifyPayment);

// Protect all other order routes (User must be logged in)
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
