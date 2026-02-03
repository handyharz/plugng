'use client';

import React, { useState, useEffect } from 'react';
import { orderApi } from '@/lib/api';
import {
    Package, ChevronRight, Clock, CheckCircle2,
    AlertCircle, ShoppingBag, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const limit = 5;

    const fetchOrders = async (page: number) => {
        setIsLoading(true);
        try {
            const data = await orderApi.getMyOrders({ page, limit });
            setOrders(data.orders);
            setTotalPages(data.pages);
            setTotalOrders(data.total);
            setCurrentPage(data.page);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    if (isLoading && orders.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
                <div className="h-12 w-48 bg-white/5 animate-pulse rounded-xl" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 pt-3 pb-32 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                        My <span className="text-blue-500">Orders</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                        Track and manage your <span className="text-white">{totalOrders}</span> recent purchases.
                    </p>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest px-2">
                            Page {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-600">
                        <ShoppingBag size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase italic">No orders found</h3>
                        <p className="text-slate-500 text-sm">You haven't placed any orders yet.</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {orders.map((order, index) => (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/30 transition-all"
                                >
                                    <div className="p-8 flex flex-col md:flex-row md:items-center gap-8">
                                        {/* Status Icon */}
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${order.deliveryStatus === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                            order.deliveryStatus === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {order.deliveryStatus === 'delivered' ? <CheckCircle2 size={32} /> :
                                                order.deliveryStatus === 'cancelled' ? <AlertCircle size={32} /> :
                                                    <Clock size={32} className="animate-pulse" />}
                                        </div>

                                        {/* Order Info */}
                                        <div className="flex-grow space-y-1">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">#{order.orderNumber}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                <span className="text-[10px] font-bold text-slate-400 capitalize">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase italic truncate max-w-md">
                                                {order.items[0].name} {order.items.length > 1 && <span className="text-blue-500 text-xs ml-1">+ {order.items.length - 1} More</span>}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                <StatusBadge status={order.paymentStatus} label="Payment" />
                                                <StatusBadge status={order.deliveryStatus} label="Shipment" />
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="text-right shrink-0 space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                                                <p className="text-3xl font-black text-white italic">₦{order.total.toLocaleString()}</p>
                                            </div>
                                            <Link
                                                href={`/orders/${order._id}`}
                                                className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors group-hover:translate-x-1 duration-300"
                                            >
                                                <span>View Details</span>
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Item Previews */}
                                    <div className="px-8 pb-8 flex space-x-3">
                                        {order.items.slice(0, 4).map((item: any, i: number) => (
                                            <div key={i} className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 overflow-hidden group-hover:border-blue-500/20 transition-all">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Bottom Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center pt-8">
                            <div className="flex items-center gap-2 bg-white/2 border border-white/5 rounded-2xl p-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-[10px] font-black text-slate-500 hover:text-white disabled:opacity-20 transition-all uppercase tracking-widest"
                                >
                                    Prev
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === page ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-[10px] font-black text-slate-500 hover:text-white disabled:opacity-20 transition-all uppercase tracking-widest"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
    const getColor = (s: string) => {
        switch (s) {
            case 'paid':
            case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'failed':
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${getColor(status)} shadow-sm`}>
            {label}: {status}
        </div>
    );
}
