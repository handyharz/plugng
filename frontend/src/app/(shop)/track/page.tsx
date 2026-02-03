'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrackPage() {
    const router = useRouter();
    const [orderNumber, setOrderNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;

        setIsSearching(true);
        // Navigate to tracking results page
        router.push(`/track/${orderNumber.trim()}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pb-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full space-y-12"
            >
                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-500/20">
                        <Package size={48} className="text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
                            Track Your <span className="text-blue-500">Package</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                            Enter your order number to see real-time logistics updates.
                        </p>
                    </div>
                </div>

                {/* Search Form */}
                <form onSubmit={handleTrack} className="space-y-6">
                    <div className="glass-card bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />

                        <div className="space-y-4 relative">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Order Number
                            </label>
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                                <input
                                    type="text"
                                    placeholder="e.g., ORD-1738165..."
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                    className="w-full bg-black/40 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-xl font-black text-white placeholder:text-slate-800 focus:border-blue-500/50 outline-none transition-all shadow-inner uppercase"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSearching || !orderNumber.trim()}
                            className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 shadow-2xl shadow-blue-600/20"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    <span>Track Package</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Help Text */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Find your order number in your confirmation email
                        </p>
                    </div>
                    <p className="text-xs text-slate-600 italic">
                        No login required • Real-time updates • Secure tracking
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
