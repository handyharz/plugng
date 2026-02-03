'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    MessageSquare,
    ChevronLeft,
    ChevronRight,

} from 'lucide-react';
import Link from 'next/link';
import adminApi from '@/lib/adminApi';

const STATUS_COLORS: Record<string, string> = {
    open: 'text-amber-500 bg-amber-500/10',
    'in-progress': 'text-blue-500 bg-blue-500/10',
    resolved: 'text-green-500 bg-green-500/10',
    closed: 'text-slate-500 bg-slate-500/10',
};

const PRIORITY_COLORS: Record<string, string> = {
    urgent: 'text-red-500 bg-red-500/10',
    high: 'text-orange-500 bg-orange-500/10',
    medium: 'text-blue-400 bg-blue-400/10',
    low: 'text-slate-400 bg-slate-400/10',
};

export default function SupportPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const [priority, setPriority] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['adminTickets', page, status, priority],
        queryFn: () => adminApi.getTickets({ page, status, priority }),
    });

    const tickets = data?.data || [];
    const meta = data?.meta || { total: 0, totalPages: 1 };

    return (
        <div className="p-8 mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-blue-500" />
                        Support Center
                    </h1>
                    <p className="text-slate-400">Manage and respond to customer inquiries</p>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex bg-slate-900 border border-white/10 rounded-lg p-1">
                    {['all', 'open', 'in-progress', 'resolved'].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatus(s); setPage(1); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${status === s ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {s.replace('-', ' ')}
                        </button>
                    ))}
                </div>
                <div className="flex bg-slate-900 border border-white/10 rounded-lg p-1">
                    {['all', 'low', 'medium', 'high', 'urgent'].map((p) => (
                        <button
                            key={p}
                            onClick={() => { setPriority(p); setPage(1); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${priority === p ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject & ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic text-sm">
                                        Loading support tickets...
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic text-sm">
                                        No tickets match your filters.
                                    </td>
                                </tr>
                            ) : tickets.map((ticket: any) => (
                                <tr key={ticket._id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/support/${ticket._id}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase truncate max-w-[200px]">
                                                {ticket.subject}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">#{ticket._id.slice(-8)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-blue-400 font-bold border border-white/5">
                                                {ticket.user?.firstName?.[0]}{ticket.user?.lastName?.[0]}
                                            </div>
                                            <span className="text-xs text-slate-300">
                                                {ticket.user?.firstName} {ticket.user?.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-slate-400">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-600 italic">
                                                {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/10">
                    <p className="text-xs text-slate-500">
                        {meta.total} total inquiries
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-30 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-30 hover:text-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
