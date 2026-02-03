'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminApi from '@/lib/adminApi';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Users,
    AlertTriangle,
    CheckCircle,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import Link from 'next/link';

export default function WalletPage() {
    const [transactionFilter, setTransactionFilter] = useState<string>('');

    // Fetch Wallet Stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['walletStats'],
        queryFn: adminApi.getWalletStats
    });

    // Fetch Payment Comparison
    const { data: comparisonData, isLoading: comparisonLoading } = useQuery({
        queryKey: ['walletComparison'],
        queryFn: adminApi.getWalletPaymentComparison
    });

    // Fetch Top Holders
    const { data: topHoldersData, isLoading: holdersLoading } = useQuery({
        queryKey: ['topWalletHolders'],
        queryFn: adminApi.getTopWalletHolders
    });

    // Fetch Transactions
    const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
        queryKey: ['walletTransactions', transactionFilter],
        queryFn: () => adminApi.getWalletTransactions({ type: transactionFilter || undefined })
    });

    const stats = statsData?.data || {
        totalLiability: 0,
        utilizationRate: 0,
        topUps: { total: 0, count: 0, average: 0 },
        spending: { total: 0, count: 0, average: 0 },
        netGrowth: 0,
        growthPercentage: 0
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Wallet Economics</h1>
                <p className="text-slate-400">Monitor wallet liability, utilization, and transaction flow.</p>
            </div>

            {/* Economics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Total Liability */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm font-medium">Total Liability</span>
                        <div className={`p-2 rounded-lg ${stats.totalLiability > 1000000 ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(stats.totalLiability)}
                    </div>
                    <div className="flex items-center text-xs">
                        {stats.totalLiability > 1000000 ? (
                            <span className="text-red-400 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" /> High Risk
                            </span>
                        ) : (
                            <span className="text-green-400 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" /> Healthy Range
                            </span>
                        )}
                        <span className="text-slate-500 ml-2">Customer funds held</span>
                    </div>
                </div>

                {/* Utilization Rate */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm font-medium">Utilization Rate</span>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {stats.utilizationRate}%
                    </div>
                    <div className="text-xs text-slate-500">
                        Spending vs Total Balance (This Month)
                    </div>
                </div>

                {/* Top-ups Volume */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm font-medium">Top-ups (Month)</span>
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(stats.topUps.total)}
                    </div>
                    <div className="text-xs text-slate-500">
                        {stats.topUps.count} transactions • Avg: {formatCurrency(stats.topUps.average)}
                    </div>
                </div>

                {/* Wallet Spending */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm font-medium">Spending (Month)</span>
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(stats.spending.total)}
                    </div>
                    <div className="text-xs text-slate-500">
                        {stats.spending.count} orders • Avg: {formatCurrency(stats.spending.average)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Payment Method Comparison */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Payment Method Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {comparisonData?.data && Object.entries(comparisonData.data).map(([method, data]: [string, any]) => {
                            if (method === 'cash_on_delivery') return null; // Skip COD if not used heavily
                            return (
                                <div key={method} className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="capitalize text-slate-300 font-medium">
                                            {method.replace('_', ' ')}
                                        </div>
                                        <div className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white">
                                            {data.percentage}% Share
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Revenue</span>
                                            <span className="text-white font-medium">{formatCurrency(data.revenue)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Orders</span>
                                            <span className="text-white font-medium">{data.orders}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Avg Value</span>
                                            <span className="text-white font-medium">{formatCurrency(data.avgValue)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Wallet Holders */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Top Wallet Holders</h2>
                    <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            {topHoldersData?.data?.map((user: any) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{user.name}</div>
                                            <div className="text-xs text-slate-500">Last active: {new Date(user.lastActivity).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">{formatCurrency(user.balance)}</div>
                                        <Link href={`/dashboard/customers/${user.id}`} className="text-[10px] text-blue-400 hover:text-blue-300">
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filterable Transactions Table */}
            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setTransactionFilter('')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!transactionFilter ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setTransactionFilter('credit')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${transactionFilter === 'credit' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            Top-ups
                        </button>
                        <button
                            onClick={() => setTransactionFilter('debit')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${transactionFilter === 'debit' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            Spending
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactionsData?.data?.transactions.map((tx: any, index: number) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                                        {new Date(tx.date).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-white">{tx.userName}</div>
                                        <div className="text-xs text-slate-500">{tx.userEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${tx.type === 'credit'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-orange-500/10 text-orange-400'
                                            }`}>
                                            {tx.type === 'credit' ? <ArrowDownLeft className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-white whitespace-nowrap">
                                        {formatCurrency(tx.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                                        {tx.description}
                                    </td>
                                </tr>
                            ))}
                            {(!transactionsData?.data?.transactions || transactionsData.data.transactions.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No recent transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simple) */}
                {transactionsData?.data?.pages > 1 && (
                    <div className="p-4 border-t border-white/10 flex justify-center">
                        <span className="text-sm text-slate-500">
                            Showing page {transactionsData.data.page} of {transactionsData.data.pages}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
