'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Users,
    Search,
    UserPlus,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Mail,
    Phone,
    Calendar,
    ArrowUpRight,
    MapPin,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { getAllCustomers } from '@/lib/adminApi';

const ROLE_COLORS = {
    customer: 'text-blue-400 bg-blue-400/10',
    admin: 'text-purple-400 bg-purple-400/10',
};

const TIER_COLORS = {
    Enthusiast: 'text-slate-400 bg-slate-400/10',
    Elite: 'text-amber-400 bg-amber-400/10',
    Master: 'text-blue-500 bg-blue-500/10',
};

export default function CustomersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['adminCustomers', page, search],
        queryFn: () => getAllCustomers({ page, search }),
    });

    const customers = data?.data || [];
    const meta = data?.meta || { total: 0, totalPages: 1 };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="p-8 mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-500" />
                        Customer Management
                    </h1>
                    <p className="text-slate-400">View and manage your customer community</p>
                </div>
                {/* Could add Export CSV button here */}
            </div>

            {/* Stats Overview (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <span className="text-slate-400 text-sm">Total Customers</span>
                    <h3 className="text-2xl font-bold text-white mt-1">{meta.total}</h3>
                </div>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <span className="text-slate-400 text-sm">Active This Month</span>
                    <h3 className="text-2xl font-bold text-white mt-1">--</h3>
                </div>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                    <span className="text-slate-400 text-sm">Avg. Lifetime Value</span>
                    <h3 className="text-2xl font-bold text-white mt-1">--</h3>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status & Tier</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Spending</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                        Loading customers...
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : customers.map((customer: any) => (
                                <tr key={customer._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold uppercase">
                                                {customer.firstName[0]}{customer.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{customer.firstName} {customer.lastName}</div>
                                                <div className="text-slate-500 text-xs flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Joined {new Date(customer.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Mail className="w-3 h-3" />
                                                <span>{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                <Phone className="w-3 h-3" />
                                                <span>{customer.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${ROLE_COLORS[customer.role as keyof typeof ROLE_COLORS] || 'text-slate-400 bg-slate-400/10'}`}>
                                                {customer.role}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${TIER_COLORS[customer.loyaltyTier as keyof typeof TIER_COLORS] || 'text-slate-400 bg-slate-400/10'}`}>
                                                {customer.loyaltyTier || 'Standard'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{formatCurrency(customer.totalSpent || 0)}</span>
                                            <span className="text-slate-500 text-xs">{formatCurrency(customer.wallet?.balance || 0)} in wallet</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/customers/${customer._id}`}
                                            className="inline-flex items-center px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            View Profile
                                            <ArrowUpRight className="w-3 h-3 ml-2" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/10">
                    <p className="text-xs text-slate-500 italic">
                        Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, meta.total)} of {meta.total} customers
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
