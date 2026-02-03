'use client';

import { useState, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    User,
    Database,
    Clock,
    Tag,
    Info,
    Shield,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import adminApi from '@/lib/adminApi';
import ActivityStats from '@/components/admin/activity/ActivityStats';
import ActivityFilters from '@/components/admin/activity/ActivityFilters';
import ChangeDiffViewer from '@/components/admin/activity/ChangeDiffViewer';

const ACTION_COLORS: Record<string, string> = {
    create: 'text-green-400 bg-green-500/10 border-green-500/20',
    update: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    delete: 'text-red-400 bg-red-500/10 border-red-500/20',
    bulk_update: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    wallet_adjust: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    login: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    status_change: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    inventory_adjust: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
};

const RESOURCE_ICONS: Record<string, any> = {
    product: Database,
    order: Clock,
    user: User,
    coupon: Tag,
    ticket: Info,
    system: Shield,
};

export default function ActivityLogPage() {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        resource: 'all',
        action: 'all',
        search: '',
        startDate: null as Date | null,
        endDate: null as Date | null
    });
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const limit = 20;

    const { data: activityData, isLoading } = useQuery({
        queryKey: ['adminActivity', page, filters],
        queryFn: () => adminApi.getAdminActivity({
            page,
            limit,
            resource: filters.resource,
            action: filters.action,
            search: filters.search,
            startDate: filters.startDate,
            endDate: filters.endDate
        })
    });

    const activities = activityData?.data || [];
    const meta = activityData?.meta || { total: 0, totalPages: 1 };
    const stats = activityData?.stats || { byType: [], byDate: [] };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page on filter change
    };

    const clearFilters = () => {
        setFilters({
            resource: 'all',
            action: 'all',
            search: '',
            startDate: null,
            endDate: null
        });
        setPage(1);
    };

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const formatAction = (action: string) => {
        return action.split('_').join(' ').toUpperCase();
    };

    return (
        <div className="p-8 mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Activity className="w-6 h-6 text-indigo-500" />
                        </div>
                        Admin Activity Audit
                    </h1>
                    <p className="text-slate-400 font-medium pl-1">Monitor, audit, and track secure administrative actions.</p>
                </div>
            </div>

            {/* Visual Analytics */}
            <ActivityStats stats={stats} />

            {/* Filters */}
            <ActivityFilters
                filters={filters}
                onChange={handleFilterChange}
                onClear={clearFilters}
            />

            {/* Activities List */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Admin Agent</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Action Type</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Resource</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                                <th className="px-6 py-5 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : activities.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                                <Activity className="w-8 h-8 text-slate-600" />
                                            </div>
                                            <p className="text-slate-400 text-lg font-medium">No activity logs found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : activities.map((log: any) => {
                                const Icon = RESOURCE_ICONS[log.resource] || Info;
                                const isExpanded = expandedRows.has(log._id);
                                const hasChanges = log.changes && Object.keys(log.changes || {}).length > 0;

                                return (
                                    <Fragment key={log._id}>
                                        <tr
                                            className={`transition-colors cursor-pointer group ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}
                                            onClick={() => toggleRow(log._id)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]">
                                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs text-white font-bold">
                                                            {log.admin?.firstName?.[0]}{log.admin?.lastName?.[0] || 'A'}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-white font-bold">
                                                            {log.admin?.firstName} {log.admin?.lastName}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono">
                                                            {log.ipAddress || 'Unknown IP'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${ACTION_COLORS[log.action] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
                                                    {formatAction(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm text-slate-300 font-semibold capitalize">{log.resource}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-400 line-clamp-1 group-hover:text-slate-200 transition-colors">
                                                    {log.details}
                                                </p>
                                                {log.resourceId && <span className="text-[10px] text-slate-600 font-mono mt-0.5 block">Ref: {log.resourceId.slice(-8)}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm text-slate-300 font-bold tabular-nums">{new Date(log.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-xs text-slate-500 font-mono">
                                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {hasChanges && (
                                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-white/[0.02] border-b border-white/5">
                                                <td colSpan={6} className="px-0">
                                                    <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                                                        <ChangeDiffViewer changes={log.changes} details={log.details} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/10">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="text-white font-bold">{((page - 1) * limit) + 1}</span> to <span className="text-white font-bold">{Math.min(page * limit, meta.total)}</span> of <span className="text-white font-bold">{meta.total}</span> logs
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 hover:text-white transition-all hover:border-white/20"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-slate-400">
                            Page {page} of {meta.totalPages || 1}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 hover:text-white transition-all hover:border-white/20"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
