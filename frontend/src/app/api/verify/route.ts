import { NextResponse } from 'next/server';
import { orderStore } from '@/lib/store';

export async function POST(req: Request) {
    try {
        const { reference } = await req.json();

        if (!reference) {
            return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
        }

        console.log(`Verifying transaction: ${reference}`);

        // Mock Verification
        // In a real app, you would call Paystack/Flutterwave API here
        const order = orderStore.getOrder(reference);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Directly mark as paid for demo purposes
        orderStore.updateStatus(reference, 'paid', 'mock_provider_ref_' + Date.now());
        console.log(`Order ${reference} marked as PAID (Mock)`);

        return NextResponse.json({
            status: 'success',
            message: 'Order verified and updated',
            data: {
                reference,
                status: 'success',
                amount: order.amount,
                currency: 'NGN'
            }
        });

    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
