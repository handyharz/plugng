import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import Order from '../models/Order';

interface AuthenticatedRequest extends Request {
    user?: any;
}

/**
 * Validate a coupon code
 * GET /api/v1/coupons/validate/:code
 */
export const validateCoupon = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }
        const { amount } = req.query; // Optional: check if min amount met

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Check expiry
        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Coupon has expired'
            });
        }

        // Check usage limit
        if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Coupon usage limit reached'
            });
        }

        // Check per-user limit
        if (coupon.limitPerUser > 0 && req.user) {
            const userUsage = await Order.countDocuments({
                user: req.user._id || req.user.id,
                couponCode: coupon.code,
                paymentStatus: { $ne: 'failed' } // Count pending/paid but not failed
            });

            if (userUsage >= coupon.limitPerUser) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already used this coupon'
                });
            }
        }

        // Check min order amount if provided
        if (amount && parseFloat(amount as string) < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount for this coupon is ₦${coupon.minOrderAmount.toLocaleString()}`
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                minOrderAmount: coupon.minOrderAmount,
                maxDiscountAmount: coupon.maxDiscountAmount,
                description: coupon.description
            }
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
