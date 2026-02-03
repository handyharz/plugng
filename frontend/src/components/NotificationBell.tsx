'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Package, Wallet, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/context/NotificationContext';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'payment_success': return <CheckCircle2 className="text-green-500" size={16} />;
            case 'order_update':
            case 'shipped':
            case 'delivered': return <Package className="text-blue-500" size={16} />;
            case 'wallet_update': return <Wallet className="text-purple-500" size={16} />;
            case 'ticket_reply': return <MessageSquare className="text-orange-500" size={16} />;
            default: return <AlertCircle className="text-slate-400" size={16} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors group"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[60]"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-tighter"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell size={32} className="mx-auto text-slate-700 mb-3" />
                                    <p className="text-xs text-slate-500 font-medium tracking-tight">Everything caught up!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                                            className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-blue-600/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 shrink-0">{getIcon(notification.type)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold leading-tight ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[9px] font-medium text-slate-600">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </span>
                                                        {notification.link && (
                                                            <Link
                                                                href={notification.link}
                                                                className="text-[9px] font-bold text-blue-500 flex items-center gap-1 hover:underline"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsOpen(false);
                                                                }}
                                                            >
                                                                VIEW <ExternalLink size={8} />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/profile?tab=notifications"
                            className="p-3 block text-center bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            View All Notifications
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
