import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User';
import notificationService from '../services/notificationService';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Initialize wallet top-up
 */
export const initializeTopup = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { amount } = req.body;
        if (!amount || amount < 100) {
            res.status(400).json({ status: 'fail', message: 'Minimum top-up is ₦100' });
            return;
        }

        const topupId = `WLT-${Date.now()}-${amount}-${req.user.id.slice(-4)}`;
        const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
        const isDevMode = !secretKey || secretKey === 'sk_test_placeholder';

        // Dynamic base URL from request origin to support different ports (3000 vs 3005)
        const baseUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';

        let paymentData = null;

        if (isDevMode) {
            // Mock payment data for dev mode
            paymentData = {
                authorization_url: `${baseUrl}/wallet?reference=${topupId}&status=dev_success`,
                access_code: 'mock_code',
                reference: topupId
            };
        } else {
            const paystackResponse = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email: req.user.email,
                    amount: amount * 100,
                    reference: topupId,
                    callback_url: `${baseUrl}/wallet`,
                    metadata: {
                        type: 'wallet_topup',
                        userId: req.user.id
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            paymentData = paystackResponse.data.data;
        }

        res.status(200).json({
            status: 'success',
            data: {
                paymentUrl: paymentData.authorization_url,
                reference: paymentData.reference
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify wallet top-up
 */
export const verifyTopup = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { reference } = req.query;
        if (!reference) {
            res.status(400).json({ status: 'fail', message: 'Reference is required' });
            return;
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
        const isDevMode = (!secretKey || secretKey === 'sk_test_placeholder') || (reference as string).startsWith('WLT-');

        let amount = 0;

        // Check if this reference has already been processed (prevent double credit)
        const userWithRef = await User.findOne({
            _id: req.user.id,
            'wallet.transactions.description': { $regex: reference as string }
        });

        if (userWithRef) {
            res.status(200).json({ status: 'success', message: 'Already processed', balance: userWithRef.wallet.balance });
            return;
        }

        if (isDevMode && (reference as string).startsWith('WLT-')) {
            // In dev mode, extract amount from reference: WLT-timestamp-amount-suffix
            const parts = (reference as string).split('-');
            if (parts.length >= 3) {
                amount = parseFloat(parts[2] || '5000') || 5000;
            } else {
                amount = 5000;
            }
        } else {
            const paystackResponse = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
                }
            );

            const data = paystackResponse.data.data;
            if (data.status !== 'success') {
                res.status(400).json({ status: 'fail', message: 'Payment not successful' });
                return;
            }
            amount = data.amount / 100;
        }

        // No bonus - replaced with wallet-only discounts on select products
        const totalCredit = amount;

        // Credit the wallet
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $inc: { 'wallet.balance': totalCredit },
                $push: {
                    'wallet.transactions': {
                        type: 'credit',
                        amount: totalCredit,
                        description: `Wallet Top-up (Ref: ${reference})`,
                        date: new Date()
                    }
                }
            },
            { new: true }
        );

        // Send In-App Notification
        await notificationService.sendInApp(
            req.user.id,
            'wallet_update',
            'Wallet Funded',
            `Your wallet has been credited with ₦${totalCredit.toLocaleString()}. New balance: ₦${updatedUser?.wallet.balance.toLocaleString()}. Look out for exclusive wallet-only deals!`,
            '/profile?tab=wallet'
        );

        res.status(200).json({
            status: 'success',
            message: 'Wallet funded successfully',
            data: {
                balance: updatedUser?.wallet.balance,
                transaction: updatedUser?.wallet.transactions.slice(-1)[0]
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get wallet transaction history (paginated)
 */
export const getTransactionHistory = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Use aggregation to paginate the transactions array
        const userWithTransactions = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$wallet.transactions' },
            { $sort: { 'wallet.transactions.date': -1 } },
            {
                $group: {
                    _id: '$_id',
                    transactions: { $push: '$wallet.transactions' },
                    total: { $sum: 1 }
                }
            },
            {
                $project: {
                    total: 1,
                    transactions: { $slice: ['$transactions', skip, limit] }
                }
            }
        ]);

        if (!userWithTransactions || userWithTransactions.length === 0) {
            res.status(200).json({
                status: 'success',
                data: {
                    transactions: [],
                    total: 0,
                    page,
                    pages: 0
                }
            });
            return;
        }

        const data = userWithTransactions[0];

        res.status(200).json({
            status: 'success',
            data: {
                transactions: data.transactions,
                total: data.total,
                page,
                pages: Math.ceil(data.total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};
