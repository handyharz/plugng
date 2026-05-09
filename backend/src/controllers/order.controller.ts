
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import User from '../models/User';
import Coupon from '../models/Coupon';
import notificationService from '../services/notificationService';
import {
    createAfriExchangePaymentRequest,
    isAfriExchangeEnabled,
    verifyAfriExchangeWebhookSignature
} from '../services/afriExchangeService';

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

const getVerificationOrderData = (order: any) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    paymentReference: order.paymentReference,
    deliveryStatus: order.deliveryStatus
});

const markOrderAsPaid = async ({
    order,
    paymentReference,
    paymentStatusSource,
    userIdForNotification,
    notificationTitle,
    notificationMessage
}: {
    order: any;
    paymentReference?: string;
    paymentStatusSource: string;
    userIdForNotification: string;
    notificationTitle: string;
    notificationMessage: string;
}) => {
    if (order.paymentStatus === 'paid') {
        return order;
    }

    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    if (paymentReference) {
        order.paymentReference = paymentReference;
    }
    order.deliveryStatus = 'processing';
    order.trackingEvents.push({
        status: 'processing',
        location: paymentStatusSource,
        message: notificationMessage,
        timestamp: new Date()
    });
    order.markModified('trackingEvents');

    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        const variantIndex = product.variants.findIndex((v: any) => v.sku === item.sku);
        if (variantIndex > -1) {
            const variant = product.variants[variantIndex];
            if (variant) {
                (variant as any).stock -= item.quantity;
            }
        }
        await product.save();
    }

    if ((order as any).couponCode) {
        await incrementCouponUsage((order as any).couponCode);
    }

    await order.save();

    await (User as any).updateLoyaltyStatus(order.user, order.total);

    await notificationService.sendInApp(
        userIdForNotification,
        'payment_success',
        notificationTitle,
        notificationMessage,
        `/orders/${order._id}`
    );

    return order;
};

