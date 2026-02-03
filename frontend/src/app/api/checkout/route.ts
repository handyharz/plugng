import { NextResponse } from 'next/server';
import { orderStore } from '@/lib/store';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, email } = body;

        if (!items || !email) {
            return NextResponse.json({ error: 'Missing items or email' }, { status: 400 });
        }

        // 1. Create Order in Internal Database
        const order = orderStore.createOrder(email, items);
        console.log('Backend: Order Created', order.id, order.amount);

        // 2. Mock Payment Initialization (Direct Paystack/Flutterwave would go here)
        // For now, we return a success status and the order details.

        return NextResponse.json({
            status: 'success',
            orderId: order.id,
            amount: order.amount * 100, // Kobo
            currency: 'NGN',
            reference: order.id,
            // In a real app, this would be the URL from Paystack/Flutterwave
            paymentUrl: `/checkout/success?reference=${order.id}`
        });

    } catch (error: any) {
        console.error('Checkout API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
