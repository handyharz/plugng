'use client';

import React from 'react';
import { CreditCard, Wallet, Building2, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const PaymentHighlight: React.FC = () => {
    const paymentMethods = [
        {
            icon: Building2,
            name: 'Bank Transfer',
            discount: '₦200 OFF',
            recommended: true,
            color: 'from-emerald-500/20 to-green-500/20',
            iconColor: 'text-emerald-400'
        },
        {
            icon: Wallet,
            name: 'Wallet',
            discount: 'Zero Fees',
            recommended: false,
            color: 'from-blue-500/20 to-cyan-500/20',
            iconColor: 'text-blue-400'
        },
        {
            icon: CreditCard,
            name: 'Card Payment',
            discount: 'Available',
            recommended: false,
            color: 'from-purple-500/20 to-pink-500/20',
            iconColor: 'text-purple-400'
        }
    ];

    return (
        <section className="px-3 sm:px-6 max-w-[1440px] mx-auto py-6 sm:py-8">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 md:p-12 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10">
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-3 sm:mb-4"
                        >
                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                            <span className="text-[10px] sm:text-xs font-black text-emerald-400 uppercase tracking-wider">
                                Limited Time Offer
                            </span>
                        </motion.div>

                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 uppercase italic tracking-tighter">
                            Save <span className="text-emerald-400">₦200</span> Instantly!
                        </h2>
                        <p className="text-xs sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
                            Pay via Bank Transfer and enjoy automatic discount on every order. Fast, secure, and rewarding.
                        </p>
                    </div>

                    {/* Payment Methods Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {paymentMethods.map((method, index) => (
                            <motion.div
                                key={method.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative overflow-hidden glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${method.recommended
                                    ? 'border-emerald-500/50 ring-2 ring-emerald-500/20'
                                    : 'border-white/10'
                                    } transition-all hover:scale-[1.02]`}
                            >
                                {method.recommended && (
                                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                        <span className="text-[8px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                                            Recommended
                                        </span>
                                    </div>
                                )}

                                <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-50`} />

                                <div className="relative z-10 flex flex-col items-center text-center space-y-3 sm:space-y-4">
                                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 ${method.recommended ? 'ring-2 ring-emerald-500/30' : ''}`}>
                                        <method.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${method.iconColor}`} />
                                    </div>

                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-white mb-1">
                                            {method.name}
                                        </h3>
                                        <div className={`text-xl sm:text-2xl font-black ${method.recommended ? 'text-emerald-400' : 'text-slate-400'
                                            }`}>
                                            {method.discount}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95 group"
                        >
                            Start Shopping
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-400">
                            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Secured by Paystack</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Shield: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

export default PaymentHighlight;
