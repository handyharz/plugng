'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';

interface Order {
    _id: string;
    orderNumber: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    total: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
}

interface RecentOrdersProps {
    orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'delivered':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'pending':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'processing':
            case 'shipped':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'cancelled':
            case 'failed':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                <Link
                    href="/dashboard/orders"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    View All
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-medium">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">
                                                {order.user?.firstName} {order.user?.lastName}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {order.user?.email || 'Guest User'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium">
                                        {formatCurrency(order.total)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border w-fit ${getStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border w-fit ${getStatusColor(order.deliveryStatus)}`}>
                                                {order.deliveryStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/orders/${order._id}`}
                                            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
