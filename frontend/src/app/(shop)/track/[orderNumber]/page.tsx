'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trackingApi } from '@/lib/api';
import {
    Package, MapPin, Clock, CheckCircle2, AlertCircle,
    ChevronLeft, Truck, Calendar, Lock, Mail, Phone, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackingResultsPage() {
    const { orderNumber } = useParams();
    const router = useRouter();
    const [trackingData, setTrackingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyMethod, setVerifyMethod] = useState<'email' | 'phone'>('email');
    const [verifyValue, setVerifyValue] = useState('');
    const [verifyError, setVerifyError] = useState('');

    useEffect(() => {
        fetchTracking();
    }, [orderNumber]);

    const fetchTracking = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await trackingApi.getPublicTracking(orderNumber as string);
            setTrackingData(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Order not found. Please check your order number.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setVerifyError('');
        try {
            const credentials = verifyMethod === 'email'
                ? { email: verifyValue }
                : { phone: verifyValue };
            const data = await trackingApi.verifyAndTrack(orderNumber as string, credentials);
            setTrackingData(data);
            setShowVerifyModal(false);
            setVerifyValue('');
            setVerifyError('');
        } catch (err: any) {
            setVerifyError(err.response?.data?.message || 'Verification failed. The provided information does not match our records.');
        } finally {
            setVerifying(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'shipped': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 size={48} className="animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Loading tracking info...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 border border-red-500/20">
                    <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white uppercase italic">Order Not Found</h1>
                    <p className="text-slate-500 text-sm max-w-md">{error}</p>
                </div>
                <button
                    onClick={() => router.push('/track')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-5xl mx-auto px-6 pt-10 pb-32 space-y-12">
                {/* Header */}
                <div className="space-y-6">
                    <button
                        onClick={() => router.push('/track')}
                        className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <ChevronLeft size={14} />
                        <span>Track Another Order</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                                    Order <span className="text-blue-500">#{trackingData.orderNumber}</span>
                                </h1>
                                <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(trackingData.deliveryStatus)}`}>
                                    {trackingData.deliveryStatus}
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                                {trackingData.verified ? 'Verified Tracking' : 'Public Tracking'}
                            </p>
                        </div>

                        {!trackingData.verified && (
                            <button
                                onClick={() => setShowVerifyModal(true)}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-500 hover:bg-blue-600/20 transition-all text-xs font-black uppercase tracking-widest"
                            >
                                <Lock size={16} />
                                <span>View Full Details</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Timeline */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Logistics Timeline */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                                <Truck className="text-blue-500" size={20} />
                                Logistics Timeline
                            </h3>
                            <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />

                                {trackingData.trackingEvents && trackingData.trackingEvents.length > 0 ? (
                                    <div className="space-y-8 relative">
                                        {trackingData.trackingEvents.map((event: any, idx: number) => (
                                            <div key={idx} className="flex gap-6 group">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${idx === 0 ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-900 border-slate-700'} z-10`} />
                                                    {idx < trackingData.trackingEvents.length - 1 && (
                                                        <div className="w-[2px] h-full bg-slate-800 my-1 rounded-full" />
                                                    )}
                                                </div>
                                                <div className="pb-8">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                        <Calendar size={10} />
                                                        {new Date(event.timestamp).toLocaleString()}
                                                    </p>
                                                    <h4 className={`text-md font-black uppercase italic tracking-tight ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>
                                                        {event.status.replace('_', ' ')} @ {event.location}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed italic">"{event.message}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 space-y-4">
                                        <Clock size={48} className="mx-auto text-slate-700" />
                                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No tracking events yet</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Items (if verified) */}
                        {trackingData.verified && trackingData.items && (
                            <section className="space-y-6">
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                                    <Package className="text-blue-500" size={20} />
                                    Order Items ({trackingData.items.length})
                                </h3>
                                <div className="space-y-4">
                                    {trackingData.items.map((item: any, idx: number) => (
                                        <div key={idx} className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 border border-white/5 shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow space-y-1">
                                                <h4 className="text-white font-black uppercase italic text-sm line-clamp-1">{item.name}</h4>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-black italic">₦{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-8">
                        {/* Estimated Delivery */}
                        {trackingData.estimatedDelivery && (
                            <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 italic">
                                    <Clock size={16} className="text-blue-500" />
                                    Estimated Delivery
                                </h3>
                                <p className="text-2xl font-black text-white italic">
                                    {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}

                        {/* Shipping Address */}
                        <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 italic">
                                <MapPin size={16} className="text-blue-500" />
                                Delivery Address
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white uppercase">{trackingData.shippingAddress.fullName}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{trackingData.shippingAddress.phone}</p>
                                </div>
                                <div className="text-xs text-slate-400 leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/5">
                                    {trackingData.shippingAddress.address}<br />
                                    {trackingData.shippingAddress.city}, {trackingData.shippingAddress.state}
                                </div>
                                {!trackingData.verified && (
                                    <div className="flex items-center space-x-2 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded-xl border border-yellow-500/20">
                                        <Lock size={12} />
                                        <span className="uppercase tracking-widest">Partial Info - Verify to see full details</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary (if verified) */}
                        {trackingData.verified && (
                            <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 italic">Order Summary</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="text-white">₦{trackingData.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-500">Delivery Fee</span>
                                        <span className="text-white">₦{trackingData.deliveryFee.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Total</span>
                                        <span className="text-2xl font-black text-white italic">₦{trackingData.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {showVerifyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
                        onClick={() => setShowVerifyModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card bg-slate-950 border border-white/10 rounded-[3rem] p-10 max-w-md w-full space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

                            <button
                                onClick={() => setShowVerifyModal(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="space-y-3 relative">
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Verify Identity</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                    Enter your email or phone to view full order details and pricing.
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-6 relative">
                                {/* Method Toggle */}
                                <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setVerifyMethod('email')}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${verifyMethod === 'email' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <Mail size={16} className="inline mr-2" />
                                        Email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVerifyMethod('phone')}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${verifyMethod === 'phone' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <Phone size={16} className="inline mr-2" />
                                        Phone
                                    </button>
                                </div>

                                {/* Input */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        {verifyMethod === 'email' ? 'Email Address' : 'Phone Number'}
                                    </label>
                                    <input
                                        type={verifyMethod === 'email' ? 'email' : 'tel'}
                                        placeholder={verifyMethod === 'email' ? 'your@email.com' : '+234...'}
                                        value={verifyValue}
                                        onChange={(e) => setVerifyValue(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-800 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                                        required
                                    />
                                </div>

                                {/* Error Message */}
                                <AnimatePresence>
                                    {verifyError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                                        >
                                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-red-400 uppercase tracking-widest">Verification Failed</p>
                                                <p className="text-xs text-red-400/80 leading-relaxed">{verifyError}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={verifying}
                                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-2xl shadow-blue-600/20"
                                >
                                    {verifying ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            <span>Verify & View Details</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
