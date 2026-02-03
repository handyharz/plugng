'use client';

import { Search, Filter, Calendar, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ActivityFiltersProps {
    filters: {
        resource: string;
        action: string;
        search: string;
        startDate: Date | null;
        endDate: Date | null;
    };
    onChange: (key: string, value: any) => void;
    onClear: () => void;
}

const RESOURCES = ['product', 'order', 'user', 'inventory', 'coupon', 'ticket', 'system'];
const ACTIONS = ['create', 'update', 'delete', 'login', 'status_change', 'inventory_adjust'];

export default function ActivityFilters({ filters, onChange, onClear }: ActivityFiltersProps) {
    return (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 mb-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white font-bold">
                    <Filter className="w-4 h-4 text-indigo-500" />
                    Filters
                </div>
                {(filters.resource !== 'all' || filters.action !== 'all' || filters.startDate || filters.search) && (
                    <button
                        onClick={onClear}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={filters.search}
                        onChange={(e) => onChange('search', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>

                {/* Resource Filter */}
                <div className="relative">
                    <select
                        value={filters.resource}
                        onChange={(e) => onChange('resource', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                    >
                        <option value="all">All Resources</option>
                        {RESOURCES.map(r => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                {/* Action Filter */}
                <div className="relative">
                    <select
                        value={filters.action}
                        onChange={(e) => onChange('action', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                    >
                        <option value="all">All Actions</option>
                        {ACTIONS.map(a => (
                            <option key={a} value={a}>{a.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                {/* Date Range - Simplified for now, maybe custom component later */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <DatePicker
                            selected={filters.startDate}
                            onChange={(date: Date | null) => onChange('startDate', date)}
                            placeholderText="Start Date"
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                            dateFormat="MMM d, yyyy"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    </div>
                    <div className="relative flex-1">
                        <DatePicker
                            selected={filters.endDate}
                            onChange={(date: Date | null) => onChange('endDate', date)}
                            placeholderText="End Date"
                            minDate={filters.startDate || undefined}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                            dateFormat="MMM d, yyyy"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
