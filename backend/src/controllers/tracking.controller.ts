import { Response, NextFunction } from 'express';
import Order from '../models/Order';
import { maskPhone, maskAddress, maskFullName } from '../utils/maskingUtils';

/**
 * Get public tracking information by order number
 * No authentication required - returns masked sensitive data
 */
export const getPublicTracking = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { orderNumber } = req.params;

        const order = await Order.findOne({ orderNumber }).select('-user -adminNote');

        if (!order) {
            res.status(404).json({
                status: 'fail',
                message: 'Order not found. Please check your order number and try again.'
            });
            return;
        }

        // Return sanitized order data
        const publicData = {
            orderNumber: order.orderNumber,
            deliveryStatus: order.deliveryStatus,
            paymentStatus: order.paymentStatus,
            trackingEvents: order.trackingEvents,
            createdAt: order.createdAt,
            estimatedDelivery: order.shippedAt
                ? new Date(order.shippedAt.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from shipped
                : null,
            // Masked data
            shippingAddress: {
                fullName: maskFullName(order.shippingAddress.fullName),
                phone: maskPhone(order.shippingAddress.phone),
                address: maskAddress(order.shippingAddress.address, order.shippingAddress.city, order.shippingAddress.state),
                city: order.shippingAddress.city,
                state: order.shippingAddress.state
            },
            itemCount: order.items.length,
            verified: false
        };

        res.status(200).json({
            status: 'success',
            data: publicData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify identity and return full order details
 * Requires email OR phone to match
 */
export const verifyAndTrack = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { orderNumber } = req.params;
        const { email, phone } = req.body;

        if (!email && !phone) {
            res.status(400).json({
                status: 'fail',
                message: 'Please provide either email or phone number for verification.'
            });
            return;
        }

        const order = await Order.findOne({ orderNumber }).populate('user', 'email phone');

        if (!order) {
            res.status(404).json({
                status: 'fail',
                message: 'Order not found.'
            });
            return;
        }

        // Verify email or phone matches
        const user = order.user as any;
        const emailMatch = email && user.email.toLowerCase() === email.toLowerCase();
        const phoneMatch = phone && user.phone === phone;

        if (!emailMatch && !phoneMatch) {
            res.status(401).json({
                status: 'fail',
                message: 'Verification failed. The provided information does not match our records.'
            });
            return;
        }

        // Return full order details
        const fullData = {
            orderNumber: order.orderNumber,
            deliveryStatus: order.deliveryStatus,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            trackingEvents: order.trackingEvents,
            trackingNumber: order.trackingNumber,
            createdAt: order.createdAt,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            estimatedDelivery: order.shippedAt
                ? new Date(order.shippedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
                : null,
            shippingAddress: order.shippingAddress,
            items: order.items,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            discount: order.discount,
            total: order.total,
            customerNote: order.customerNote,
            verified: true
        };

        res.status(200).json({
            status: 'success',
            data: fullData
        });
    } catch (error) {
        next(error);
    }
};
