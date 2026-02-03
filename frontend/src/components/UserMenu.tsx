'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Package, CreditCard, ChevronDown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const menuItems = [
        { label: 'Profile', icon: User, href: '/profile' },
        { label: 'My Orders', icon: Package, href: '/orders' },
        { label: 'Wallet', icon: CreditCard, href: '/wallet' },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 p-1 pl-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/50 transition-all group"
            >
                <div className="flex flex-col items-end hidden lg:block">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{user.firstName}</span>
                    <span className="text-[8px] font-bold text-blue-500 uppercase tracking-[0.2em]">
                        {user.phoneVerified ? 'Verified' : 'Unverified'}
                    </span>
                </div>
                <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <User size={16} />
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header Info */}
                        <div className="px-4 py-3 mb-2 border-b border-white/5 bg-white/5 rounded-xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated As</p>
                            <p className="text-sm font-bold text-white truncate">{user.email}</p>
                            <div className="flex items-center mt-1 text-[8px] font-black text-blue-500 uppercase tracking-wider">
                                <ShieldCheck size={10} className="mr-1" />
                                {user.role} Account
                            </div>
                        </div>

                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                                >
                                    <item.icon size={16} className="text-slate-500 group-hover:text-blue-500" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            <div className="h-px bg-white/5 my-1" />

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all group"
                            >
                                <LogOut size={16} className="text-red-400/50 group-hover:text-red-400" />
                                <span className="uppercase tracking-widest">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
