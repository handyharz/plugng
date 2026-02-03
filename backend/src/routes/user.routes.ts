import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.post('/address', userController.updateAddress);
router.delete('/address/:addressId', userController.deleteAddress);
router.patch('/address/:addressId/default', userController.setDefaultAddress);
router.patch('/password', userController.updatePassword);

export default router;
