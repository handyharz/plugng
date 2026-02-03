'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { walletApi } from '@/lib/api';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Loader2, CheckCircle2, AlertCircle, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

function WalletContent() {
    const { user, setUser } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Pagination state
    const [transactions, setTransactions] = useState<any[]>([]);
    const [txLoading, setTxLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const limit = 5;

    const fetchTransactions = async (page: number) => {
        setTxLoading(true);
        try {
            const data = await walletApi.getTransactionHistory({ page, limit });
            setTransactions(data.transactions);
            setTotalPages(data.pages);
            setTotalTransactions(data.total);
            setCurrentPage(data.page);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setTxLoading(false);
        }
    };

    // Handle Paystack callback
    useEffect(() => {
        const reference = searchParams.get('reference');
        if (reference) {
            verifyTopup(reference);
        } else {
            fetchTransactions(currentPage);
        }
    }, [searchParams, currentPage]);

    const verifyTopup = async (ref: string) => {
        setIsVerifying(true);
        try {
            const data = await walletApi.verifyTopup(ref);
            if (user) {
                // Update local user state with new balance
                setUser({
                    ...user,
                    wallet: {
                        ...user.wallet,
                        balance: data.balance
                    }
                });
                // Re-fetch transactions to show the new one
                fetchTransactions(1);
            }
            setMessage({ type: 'success', text: `Wallet successfully funded with ₦${data.transaction.amount.toLocaleString()}!` });

            // Clean URL params
            router.replace('/wallet');
        } catch (error) {
            setMessage({ type: 'error', text: 'Payment verification failed. Please contact support.' });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFundWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 100) {
            setMessage({ type: 'error', text: 'Minimum funding amount is ₦100' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const data = await walletApi.initializeTopup(numAmount);
            window.location.href = data.paymentUrl;
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Initialization failed' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin" />
                    <CreditCard className="absolute inset-0 m-auto text-blue-500" size={32} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Verifying Payment</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Securing your credits...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-32 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                        Digital <span className="text-blue-500">Wallet</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Fast, secure checkout power.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="px-8 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] text-right shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <div className="relative">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Available Balance</p>
                            <p className="text-4xl font-black text-white italic tracking-tighter">₦{user?.wallet?.balance?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl border flex items-center space-x-4 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                {/* Funding Form - STICKY */}
                <div className="lg:col-span-1 lg:sticky lg:top-32 space-y-8">
                    <div className="glass-card bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 relative overflow-hidden group">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />

                        <div className="space-y-3 relative">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Fund Account</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Top up your balance instantly via Secure Paystack Gateway.</p>
                        </div>

                        <form onSubmit={handleFundWallet} className="space-y-8 relative">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Top-up Amount (₦)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xl">₦</span>
                                    <input
                                        type="number"
                                        placeholder="Min. 100"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-[2rem] py-6 pl-12 pr-8 text-2xl font-black text-white placeholder:text-slate-800 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                                        required
                                        min="100"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 shadow-2xl"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                <span>Inject Credits</span>
                            </button>
                        </form>

                        <div className="grid grid-cols-3 gap-4 relative">
                            {[1000, 5000, 10000].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val.toString())}
                                    className="p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white hover:border-blue-500/30 transition-all uppercase tracking-widest"
                                >
                                    ₦{val.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transaction History - SCROLLABLE FLOW */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                                <History size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Recent Activity</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Logged: {totalTransactions} Transactions</p>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest px-2">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {txLoading && transactions.length === 0 ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-white/5 animate-pulse rounded-3xl" />
                                    ))}
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="glass-card bg-white/5 border border-white/10 rounded-[3rem] p-24 text-center space-y-6">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-800">
                                        <History size={48} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white font-black uppercase italic tracking-tight text-xl">Digital Void Detected</p>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No transaction history found on your account.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {transactions.map((tx: any, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="glass-card bg-white/5 border border-white/5 rounded-[2rem] p-8 flex items-center justify-between group hover:border-blue-500/20 hover:bg-white/[0.08] transition-all duration-300"
                                            >
                                                <div className="flex items-center space-x-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {tx.type === 'credit' ? <ArrowDownLeft size={28} /> : <ArrowUpRight size={28} />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-base font-black text-white italic tracking-tight uppercase">{tx.description}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                            {new Date(tx.date).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`text-2xl font-black italic tracking-tighter ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'
                                                    }`}>
                                                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex justify-center pt-8">
                                            <div className="flex items-center gap-2 bg-white/2 border border-white/5 rounded-2xl p-2">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <WalletContent />
        </Suspense>
    );
}
