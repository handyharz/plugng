'use client';

import { useState } from 'react';
import {
    Bell,
    Search,
    User,
    Check,
    Clock,
    ShoppingCart,
    AlertTriangle,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '@/lib/adminApi';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminHeader() {
    const { admin } = useAdminAuth();
    const queryClient = useQueryClient();
    const [showNotifications, setShowNotifications] = useState(false);

    const { data: notificationsData, isLoading } = useQuery({
        queryKey: ['adminNotifications'],
        queryFn: adminApi.getAdminNotifications,
        refetchInterval: 30000 // Poll every 30s
    });

    const markReadMutation = useMutation({
        mutationFn: adminApi.markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
        }
    });

    const notifications = notificationsData?.data || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_order': return <ShoppingCart className="w-4 h-4 text-green-500" />;
            case 'low_stock': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'new_ticket': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 px-8 flex items-center justify-between">
            {/* Search Bar Placeholder */}
            <div className="flex-1 max-w-md">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all relative group"
                    >
                        <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-slate-900 shadow-xl">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-4 w-96 bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Activity Feed</h3>
                                <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-tighter">Mark all read</button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-12 flex justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Bell className="w-8 h-8 text-slate-800 mx-auto mb-4" />
                                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((n: any) => (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
                                            className={`p-5 flex gap-4 transition-all hover:bg-white/5 cursor-pointer border-b border-white/5 ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-blue-500/10' : 'bg-slate-800'}`}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className={`text-xs font-bold leading-tight ${!n.isRead ? 'text-white font-black' : 'text-slate-400'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[9px] text-slate-600 font-bold whitespace-nowrap ml-2">5m ago</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                    {n.message}
                                                </p>
                                                {!n.isRead && (
                                                    <div className="mt-2 flex items-center gap-1.5 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                        Unread Alert
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Link href="/dashboard/activity" className="block p-4 text-center bg-white/5 text-[10px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest border-t border-white/5">
                                View Full Audit Log
                            </Link>
                        </div>
                    )}
                </div>

                {/* Profile Toggle */}
                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-white uppercase italic tracking-tighter">
                            {admin ? `${admin.firstName} ${admin.lastName}` : 'Admin User'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {admin?.role?.replace('_', ' ') || 'Master Access'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20">
                        <div className="w-full h-full rounded-[0.9rem] bg-slate-900 flex items-center justify-center text-white font-bold uppercase text-xs">
                            {admin ? `${admin.firstName[0]}${admin.lastName[0]}` : <User className="w-5 h-5 text-white" />}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
