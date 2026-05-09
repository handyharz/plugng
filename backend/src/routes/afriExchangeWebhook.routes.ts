import express, { Router } from 'express';
import { handleAfriExchangeWebhook } from '../controllers/order.controller';

const router: Router = express.Router();

router.post('/', handleAfriExchangeWebhook);

export default router;
