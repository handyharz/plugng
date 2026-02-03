'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Download, Plus, CreditCard, Clock, CheckCircle2, XSquare } from 'lucide-react';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import { getAllOrders, bulkUpdateOrderStatus } from '@/lib/adminApi';
import StatusModal from '@/components/ui/StatusModal';

export default function OrdersPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const [paymentStatus, setPaymentStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

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

    const bulkUpdateMutation = useMutation({
        mutationFn: ({ ids, status }: { ids: string[], status: string }) =>
            bulkUpdateOrderStatus(ids, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            showStatus('success', 'Orders Updated', data.message || 'The selected orders has been updated.');
        },
        onError: (error: any) => {
            showStatus('error', 'Update Failed', error.response?.data?.message || 'We encountered an error updating these orders.');
        }
    });

    const handleBulkStatusUpdate = async (ids: string[], status: string) => {
        return bulkUpdateMutation.mutateAsync({ ids, status });
    };

    // Debounce search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        // Simple debounce
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const handleExport = () => {
        if (!ordersData?.data) return;

        const headers = ['Order #', 'Customer', 'Date', 'Total', 'Payment Status', 'Delivery Status'];
        const csvContent = [
            headers.join(','),
            ...ordersData.data.map((order: any) => [
                order.orderNumber,
                order.user?.email || 'N/A',
                new Date(order.createdAt).toLocaleDateString(),
                order.total,
                order.paymentStatus,
                order.deliveryStatus
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['adminOrders', page, status, paymentStatus, debouncedSearch],
        queryFn: () => getAllOrders({
            page,
            limit: 20,
            deliveryStatus: status === 'all' ? undefined : status,
            paymentStatus: paymentStatus === 'all' ? undefined : paymentStatus,
            search: debouncedSearch
        })
    });

    const statusFilters = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' }
    ];

    const paymentFilters = [
        { label: 'All', value: 'all' },
        { label: 'Paid', value: 'paid' },
        { label: 'Unpaid', value: 'pending' },
        { label: 'Failed', value: 'failed' }
    ];

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
                    <p className="text-slate-400">Manage and track customer orders</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between">
                <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 no-scrollbar">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => {
                                setStatus(filter.value);
                                setPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all whitespace-nowrap ${status === filter.value
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-slate-900 border border-white/10 text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 no-scrollbar items-center">
                    <span className="text-[10px] font-black uppercase text-slate-600 mr-2 tracking-widest">Payment</span>
                    {paymentFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => {
                                setPaymentStatus(filter.value);
                                setPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all whitespace-nowrap ${paymentStatus === filter.value
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-900 border border-white/10 text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={handleSearch}
                        className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            <OrdersTable
                orders={ordersData?.data || []}
                isLoading={isLoading}
                onBulkStatusUpdate={handleBulkStatusUpdate}
            />

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />

            {/* Pagination */}
            {ordersData?.meta && (
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-medium text-white">{((page - 1) * 20) + 1}</span> to <span className="font-medium text-white">{Math.min(page * 20, ordersData.meta.total)}</span> of <span className="font-medium text-white">{ordersData.meta.total}</span> orders
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= ordersData.meta.totalPages}
                            className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
