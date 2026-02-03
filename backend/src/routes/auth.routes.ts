import express, { Router } from 'express';
import { register, login, logout, verifyPhone, resendOTP, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Verification (Can be done while logged in or with phone number)
// Making them flexible in controller, but protect is useful if we assume flow is register -> auto-login -> verify
router.post('/verify', protect, verifyPhone);
router.post('/resend-otp', protect, resendOTP);

// User info
router.get('/me', protect, getMe);

export default router;
