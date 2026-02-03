import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import notificationService from '../services/notificationService';

// --- Type Definitions ---
interface AuthRequest extends Request {
    user?: IUser;
}

// --- Helpers ---
const signToken = (id: string) => {
    const expiresIn = (process.env.JWT_ACCESS_EXPIRY || '15m') as any;
    return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET!, {
        expiresIn
    });
};

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
    const token = signToken(user._id as unknown as string);

    const cookieOptions = {
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const
    };

    res.cookie('token', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user },
    });
};

// --- Controllers ---

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            res.status(400).json({ status: 'fail', message: 'User already exists with that email or phone' });
            return;
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            otp,
            otpExpires,
        });

        // Send OTP via SMS (non-blocking - don't fail registration if this fails)
        try {
            await notificationService.sendSMS({
                to: phone,
                message: `Your PlugNG verification code is: ${otp}`,
            });
        } catch (smsError) {
            console.error('SMS sending failed (non-critical):', smsError);
        }

        // Also send welcome email (non-blocking)
        try {
            await notificationService.sendEmail({
                to: email,
                subject: 'Welcome to PlugNG!',
                html: `<h1>Welcome, ${firstName}!</h1><p>Thanks for joining. Your verification code is <b>${otp}</b>.</p>`
            });
        } catch (emailError) {
            console.error('Email sending failed (non-critical):', emailError);
        }

        createSendToken(newUser, 201, res);
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, emailOrPhone, password } = req.body;
        const identifier = email || emailOrPhone;

        // 1. Check if email & password exist
        if (!identifier || !password) {
            res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
            return;
        }

        // 2. Check if user exists && password is correct
        console.time('🔑 Auth Login Query');
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        }).select('+password');
        console.timeEnd('🔑 Auth Login Query');

        if (!user) {
            console.log(`❌ Login failed: User not found [${identifier}]`);
            res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        console.log(`📡 Login Attempt: ${identifier} | Match: ${isMatch}`);

        if (!isMatch) {
            res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
            return;
        }

        // 3. Send token
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * Logout
 */
export const logout = (_req: Request, res: Response) => {
    res.cookie('token', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

/**
 * Verify OTP
 */
export const verifyPhone = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { otp } = req.body;

        let user;
        if (req.user) {
            // Already logged in
            user = await User.findById(req.user.id).select('+otp +otpExpires');
        } else {
            // Not logged in, need identifier
            const { phone } = req.body;
            user = await User.findOne({ phone }).select('+otp +otpExpires');
        }

        if (!user) {
            res.status(400).json({ status: 'fail', message: 'User not found' });
            return;
        }

        if (user.otp !== otp) {
            res.status(400).json({ status: 'fail', message: 'Invalid OTP' });
            return;
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            res.status(400).json({ status: 'fail', message: 'OTP has expired' });
            return;
        }

        user.phoneVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ status: 'success', message: 'Phone verified successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Resend OTP
 */
export const resendOTP = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let user;
        if (req.user) {
            user = await User.findById(req.user.id);
        } else {
            const { phone } = req.body;
            user = await User.findOne({ phone });
        }

        if (!user) {
            res.status(400).json({ status: 'fail', message: 'User not found' });
            return;
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save({ validateBeforeSave: false });

        // Send SMS (non-blocking)
        try {
            await notificationService.sendSMS({
                to: user.phone,
                message: `Your new PlugNG verification code is: ${otp}`,
            });
        } catch (smsError) {
            console.error('SMS sending failed (non-critical):', smsError);
        }

        res.status(200).json({ status: 'success', message: 'OTP resent' });
    } catch (error) {
        next(error);
    }
}

/**
 * Get Current User
 */
export const getMe = (req: AuthRequest, res: Response, _next: NextFunction) => {
    res.status(200).json({
        status: 'success',
        data: { user: req.user }
    });
}
