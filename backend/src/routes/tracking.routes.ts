import { Router } from 'express';
import * as trackingController from '../controllers/tracking.controller';

const router: Router = Router();

// Public routes (no authentication required)
router.get('/:orderNumber', trackingController.getPublicTracking);
router.post('/:orderNumber/verify', trackingController.verifyAndTrack);

export default router;
