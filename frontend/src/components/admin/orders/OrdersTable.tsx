'use client';

import {
    Eye,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Clock,
    Truck,
    Package,
    ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AdminOrder } from '@/types/admin';

interface OrdersTableProps {
    orders: AdminOrder[];
    isLoading: boolean;
    onBulkStatusUpdate?: (orderIds: string[], status: string) => Promise<void>;
}

export default function OrdersTable({ orders, isLoading, onBulkStatusUpdate }: OrdersTableProps) {
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleSelectAll = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(orders.map(o => o._id));
        }
    };

    const toggleSelectOrder = (id: string) => {
        if (selectedOrders.includes(id)) {
            setSelectedOrders(selectedOrders.filter(oId => oId !== id));
        } else {
            setSelectedOrders([...selectedOrders, id]);
        }
    };

    const handleBulkUpdate = async (status: string) => {
        if (!onBulkStatusUpdate || selectedOrders.length === 0) return;
        setIsUpdating(true);
        try {
            await onBulkStatusUpdate(selectedOrders, status);
            setSelectedOrders([]);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string, type: 'payment' | 'delivery') => {
        if (type === 'payment') {
            switch (status) {
                case 'paid': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Paid</span>;
                case 'pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
                case 'failed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Failed</span>;
                case 'refunded': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">Refunded</span>;
                default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
            }
        } else {
            switch (status) {
                case 'delivered': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</span>;
                case 'shipped': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"><Truck className="w-3 h-3 mr-1" /> Shipped</span>;
                case 'processing': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><Package className="w-3 h-3 mr-1" /> Processing</span>;
                case 'pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
                case 'cancelled': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
                default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
            }
        }
    };

    if (isLoading) {
        return (
            <div className="bg-slate-900 border border-white/10 rounded-xl p-8 text-center text-slate-400">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-slate-800 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-slate-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-slate-900 border border-white/10 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                    Try adjusting your search or filters to find what you're looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-white/10 bg-slate-800 text-blue-600 focus:ring-blue-500/20 transition-colors"
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfillment</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                            <tr key={order._id} className={`hover:bg-white/5 transition-colors group ${selectedOrders.includes(order._id) ? 'bg-blue-500/5' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order._id)}
                                        onChange={() => toggleSelectOrder(order._id)}
                                        className="w-4 h-4 rounded border-white/10 bg-slate-800 text-blue-600 focus:ring-blue-500/20 transition-colors"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-sm font-medium text-white">#{order.orderNumber}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white">
                                            {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.shippingAddress.fullName}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {order.user?.email || 'Guest User'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {formatCurrency(order.total)}
                                    <span className="text-slate-500 text-xs ml-1">({order.items.length} items)</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(order.paymentStatus, 'payment')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(order.deliveryStatus, 'delivery')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/dashboard/orders/${order._id}`}
                                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bulk Action Bar */}
            {selectedOrders.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
                    <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-blue-500/10 flex items-center gap-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                {selectedOrders.length}
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-tighter">Orders Selected</span>
                        </div>

                        <div className="h-8 w-px bg-white/10"></div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkUpdate('processing')}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                Process
                            </button>
                            <button
                                onClick={() => handleBulkUpdate('shipped')}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                Ship
                            </button>
                            <button
                                onClick={() => handleBulkUpdate('delivered')}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-xs font-black text-green-400 uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                Complete
                            </button>
                            <button
                                onClick={() => setSelectedOrders([])}
                                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
