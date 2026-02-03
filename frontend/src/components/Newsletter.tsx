'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { newsletterApi } from '@/lib/api';

const Newsletter: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address');
            return;
        }

        setStatus('loading');

        try {
            const response = await newsletterApi.subscribe(email);

            if (response.success) {
                setStatus('success');
                setMessage(response.message || 'Success! Check your email for your ₦500 discount code.');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(response.message || 'Something went wrong. Please try again.');
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to connect to the server. Please try again later.');
        }
    };

    return (
        <section className="px-6 max-w-7xl mx-auto py-12 border-t border-white/5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden"
            >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    {/* Icon */}
                    <div className="inline-flex p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-6">
                        <Mail className="w-8 h-8 text-blue-400" />
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 uppercase italic tracking-tighter">
                        Get ₦500 <span className="text-blue-400">Off</span>
                    </h2>
                    <p className="text-base md:text-lg text-slate-300 mb-8">
                        Subscribe to our newsletter and get ₦500 off your first order. Plus, be the first to know about exclusive deals and new arrivals.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    disabled={status === 'loading' || status === 'success'}
                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className="px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="hidden sm:inline">Subscribing...</span>
                                    </>
                                ) : status === 'success' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="hidden sm:inline">Subscribed!</span>
                                    </>
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        </div>

                        {/* Status Messages */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`mt-4 flex items-center justify-center gap-2 text-sm ${status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                                        }`}
                                >
                                    {status === 'success' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4" />
                                    )}
                                    <span>{message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    {/* Privacy Note */}
                    <p className="text-xs text-slate-500 mt-6">
                        We respect your privacy. Unsubscribe at any time. No spam, ever.
                    </p>
                </div>
            </motion.div>
        </section>
    );
};

export default Newsletter;
