import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // 1. Get token from header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        // We will use 'token' or 'accessToken' as the cookie name
        token = req.cookies.token;
    }

    if (!token) {
        res.status(401).json({
            status: 'fail',
            message: 'You are not logged in! Please log in to get access.'
        });
        return;
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;

        // 3. Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            res.clearCookie('token');
            res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer does exist.',
            });
            return;
        }

        // 4. Grant access
        req.user = currentUser;
        next();
    } catch (error) {
        res.clearCookie('token');
        res.status(401).json({
            status: 'fail',
            message: 'Invalid token or token has expired',
        });
        return;
    }
};

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const adminRoles = ['admin', 'super_admin', 'manager', 'support', 'editor'];

        // If 'admin' is in the required roles, expand it to all admin types
        const effectiveRoles = [...roles];
        if (roles.includes('admin')) {
            adminRoles.forEach(r => {
                if (!effectiveRoles.includes(r)) effectiveRoles.push(r);
            });
        }

        if (!req.user || !effectiveRoles.includes(req.user.role)) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action',
            });
            return;
        }
        next();
    };
};
