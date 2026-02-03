import express, { Router } from 'express';
import { subscribe } from '../controllers/newsletter.controller';

const router: Router = express.Router();

router.post('/subscribe', subscribe);

export default router;