const findOrderByReference = async (reference?: string) => {
    if (!reference) return null;

    return Order.findOne({
        $or: [
            { orderNumber: reference },
            { paymentReference: reference },
            { 'afriExchange.reference': reference },
            { 'afriExchange.transactionId': reference }
        ]
    });
};

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user._id || req.user.id;
        const { shippingAddress, paymentMethod, couponCode, callbackUrl } = req.body;
        const normalizedPaymentMethod = String(paymentMethod || '').toLowerCase();

        if (!['card', 'bank_transfer', 'wallet', 'cash_on_delivery', 'afriexchange'].includes(normalizedPaymentMethod)) {
            res.status(400).json({ status: 'fail', message: 'Unsupported payment method' });
            return;
        }

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
        if (normalizedPaymentMethod === 'wallet') {
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
        if (normalizedPaymentMethod === 'bank_transfer') {
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
            paymentMethod: normalizedPaymentMethod,
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

        if (normalizedPaymentMethod === 'card' || normalizedPaymentMethod === 'bank_transfer') {
            // In development mode with placeholder keys, skip payment initialization
            if (isDevMode) {
                console.log('⚠️  DEV MODE: Skipping Paystack payment initialization (placeholder API key)');
                console.log(`📦 Order created: ${orderNumber} | Total: ₦${total.toLocaleString()}`);
                // For dev mode, we'll mark as paid immediately for testing
                await markOrderAsPaid({
                    order,
                    paymentReference: `DEV-${Date.now()}`,
                    paymentStatusSource: 'Local Debugger',
                    userIdForNotification: userId.toString(),
                    notificationTitle: 'Payment Confirmed',
                    notificationMessage: `Development override: Payment bypass active for order #${orderNumber}.`
                });
            } else {
                // Production mode: Initialize real Paystack payment
                try {
                    const resolvedCheckoutCallback =
                        callbackUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success`;

                    const paystackResponse = await axios.post(
                        'https://api.paystack.co/transaction/initialize',
                        {
                            email: req.user.email,
                            amount: total * 100, // Paystack expects kobo
                            reference: order.orderNumber, // Using human-readable order number as reference
                            callback_url: resolvedCheckoutCallback
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
        } else if (normalizedPaymentMethod === 'wallet') {
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

            await user.save({ validateBeforeSave: false });
            await markOrderAsPaid({
                order,
                paymentReference: `WALLET-${Date.now()}`,
                paymentStatusSource: 'Secure Wallet',
                userIdForNotification: userId.toString(),
                notificationTitle: 'Order Paid via Wallet',
                notificationMessage: `Your order #${orderNumber} has been paid successfully using your wallet balance.`
            });
        } else if (normalizedPaymentMethod === 'afriexchange') {
            if (!isAfriExchangeEnabled()) {
                await Order.findByIdAndDelete(order._id);
                res.status(400).json({ status: 'fail', message: 'AfriExchange payments are not enabled yet' });
                return;
            }

            try {
                const afriExchangePayment = await createAfriExchangePaymentRequest({
                    amount: total,
                    tokenType: process.env.AFRIEXCHANGE_DEFAULT_TOKEN_TYPE || 'CT',
                    description: `PlugNG Order ${orderNumber}`,
                    customerEmail: req.user.email,
                    reference: orderNumber
                });

                order.afriExchange = {
                    transactionId: afriExchangePayment.transaction_id,
                    reference: orderNumber,
                    paymentUrl: afriExchangePayment.payment_url,
                    tokenType: afriExchangePayment.token_type || process.env.AFRIEXCHANGE_DEFAULT_TOKEN_TYPE || 'CT',
                    amount: Number(afriExchangePayment.amount || total),
                    status: 'payment.pending'
                };
                order.paymentReference = orderNumber;
                await order.save();

                paymentData = {
                    authorization_url: afriExchangePayment.payment_url,
                    reference: orderNumber,
                    provider: 'afriexchange'
                };
            } catch (error: any) {
                console.error('AfriExchange payment request error:', error.response?.data || error.message);
                await Order.findByIdAndDelete(order._id);
                res.status(500).json({ status: 'error', message: 'AfriExchange payment initialization failed' });
                return;
            }
        }

        // 5. Clear Cart
        await Cart.findOneAndDelete({ user: userId });

        // Send In-App Notification for order creation
        if (normalizedPaymentMethod !== 'card' && normalizedPaymentMethod !== 'bank_transfer' && normalizedPaymentMethod !== 'afriexchange') {
            // Probably COD or other method not handled yet
            await notificationService.sendInApp(
                userId.toString(),
                'order_update',
                'Order Placed',
                `Your order #${orderNumber} has been placed.`,
                `/orders/${order._id}`
            );
        } else if (normalizedPaymentMethod === 'afriexchange') {
            await notificationService.sendInApp(
                userId.toString(),
                'order_update',
                'AfriExchange Payment Started',
                `Your order #${orderNumber} is waiting for AfriExchange payment confirmation.`,
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
        let order = await findOrderByReference(reference as string);

        console.log(`🔍 [Verify] DB Lookup: ${order ? 'Found' : 'Not Found'} | Status: ${order?.paymentStatus}`);

        // If order already paid, return immediately
        if (order && order.paymentStatus === 'paid') {
            res.status(200).json({ status: 'success', data: { order: getVerificationOrderData(order) } });
            return;
        }

        if (order?.paymentMethod === 'afriexchange') {
            res.status(202).json({
                status: 'pending',
                data: {
                    order,
                    provider: 'afriexchange'
                }
            });
            return;
        }

        // 2. Extra safety for Dev Mode: 
        if (order && isDevMode && (reference as string).startsWith('ORD-')) {
            console.log(`⚠️  [Verify] Dev Mode auto-confirm for ${reference}`);
            if (order.paymentStatus !== 'paid') {
                await markOrderAsPaid({
                    order,
                    paymentReference: order.paymentReference || `DEV-${Date.now()}`,
                    paymentStatusSource: 'Payment Hook',
                    userIdForNotification: order.user.toString(),
                    notificationTitle: 'Payment Confirmed',
                    notificationMessage: `Payment for order #${order.orderNumber} has been verified.`
                });
            }
            res.status(200).json({ status: 'success', data: { order: getVerificationOrderData(order) } });
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
                    order = await findOrderByReference(data.reference);
                }

                if (order) {
                    if (order.paymentStatus !== 'paid') {
                        await markOrderAsPaid({
                            order,
                            paymentReference: data.id.toString(),
                            paymentStatusSource: 'Gate 7 Distribution',
                            userIdForNotification: order.user.toString(),
                            notificationTitle: 'Payment Confirmed',
                            notificationMessage: `Payment for order #${order.orderNumber} has been verified successfully.`
                        });
                    }

                    res.status(200).json({ status: 'success', data: { order: getVerificationOrderData(order) } });
                    return;
                }
            }
        } catch (error: any) {
            // Handle 404 from paystack if reference is just our order number and they don't know it yet
            console.error('Paystack Verification Error:', error.response?.data?.message || error.message);
        }

        res.status(400).json({
            status: 'fail',
            message: order
                ? 'Payment is still pending. If Paystack charged you, please contact support with this reference.'
                : 'Payment reference was not found. Please contact support with this reference.'
        });
    } catch (error) {
        next(error);
    }
};

