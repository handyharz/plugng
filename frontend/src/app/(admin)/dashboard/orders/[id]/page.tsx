'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Printer,
    Truck,
    CreditCard,
    MapPin,
    User,
    Package,
    Save,
    AlertCircle,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { getOrderById, updateOrderStatus, updateOrderTracking } from '@/lib/adminApi';
import { AdminOrder } from '@/types/admin';
import StatusModal from '@/components/ui/StatusModal';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const orderId = params.id as string;

    const [status, setStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const showStatus = (type: 'success' | 'error', title: string, message: string) => {
        setStatusModal({ isOpen: true, type, title, message });
    };

    const { data: order, isLoading } = useQuery({
        queryKey: ['adminOrder', orderId],
        queryFn: () => getOrderById(orderId),

    });

    const updateStatusMutation = useMutation({
        mutationFn: (data: any) => updateOrderStatus(orderId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrder', orderId] });
            setIsEditing(false);
            showStatus('success', 'Order Updated', 'The order status and details have been updated successfully.');
        },
        onError: (error: any) => {
            showStatus('error', 'Update Failed', error.response?.data?.message || 'We encountered an error updating this order.');
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!order || !order.data) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
                <Link href="/dashboard/orders" className="text-blue-400 hover:text-blue-300">
                    Back to Orders
                </Link>
            </div>
        );
    }

    // Type casting for cleanliness in TSX
    const typedOrder = order.data as AdminOrder;

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateStatusMutation.mutate({
            status: status || typedOrder.deliveryStatus,
            adminNote: adminNote || undefined,
            trackingNumber: trackingNumber || undefined
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-8 mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/orders"
                        className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            Order #{typedOrder.orderNumber}
                            <span className={`text-sm px-3 py-1 rounded-full border ${typedOrder.paymentStatus === 'paid'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                {typedOrder.paymentStatus?.toUpperCase()}
                            </span>
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatDate(typedOrder.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Invoice
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(!isEditing);
                            setStatus(typedOrder.deliveryStatus);
                            setAdminNote(typedOrder.adminNote || '');
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                    >
                        {isEditing ? 'Cancel Edit' : 'Edit Order'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-500" />
                                Order Items
                            </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {typedOrder.items.map((item, index) => (
                                <div key={index} className="p-6 flex items-start gap-4">
                                    <div className="w-20 h-20 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.product?.name || item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1e293b/white?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <Package className="w-8 h-8 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white mb-1">{item.product?.name}</h4>
                                        <p className="text-sm text-slate-400 mb-2">
                                            {formatCurrency(item.price)} × {item.quantity}
                                        </p>
                                        {item.variant && (
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/10">
                                                    Color: {item.variant.color}
                                                </span>
                                                <span className="px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/10">
                                                    Size: {item.variant.size}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right font-medium text-white">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-950/50 border-t border-white/10 space-y-2">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal</span>
                                <span>{formatCurrency(typedOrder.subtotal || typedOrder.total)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Shipping</span>
                                <span>{formatCurrency(typedOrder.shippingCost || 0)}</span>
                            </div>
                            <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-white/10 mt-4">
                                <span>Total</span>
                                <span>{formatCurrency(typedOrder.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Activity */}
                    <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                Logistics Timeline
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                                {typedOrder.trackingEvents?.slice().reverse().map((event, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        {/* Icon */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:border-blue-500/50">
                                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
                                        </div>
                                        {/* Content */}
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center justify-between mb-1">
                                                <time className="text-[10px] font-bold text-slate-500 uppercase">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </time>
                                                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-white/10 uppercase italic">
                                                    {event.location}
                                                </span>
                                            </div>
                                            <div className="text-white font-bold text-sm uppercase tracking-tight">{event.status.replace('_', ' ')}</div>
                                            <div className="text-xs text-slate-500 mt-1 italic leading-relaxed">"{event.message}"</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Management Card */}
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-500" />
                            Fulfillment
                        </h3>

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Tracking Number
                                    </label>
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter tracking number"
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Admin Note
                                    </label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Private note for admins..."
                                        rows={3}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={updateStatusMutation.isPending}
                                    className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {updateStatusMutation.isPending ? 'Saving...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Update Order
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${typedOrder.deliveryStatus === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            typedOrder.deliveryStatus === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                typedOrder.deliveryStatus === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            }`}>
                                            {typedOrder.deliveryStatus?.charAt(0).toUpperCase() + typedOrder.deliveryStatus?.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                {typedOrder.adminNote && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                        <p className="text-xs text-amber-500 font-bold mb-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Admin Note
                                        </p>
                                        <p className="text-sm text-amber-200">{typedOrder.adminNote}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Customer Info */}
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-500" />
                            Customer
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
                                    {(typedOrder.user?.firstName?.[0] || typedOrder.shippingAddress?.fullName?.[0])}
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {typedOrder.user
                                            ? `${typedOrder.user.firstName} ${typedOrder.user.lastName}`
                                            : typedOrder.shippingAddress.fullName
                                        }
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {typedOrder.user?.email || 'Guest User'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Shipping Address
                                </h4>
                                <div className="text-sm text-slate-300 leading-relaxed pl-6 border-l-2 border-slate-800">
                                    <p>{typedOrder.shippingAddress.fullName}</p>
                                    <p>{typedOrder.shippingAddress.address}</p>
                                    <p>{typedOrder.shippingAddress.city}, {typedOrder.shippingAddress.state}</p>
                                    {typedOrder.shippingAddress.landmark && <p>{typedOrder.shippingAddress.landmark}</p>}
                                    <p className="mt-1">{typedOrder.shippingAddress.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />
        </div>
    );
}
