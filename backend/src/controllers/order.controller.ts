
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import User from '../models/User';
import Coupon from '../models/Coupon';
import notificationService from '../services/notificationService';

interface AuthenticatedRequest extends Request {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const incrementCouponUsage = async (couponCode?: string) => {
    if (couponCode) {
        await Coupon.findOneAndUpdate(
            { code: couponCode.toUpperCase() },
            { $inc: { usageCount: 1 } }
        );
    }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user._id || req.user.id;
        const { shippingAddress, paymentMethod, couponCode } = req.body;

        // 1. Get user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            res.status(400).json({ status: 'fail', message: 'Cart is empty' });
            return;
        }

        // 2. Validate Stock & Calculate Totals (Re-verify backend side)
        let subtotal = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404).json({ status: 'fail', message: `Product not found: ${item.product}` });
                return;
            }

            // Find variant if applicable
            let price = 0;
            let image = product.images[0]?.url;
            let variantSku = '';

            if (item.variantId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const variant = product.variants.find((v: any) => v.sku === item.variantId || v._id?.toString() === item.variantId);
                if (!variant) {
                    res.status(400).json({ status: 'fail', message: `Variant not found for product: ${product.name}` });
                    return;
                }
                if (variant.stock < item.quantity) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const color = (variant as any).attributeValues?.Color || 'Variant';
                    res.status(400).json({ status: 'fail', message: `Insufficient stock for ${product.name} (${color})` });
                    return;
                }
                price = variant.sellingPrice;
                if (variant.image) image = variant.image;
                variantSku = variant.sku;
            } else {
                // Base product stock check (if product doesn't have variants or we treat base as default)
                // For this schema, we seem to rely on variants often. 
                // Let's assume price comes from first variant if no variant selected, or just simple product logic
                // But generally carts should have variants selected.
                price = product.variants?.[0]?.sellingPrice || 0; // Fallback
            }

            subtotal += price * item.quantity;
            orderItems.push({
                product: product._id,
                name: product.name,
                sku: variantSku || product.slug,
                price: price,
                quantity: item.quantity,
                image: image,
                variantAttributes: item.selectedOptions
            });
        }

        // Apply Business Rules from PROJECT CONTEXT
        // 1. Delivery Fee Logic
        let deliveryFee = 2000; // Default Tier 3/4
        const userState = shippingAddress.state?.trim().toLowerCase() || '';

        if (userState === 'lagos' || userState === 'fct' || userState === 'abuja') {
            deliveryFee = 1200; // Tier 1
        } else if (['rivers', 'oyo', 'edo', 'enugu', 'kano'].includes(userState)) {
            deliveryFee = 1500; // Tier 2
        }

        // Free delivery if order total > ₦5,000
        const FREE_DELIVERY_THRESHOLD = 5000;
        if (subtotal >= FREE_DELIVERY_THRESHOLD) {
            deliveryFee = 0;
        }

        // 2. Discounts
        let discount = 0;

        // Wallet-Only Discount Logic
        if (paymentMethod === 'wallet') {
            for (const item of orderItems) {
                // Fetch product again to ensure secure discount application or use cached data if available
                // We just verified products above, but need to check discount field
                const product = await Product.findById(item.product);
                if (product?.walletOnlyDiscount?.enabled) {
                    const isValid = !product.walletOnlyDiscount.validUntil || new Date(product.walletOnlyDiscount.validUntil) > new Date();
                    if (isValid) {
                        const itemDiscount = (item.price * item.quantity * product.walletOnlyDiscount.percentage) / 100;
                        discount += itemDiscount;
                    }
                }
            }
        }

        // Bank Transfer Discount (incentivized with ₦200)
        if (paymentMethod === 'bank_transfer') {
            discount += 200;
        }

        // Coupon Discount Logic
        let appliedCoupon = null;
        let couponDiscountAmount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                expiryDate: { $gt: new Date() }
            });

            if (coupon) {
                const isUsageLimitMet = coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit;

                // Check per-user limit
                let isPerUserLimitMet = false;
                if (coupon.limitPerUser > 0) {
                    const userUsage = await Order.countDocuments({
                        user: userId,
                        couponCode: coupon.code,
                        paymentStatus: { $ne: 'failed' }
                    });
                    if (userUsage >= coupon.limitPerUser) {
                        isPerUserLimitMet = true;
                    }
                }

                const isMinAmountMet = subtotal >= coupon.minOrderAmount;

                if (!isUsageLimitMet && !isPerUserLimitMet && isMinAmountMet) {
                    if (coupon.type === 'percentage') {
                        couponDiscountAmount = (subtotal * coupon.value) / 100;
                        if (coupon.maxDiscountAmount && couponDiscountAmount > coupon.maxDiscountAmount) {
                            couponDiscountAmount = coupon.maxDiscountAmount;
                        }
                    } else {
                        couponDiscountAmount = coupon.value;
                    }
                    discount += couponDiscountAmount;
                    appliedCoupon = coupon;
                }
            }
        }

        // Maximum total discount: 50% of subtotal (fraud prevention)
        const maxDiscount = subtotal * 0.5;
        if (discount > maxDiscount) {
            // Adjust coupon discount if we hit the cap
            const excess = discount - maxDiscount;
            couponDiscountAmount = Math.max(0, couponDiscountAmount - excess);
            discount = maxDiscount;
        }

        const total = subtotal + deliveryFee - discount;

        // 3. Create Pending Order
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const order = await Order.create({
            orderNumber,
            user: userId,
            items: orderItems,
            subtotal,
            deliveryFee,
            discount,
            total,
            paymentMethod,
            paymentStatus: 'pending',
            shippingAddress,
            couponCode: appliedCoupon?.code,
            couponDiscount: couponDiscountAmount,
            deliveryStatus: 'pending',
            trackingEvents: [{
                status: 'pending',
                location: 'Central Plug',
                message: 'Manifest received. Awaiting clearance.',
                timestamp: new Date()
            }]
        });

        // 4. Initialize Payment (if not COD)
        let paymentData = null;
        const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
        const isDevMode = !secretKey || secretKey === 'sk_test_placeholder';

        if (paymentMethod === 'card' || paymentMethod === 'bank_transfer') {
            // In development mode with placeholder keys, skip payment initialization
            if (isDevMode) {
                console.log('⚠️  DEV MODE: Skipping Paystack payment initialization (placeholder API key)');
                console.log(`📦 Order created: ${orderNumber} | Total: ₦${total.toLocaleString()}`);
                // For dev mode, we'll mark as paid immediately for testing
                order.paymentStatus = 'paid';
                order.paidAt = new Date();
                order.paymentReference = `DEV-${Date.now()}`;

                // Deduct stock immediately in dev mode
                for (const item of order.items) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const variantIndex = product.variants.findIndex((v: any) => v.sku === item.sku);
                        if (variantIndex > -1) {
                            const variant = product.variants[variantIndex];
                            if (variant) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (variant as any).stock -= item.quantity;
                            }
                        }
                        await product.save();
                    }
                }

                // Increment coupon usage
                if ((order as any).couponCode) {
                    await incrementCouponUsage((order as any).couponCode);
                }

                order.trackingEvents.push({
                    status: 'processing',
                    location: 'Local Debugger',
                    message: 'Development override: Payment bypass active. Manifest validated.',
                    timestamp: new Date()
                });
                await order.save();

                // Update Loyalty Status
                await (User as any).updateLoyaltyStatus(userId, order.total);

                // Send In-App Notification
                await notificationService.sendInApp(
                    userId.toString(),
                    'order_update',
                    'Order Placed Successfully',
                    `Your order #${orderNumber} has been placed and confirmed (Dev Mode).`,
                    `/orders/${order._id}`
                );
            } else {
                // Production mode: Initialize real Paystack payment
                try {
                    const paystackResponse = await axios.post(
                        'https://api.paystack.co/transaction/initialize',
                        {
                            email: req.user.email,
                            amount: total * 100, // Paystack expects kobo
                            reference: order.orderNumber, // Using human-readable order number as reference
                            callback_url: `${process.env.FRONTEND_URL}/checkout/success`
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    paymentData = paystackResponse.data.data;
                } catch (error: any) {
                    console.error('Paystack Init Error:', error.response?.data || error.message);
                    await Order.findByIdAndDelete(order._id); // Rollback
                    res.status(500).json({ status: 'error', message: 'Payment initialization failed' });
                    return;
                }
            }
        } else if (paymentMethod === 'wallet') {
            // Wallet Payment Logic
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({ status: 'fail', message: 'User not found' });
                return;
            }

            if (user.wallet.balance < total) {
                await Order.findByIdAndDelete(order._id); // Rollback order creation
                res.status(400).json({ status: 'fail', message: 'Insufficient wallet balance' });
                return;
            }

            // 1. Deduct from wallet
            user.wallet.balance -= total;
            user.wallet.transactions.push({
                type: 'debit',
                amount: total,
                description: `Purchase: ${orderNumber}`,
                date: new Date()
            });

            // 2. Update order status
            order.paymentStatus = 'paid';
            order.paidAt = new Date();
            order.paymentReference = `WALLET-${Date.now()}`;
            order.deliveryStatus = 'processing';
            order.trackingEvents.push({
                status: 'processing',
                location: 'Secure Wallet',
                message: 'Internal funds verified and debited. Order cleared for processing.',
                timestamp: new Date()
            });

            order.markModified('trackingEvents');
            await order.save();

            // 3. Deduct Stock
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    const variantIndex = product.variants.findIndex((v: any) => v.sku === item.sku);
                    if (variantIndex > -1) {
                        const variant = product.variants[variantIndex];
                        if (variant) {
                            (variant as any).stock -= item.quantity;
                        }
                    }
                    await product.save();
                }
            }

            // Increment coupon usage
            if ((order as any).couponCode) {
                await incrementCouponUsage((order as any).couponCode);
            }

            await user.save({ validateBeforeSave: false });
            await order.save();

            // 4. Update Loyalty Status
            await (User as any).updateLoyaltyStatus(userId, order.total);

            // 5. Send Notification
            await notificationService.sendInApp(
                userId.toString(),
                'order_update',
                'Order Paid via Wallet',
                `Your order #${orderNumber} has been paid successfully using your wallet balance.`,
                `/orders/${order._id}`
            );
        }

        // 5. Clear Cart
        await Cart.findOneAndDelete({ user: userId });

        // Send In-App Notification for order creation
        if (paymentMethod !== 'card' && paymentMethod !== 'bank_transfer') {
            // Probably COD or other method not handled yet
            await notificationService.sendInApp(
                userId.toString(),
                'order_update',
                'Order Placed',
                `Your order #${orderNumber} has been placed.`,
                `/orders/${order._id}`
            );
        } else if (!isDevMode) {
            // Initialization successful, awaiting payment
            await notificationService.sendInApp(
                userId.toString(),
                'order_update',
                'Order Received',
                `Your order #${orderNumber} is pending payment.`,
                `/orders/${order._id}`
            );
        }

        res.status(201).json({
            status: 'success',
            data: {
                order,
                paymentUrl: paymentData?.authorization_url,
                accessCode: paymentData?.access_code,
                reference: paymentData?.reference || order.paymentReference || order.orderNumber
            }
        });
        return;

    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { reference } = req.query;
        console.log(`🔍 [Verify] Started for reference: ${reference}`);

        if (!reference) {
            res.status(400).json({ status: 'fail', message: 'No reference provided' });
            return;
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
        const isDevMode = !secretKey || secretKey === 'sk_test_placeholder' || process.env.NODE_ENV === 'development';

        // 1. First level check: Is this already a paid order in our DB?
        let order = await Order.findOne({
            $or: [
                { orderNumber: reference as string },
                { paymentReference: reference as string }
            ]
        });

        console.log(`🔍 [Verify] DB Lookup: ${order ? 'Found' : 'Not Found'} | Status: ${order?.paymentStatus}`);

        // If order already paid, return immediately
        if (order && order.paymentStatus === 'paid') {
            res.status(200).json({ status: 'success', data: { order } });
            return;
        }

        // 2. Extra safety for Dev Mode: 
        if (order && isDevMode && (reference as string).startsWith('ORD-')) {
            console.log(`⚠️  [Verify] Dev Mode auto-confirm for ${reference}`);
            if (order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.paidAt = new Date();
                order.paymentReference = order.paymentReference || `DEV-${Date.now()}`;

                for (const item of order.items) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        const variantIndex = product.variants.findIndex((v: any) => v.sku === item.sku);
                        if (variantIndex > -1) {
                            const variant = product.variants[variantIndex];
                            if (variant) (variant as any).stock -= item.quantity;
                        }
                        await product.save();
                    }
                }

                // Increment coupon usage
                if ((order as any).couponCode) {
                    await incrementCouponUsage((order as any).couponCode);
                }

                order.deliveryStatus = 'processing';
                order.trackingEvents.push({
                    status: 'processing',
                    location: 'Payment Hook',
                    message: 'Internal verification complete. Order moved to processing.',
                    timestamp: new Date()
                });

                order.markModified('trackingEvents');
                await order.save();

                // Update Loyalty Status
                await (User as any).updateLoyaltyStatus(order.user, order.total);

                // Send In-App Notification
                await notificationService.sendInApp(
                    order.user.toString(),
                    'payment_success',
                    'Payment Confirmed',
                    `Payment for order #${order.orderNumber} has been verified.`,
                    `/orders/${order._id}`
                );
            }
            res.status(200).json({ status: 'success', data: { order } });
            return;
        }

        // 3. Verify with Paystack (legacy/live mode)
        try {
            console.log(`🌐 [Verify] Calling Paystack API...`);
            const paystackResponse = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: { Authorization: `Bearer ${secretKey}` },
                    timeout: 15000 // Increased timeout
                }
            );

            const data = paystackResponse.data.data;
            console.log(`✅ [Verify] Paystack Response: ${data.status}`);

            if (data.status === 'success') {
                if (!order) {
                    order = await Order.findOne({
                        $or: [
                            { orderNumber: data.reference },
                            { _id: data.reference }
                        ]
                    });
                }

                if (order) {
                    if (order.paymentStatus !== 'paid') {
                        order.paymentStatus = 'paid';
                        order.paidAt = new Date();
                        order.paymentReference = data.id.toString();

                        for (const item of order.items) {
                            const product = await Product.findById(item.product);
                            if (product) {
                                const variantIndex = product.variants.findIndex((v: any) => v.sku === item.sku);
                                if (variantIndex > -1) {
                                    const variant = product.variants[variantIndex];
                                    if (variant) {
                                        (variant as any).stock -= item.quantity;
                                    }
                                }
                                await product.save();
                            }
                        }

                        // Increment coupon usage
                        if ((order as any).couponCode) {
                            await incrementCouponUsage((order as any).couponCode);
                        }

                        order.deliveryStatus = 'processing';
                        order.trackingEvents.push({
                            status: 'processing',
                            location: 'Gate 7 Distribution',
                            message: 'Security cleared. Payment confirmed. Transitioning to processing.',
                            timestamp: new Date()
                        });
                        order.markModified('trackingEvents');
                        await order.save();

                        // Update Loyalty Status
                        await (User as any).updateLoyaltyStatus(order.user, order.total);

                        // Send In-App Notification
                        await notificationService.sendInApp(
                            order.user.toString(),
                            'payment_success',
                            'Payment Confirmed',
                            `Payment for order #${order.orderNumber} has been verified successfully.`,
                            `/orders/${order._id}`
                        );
                    }

                    res.status(200).json({ status: 'success', data: { order } });
                    return;
                }
            }
        } catch (error: any) {
            // Handle 404 from paystack if reference is just our order number and they don't know it yet
            console.error('Paystack Verification Error:', error.response?.data?.message || error.message);
        }

        res.status(400).json({ status: 'fail', message: 'Payment verification failed' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all orders for the current user
 */
export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id || req.user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ user: userId });

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders,
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id || req.user.id;
        const order = await Order.findOne({ _id: req.params.id, user: userId });

        if (!order) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};
