'use client';

import React, { useEffect, Suspense, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, ShieldCheck, ArrowRight, Package, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { orderApi } from '@/lib/api';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get('reference');
    const { clearCart } = useCart();

    const [status, setStatus] = React.useState<'loading' | 'success' | 'failed'>('loading');
    const [orderNumber, setOrderNumber] = React.useState<string | null>(null);
    const [countdown, setCountdown] = useState(5);
    const hasRun = useRef(false);

    useEffect(() => {
        // Wait for reference to be available before running verification
        if (!reference || hasRun.current) return;
        hasRun.current = true;

        orderApi.verify(reference)
            .then((res: any) => {
                // If it's already an order object, don't try to access .data
                const orderData = res.order || res.data?.order || res;
                setOrderNumber(orderData?.orderNumber || null);

                // Clear cart only AFTER successful verification
                clearCart();
                setStatus('success');
            })
            .catch((err: Error) => {
                console.error('Verification failed', err);
                setStatus('failed');
            });
    }, [reference, clearCart]);

    // Countdown and Auto-Redirect
    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && countdown === 0) {
            router.push('/orders');
        }
    }, [status, countdown, router]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Verifying Transaction...</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="max-w-md mx-auto text-center space-y-6">
                <div className="bg-red-500/10 p-8 rounded-full inline-block">
                    <Package className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Verification Failed</h1>
                <p className="text-slate-400">We couldn't confirm your payment. Please contact support if you believe this is an error.</p>
                <Link href="/" className="inline-block px-8 py-3 bg-white text-black rounded-lg font-bold">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto text-center space-y-10">
            {/* Success Icon Animation */}
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 animate-pulse" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-full shadow-2xl shadow-blue-500/10">
                    <CheckCircle className="w-20 h-20 text-green-400" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10 flex items-center shadow-lg">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                    Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Locked In</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
                    Your transaction has been securely processed and recorded on the ledger.
                </p>

                {/* Auto Redirect Notice with Progress Bar */}
                <div className="max-w-xs mx-auto space-y-3 pt-4">
                    <div className="flex items-center justify-between text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>Redirecting to Dashboard</span>
                        </div>
                        <span>{countdown}s</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-linear"
                            style={{ width: `${(countdown / 5) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Transaction Details Card */}
            <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-8 text-left space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Number</p>
                    <p className="font-mono text-xl text-white tracking-wider truncate">
                        {orderNumber || 'PENDING...'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-dashed border-white/10">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                        <div className="inline-flex items-center space-x-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Paid</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Payment Reference</p>
                        <p className="text-sm font-bold text-white truncate max-w-[120px]">{reference}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                    href="/orders"
                    className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2 group"
                >
                    <Package className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    <span>Go to My Orders</span>
                </Link>
                <Link
                    href="/"
                    className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-white/5 hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
                >
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen py-32 px-6 flex items-center justify-center">
            <Suspense fallback={<div className="text-white">Loading verification...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
