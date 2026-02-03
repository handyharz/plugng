'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';
import {
    Package, MapPin, CreditCard, Clock, CheckCircle2,
    AlertCircle, ChevronLeft, Truck, Calendar, ShoppingBag,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await orderApi.getById(id as string);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 sm:p-12">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-red-500">
                    <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white uppercase italic">Order Not Found</h1>
                    <p className="text-slate-500 text-sm">We couldn't locate the order details for the provided ID.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'delivered': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'cancelled':
            case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-32 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <ChevronLeft size={14} />
                        <span>Return to Orders</span>
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                                Order <span className="text-blue-500">Details</span>
                            </h1>
                            <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.deliveryStatus)}`}>
                                {order.deliveryStatus}
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                            Order Number: <span className="text-white">#{order.orderNumber}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-white italic">₦{order.total.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Tracking & Items */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Items Section */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                            <ShoppingBag className="text-blue-500" size={20} />
                            Order Items ({order.items.length})
                        </h3>
                        <div className="space-y-4">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 border border-white/5 shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-grow space-y-1">
                                        <h4 className="text-white font-black uppercase italic text-sm line-clamp-1">{item.name}</h4>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>SKU: {item.sku}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                        {item.variantAttributes && (
                                            <div className="flex gap-2 mt-2">
                                                {Object.entries(item.variantAttributes).map(([key, val]: any) => (
                                                    <span key={key} className="text-[8px] font-bold bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-slate-400 capitalize">
                                                        {key}: {val}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-black italic">₦{(item.price * item.quantity).toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">₦{item.price.toLocaleString()} ea</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Timeline Tracker */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                            <Truck className="text-blue-500" size={20} />
                            Logistics Timeline
                        </h3>
                        <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />

                            <div className="space-y-8 relative">
                                {order.trackingEvents.slice().reverse().map((event: any, idx: number) => (
                                    <div key={idx} className="flex gap-6 group">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-4 h-4 rounded-full border-2 ${idx === 0 ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-900 border-slate-700'} z-10`} />
                                            {idx < order.trackingEvents.length - 1 && (
                                                <div className="w-[2px] h-full bg-slate-800 my-1 rounded-full" />
                                            )}
                                        </div>
                                        <div className="pb-8 flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar size={10} />
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </p>
                                                {idx === 0 && (
                                                    <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-tighter animate-pulse">
                                                        LATEST Update
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className={`text-md font-black uppercase italic tracking-tight ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>
                                                {event.status.replace('_', ' ')} @ {event.location}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-2 leading-relaxed italic">"{event.message}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Address & Payment */}
                <div className="space-y-8">
                    {/* Summary */}
                    <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 italic">Financial Ledger</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="text-white">₦{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-slate-500">Delivery Fee</span>
                                <span className="text-white">₦{order.deliveryFee.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Total Settled</span>
                                <span className="text-2xl font-black text-white italic">₦{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 italic">
                            <MapPin size={16} className="text-blue-500" />
                            Delivery Terminal
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-black text-white uppercase">{order.shippingAddress.fullName}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">{order.shippingAddress.phone}</p>
                            </div>
                            <div className="text-xs text-slate-400 leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/5">
                                {order.shippingAddress.address}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} State<br />
                                {order.shippingAddress.landmark && <span className="text-blue-500/60 mt-2 block">Landmark: {order.shippingAddress.landmark}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 italic">
                            <CreditCard size={16} className="text-blue-500" />
                            Payment Method
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{order.paymentMethod.replace('_', ' ')}</span>
                                <div className={`px-3 py-0.5 rounded text-[8px] font-black uppercase border ${getStatusColor(order.paymentStatus)}`}>
                                    {order.paymentStatus}
                                </div>
                            </div>
                            {order.paymentReference && (
                                <div className="space-y-1 bg-black/20 p-4 rounded-xl border border-white/5">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Transaction Ref</p>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 break-all">{order.paymentReference}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
