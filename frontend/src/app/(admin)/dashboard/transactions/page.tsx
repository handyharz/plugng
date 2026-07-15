'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Search, 
    Download, 
    CreditCard, 
    TrendingUp, 
    TrendingDown, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ArrowUpRight, 
    Calendar,
    Wallet,
    DollarSign,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { getAllOrders } from '@/lib/adminApi';
import { format } from 'date-fns';
import Link from 'next/link';

export default function TransactionsPage() {
    const [page, setPage] = useState(1);
    const [paymentStatus, setPaymentStatus] = useState('all');
    const [paymentMethod, setPaymentMethod] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    // Fetch all matching orders to construct ledger
    const { data: ordersData, isLoading, refetch } = useQuery({
        queryKey: ['adminTransactions', page, paymentStatus, paymentMethod, debouncedSearch],
        queryFn: () => getAllOrders({
            page,
            limit: 20,
            paymentStatus: paymentStatus === 'all' ? undefined : paymentStatus,
            paymentMethod: paymentMethod === 'all' ? undefined : paymentMethod,
            search: debouncedSearch
        })
    });

    // Fetch stats via fetching a large batch of orders to build real-time local statistics
    const { data: statsOrdersData } = useQuery({
        queryKey: ['adminTransactionsStats'],
        queryFn: () => getAllOrders({ limit: 1000 }) // Load up to 1000 orders to compute accurate statistics
    });

    const stats = useMemo(() => {
        const orders = statsOrdersData?.data || [];
        
        let totalRevenue = 0;
        let pendingLiability = 0;
        let failedVolume = 0;
        
        const byMethod: Record<string, { revenue: number; count: number }> = {
            card: { revenue: 0, count: 0 },
            wallet: { revenue: 0, count: 0 },
            afriexchange: { revenue: 0, count: 0 },
            bank_transfer: { revenue: 0, count: 0 },
            cash_on_delivery: { revenue: 0, count: 0 }
        };

        orders.forEach((o: any) => {
            const total = o.total || 0;
            const method = o.paymentMethod || 'cash_on_delivery';
            const status = o.paymentStatus || 'pending';

            if (status === 'paid') {
                totalRevenue += total;
                if (byMethod[method]) {
                    byMethod[method].revenue += total;
                    byMethod[method].count += 1;
                }
            } else if (status === 'pending') {
                pendingLiability += total;
            } else if (status === 'failed') {
                failedVolume += total;
            }
        });

        return {
            totalRevenue,
            pendingLiability,
            failedVolume,
            byMethod
        };
    }, [statsOrdersData]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(value);
    };

    const handleExport = () => {
        const ordersToExport = ordersData?.data || [];
        if (ordersToExport.length === 0) return;

        const headers = ['Transaction Date', 'Order #', 'Customer', 'Payment Method', 'Amount (NGN)', 'Reference', 'Status'];
        const csvContent = [
            headers.join(','),
            ...ordersToExport.map((o: any) => [
                format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm'),
                o.orderNumber,
                o.user?.email || 'N/A',
                o.paymentMethod || 'COD',
                o.total || 0,
                o.paymentReference || o.afriExchange?.transactionId || 'N/A',
                o.paymentStatus
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const methodLabels: Record<string, string> = {
        card: 'Card (Paystack)',
        wallet: 'Store Wallet',
        afriexchange: 'AfriExchange',
        bank_transfer: 'Bank Transfer',
        cash_on_delivery: 'COD'
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Transactions Ledger</h1>
                    <p className="text-slate-400">Track, analyze, and reconcile platform payments across all rails.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="p-2 bg-slate-900 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Refresh Ledger"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!ordersData?.data || ordersData.data.length === 0}
                        className="flex items-center px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Ledger
                    </button>
                </div>
            </div>

            {/* Financial Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm font-medium">Total Net Revenue (Paid)</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {formatCurrency(stats.totalRevenue)}
                    </div>
                    <p className="text-xs text-slate-500">Settled funds ready to payout</p>
                </div>

                {/* Pending Liabilities */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm font-medium">Pending Settlement</span>
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {formatCurrency(stats.pendingLiability)}
                    </div>
                    <p className="text-xs text-slate-500">Orders placed awaiting confirmation</p>
                </div>

                {/* Failed / Refunded */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm font-medium">Failed Volume</span>
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {formatCurrency(stats.failedVolume)}
                    </div>
                    <p className="text-xs text-slate-500">Abandoned checkouts or failed rails</p>
                </div>
            </div>

            {/* Breakdown by Payment Rail */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    Volume Share by Payment Rail
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(stats.byMethod).map(([key, data]) => (
                        <div key={key} className="bg-slate-950 border border-white/5 rounded-lg p-4">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{methodLabels[key] || key}</p>
                            <p className="text-lg font-bold text-white mb-1">{formatCurrency(data.revenue)}</p>
                            <p className="text-xs text-slate-400">{data.count} paid orders</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex flex-wrap gap-4">
                    {/* Rail Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Method</span>
                        <select
                            value={paymentMethod}
                            onChange={(e) => {
                                setPaymentMethod(e.target.value);
                                setPage(1);
                            }}
                            className="bg-slate-900 border border-white/10 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Methods</option>
                            <option value="card">Card (Paystack)</option>
                            <option value="wallet">Store Wallet</option>
                            <option value="afriexchange">AfriExchange</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cash_on_delivery">COD</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Status</span>
                        <select
                            value={paymentStatus}
                            onChange={(e) => {
                                setPaymentStatus(e.target.value);
                                setPage(1);
                            }}
                            className="bg-slate-900 border border-white/10 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search reference, order #..."
                        value={search}
                        onChange={handleSearch}
                        className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-xs uppercase tracking-widest font-black text-slate-500">Syncing transaction registry...</p>
                    </div>
                ) : !ordersData?.data || ordersData.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <CreditCard className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="font-bold text-white mb-1">No Transactions Found</p>
                        <p className="text-sm">Try resetting or modifying your ledger search filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-black uppercase text-slate-400 tracking-wider">
                                    <th className="py-4 px-6">Timestamp</th>
                                    <th className="py-4 px-6">Order #</th>
                                    <th className="py-4 px-6">Customer</th>
                                    <th className="py-4 px-6">Payment Rail</th>
                                    <th className="py-4 px-6">Reference / Gateway ID</th>
                                    <th className="py-4 px-6 text-right">Amount</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                {ordersData.data.map((o: any) => {
                                    const dateStr = format(new Date(o.createdAt), 'MMM d, yyyy • h:mm a');
                                    const ref = o.paymentReference || o.afriExchange?.transactionId || '—';
                                    
                                    // rail styles
                                    let railBg = 'bg-slate-800/50 text-slate-400';
                                    if (o.paymentMethod === 'card') railBg = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                                    if (o.paymentMethod === 'wallet') railBg = 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
                                    if (o.paymentMethod === 'afriexchange') railBg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                                    if (o.paymentMethod === 'bank_transfer') railBg = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

                                    // status styles
                                    let statusBg = 'bg-slate-800 text-slate-400';
                                    if (o.paymentStatus === 'paid') statusBg = 'bg-emerald-500/15 text-emerald-400 font-bold';
                                    if (o.paymentStatus === 'pending') statusBg = 'bg-amber-500/15 text-amber-400 font-bold';
                                    if (o.paymentStatus === 'failed') statusBg = 'bg-rose-500/15 text-rose-400 font-bold';
                                    if (o.paymentStatus === 'refunded') statusBg = 'bg-blue-500/15 text-blue-400 font-bold';

                                    return (
                                        <tr key={o._id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="py-4 px-6 whitespace-nowrap text-slate-500 font-medium">
                                                {dateStr}
                                            </td>
                                            <td className="py-4 px-6 font-bold text-white">
                                                <Link 
                                                    href={`/dashboard/orders/${o._id}`}
                                                    className="hover:underline hover:text-blue-400 transition-colors flex items-center gap-1.5"
                                                >
                                                    {o.orderNumber}
                                                    <ExternalLink className="w-3.5 h-3.5 opacity-40" />
                                                </Link>
                                            </td>
                                            <td className="py-4 px-6 max-w-[200px] truncate text-slate-400">
                                                {o.user?.email || 'Guest User'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${railBg}`}>
                                                    {methodLabels[o.paymentMethod] || o.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-slate-500">
                                                <span title={ref} className="block max-w-[180px] truncate">
                                                    {ref}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-black text-white">
                                                {formatCurrency(o.total || 0)}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-xs uppercase tracking-tight ${statusBg}`}>
                                                    {o.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {ordersData?.meta && ordersData.meta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                    <div className="text-sm text-slate-500">
                        Showing page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{ordersData.meta.totalPages}</span>
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
