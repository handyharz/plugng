import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = Router();

router.use(protect);

router.post('/initialize', walletController.initializeTopup);
router.get('/verify', walletController.verifyTopup);
router.get('/transactions', walletController.getTransactionHistory);

export default router;
