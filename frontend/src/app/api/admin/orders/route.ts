import { NextResponse } from 'next/server';
import { orderStore } from '@/lib/store';

export async function GET() {
    return NextResponse.json(orderStore.getAllOrders());
}
