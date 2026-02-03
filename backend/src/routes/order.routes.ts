
import express, { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { createOrder, verifyPayment, getMyOrders, getOrderById } from '../controllers/order.controller';

const router: Router = express.Router();

// Protect all order routes (User must be logged in)
router.use(protect);

router.post('/', createOrder);
router.get('/verify', verifyPayment);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