export const handleAfriExchangeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body || {});
        const timestamp = req.headers['x-afriexchange-timestamp'] as string | undefined;
        const signature = req.headers['x-afriexchange-signature'] as string | undefined;

        if (!verifyAfriExchangeWebhookSignature({ rawBody, timestamp, signature })) {
            res.status(401).json({ status: 'fail', message: 'Invalid AfriExchange webhook signature' });
            return;
        }

        const payload = JSON.parse(rawBody || '{}');
        const eventType = payload?.event || payload?.type || 'unknown';
        const eventId = payload?.id || payload?.event_id || payload?.data?.id || payload?.data?.event_id;
        const data = payload?.data || {};
        const reference =
            data.reference ||
            data.order_reference ||
            data.metadata?.reference ||
            payload?.reference;
        const transactionId =
            data.transaction_id ||
            data.id ||
            data.transaction?.id;

        const orderFilters: Record<string, string>[] = [];
        if (reference) {
            orderFilters.push(
                { orderNumber: reference },
                { paymentReference: reference },
                { 'afriExchange.reference': reference }
            );
        }
        if (transactionId) {
            orderFilters.push({ 'afriExchange.transactionId': String(transactionId) });
        }

        const order = orderFilters.length
            ? await Order.findOne({ $or: orderFilters })
            : null;

        if (!order) {
            res.status(200).json({ status: 'ignored', message: 'No matching order found' });
            return;
        }

        order.afriExchange = {
            ...(order.afriExchange || {}),
            reference: order.afriExchange?.reference || reference || order.orderNumber,
            transactionId: order.afriExchange?.transactionId || (transactionId ? String(transactionId) : undefined),
            status: eventType,
            lastWebhookEvent: eventType,
            lastWebhookAt: new Date(),
            webhookEvents: order.afriExchange?.webhookEvents || []
        };

        const webhookEvents = order.afriExchange.webhookEvents || [];

        const alreadyProcessedEvent = eventId
            ? webhookEvents.some((event: any) => event.eventId === String(eventId))
            : false;

        if (!alreadyProcessedEvent) {
            webhookEvents.push({
                eventId: eventId ? String(eventId) : undefined,
                type: eventType,
                receivedAt: new Date(),
                status: order.paymentStatus
            });
        }
        order.afriExchange.webhookEvents = webhookEvents;

        if (eventType === 'collection.completed' && order.paymentStatus !== 'paid') {
            order.afriExchange.verifiedAt = new Date();
            await markOrderAsPaid({
                order,
                paymentReference: order.paymentReference || order.orderNumber,
                paymentStatusSource: 'AfriExchange Webhook',
                userIdForNotification: order.user.toString(),
                notificationTitle: 'AfriExchange Payment Confirmed',
                notificationMessage: `AfriExchange confirmed payment for order #${order.orderNumber}.`
            });
        } else {
            await order.save();
        }

        res.status(200).json({ status: 'success' });
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
