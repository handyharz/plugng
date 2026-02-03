'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, Gift, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const WalletPromotion: React.FC = () => {
    return (
        <section className="px-6 max-w-7xl mx-auto py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[3rem] p-8 md:p-12 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"
            >
                {/* Animated Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Left Side - Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                                Exclusive Offer
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter">
                            Load Your <span className="text-purple-400">Wallet</span>
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3 justify-center lg:justify-start">
                                <div className="p-2 rounded-lg bg-purple-500/20 mt-1">
                                    <Gift className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xl md:text-2xl font-black text-white">
                                        Get ₦500 Bonus
                                    </div>
                                    <div className="text-sm text-slate-300">
                                        When you load ₦10,000 or more
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 justify-center lg:justify-start">
                                <div className="p-2 rounded-lg bg-emerald-500/20 mt-1">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xl md:text-2xl font-black text-white">
                                        Zero Transaction Fees
                                    </div>
                                    <div className="text-sm text-slate-300">
                                        Pay with wallet and save on every order
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/wallet"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 group"
                        >
                            Top Up Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Right Side - Visual */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            {/* Wallet Icon Illustration */}
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative"
                            >
                                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm">
                                    <Wallet className="w-24 h-24 md:w-32 md:h-32 text-purple-400" />
                                </div>

                                {/* Floating Coins */}
                                <motion.div
                                    animate={{
                                        y: [0, -20, 0],
                                        x: [0, 10, 0],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/50 flex items-center justify-center text-2xl"
                                >
                                    💰
                                </motion.div>

                                <motion.div
                                    animate={{
                                        y: [0, -15, 0],
                                        x: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 3.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5
                                    }}
                                    className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 border border-emerald-500/50 flex items-center justify-center text-xl"
                                >
                                    💸
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default WalletPromotion;
