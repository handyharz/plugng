import express, { Router } from 'express';
import { getCart, addToCart, removeItem, updateItem, syncCart } from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/remove', removeItem);
router.put('/update', updateItem);
router.post('/sync', syncCart);

export default router;
