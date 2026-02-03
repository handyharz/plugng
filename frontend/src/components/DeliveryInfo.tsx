'use client';

import React from 'react';
import { Truck, MapPin, Clock, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const DeliveryInfo: React.FC = () => {
    const deliveryTiers = [
        {
            tier: 'Tier 1',
            locations: 'Lagos & Abuja',
            duration: '1-2 Days',
            price: '₦1,200',
            icon: '🚀',
            color: 'from-blue-500/20',
            borderColor: 'border-blue-500/30'
        },
        {
            tier: 'Tier 2',
            locations: 'Port Harcourt, Ibadan, Benin, Enugu, Kano',
            duration: '2-3 Days',
            price: '₦1,500',
            icon: '✈️',
            color: 'from-purple-500/20',
            borderColor: 'border-purple-500/30'
        },
        {
            tier: 'Tier 3',
            locations: 'Other State Capitals',
            duration: '3-5 Days',
            price: '₦2,000',
            icon: '🚚',
            color: 'from-emerald-500/20',
            borderColor: 'border-emerald-500/30'
        },
        {
            tier: 'Tier 4',
            locations: 'Rural Areas',
            duration: '5-7 Days',
            price: '₦2,500',
            icon: '📦',
            color: 'from-rose-500/20',
            borderColor: 'border-rose-500/30'
        }
    ];

    return (
        <section className="px-6 max-w-7xl mx-auto py-12 border-t border-white/5">
            <div className="text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4"
                >
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                        Nationwide Delivery
                    </span>
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter">
                    We Deliver <span className="text-blue-400">Everywhere</span>
                </h2>
                <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto">
                    Fast, reliable delivery across all 36 states in Nigeria. Track your order every step of the way.
                </p>
            </div>

            {/* Free Delivery Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card rounded-3xl p-6 md:p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-green-500/10 mb-8 text-center"
            >
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-500/20">
                            <Gift className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-2xl md:text-3xl font-black text-white">
                                FREE DELIVERY
                            </div>
                            <div className="text-sm text-slate-300">
                                On orders above <span className="text-emerald-400 font-bold">₦5,000</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-12 bg-white/10" />

                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-blue-500/20">
                            <Clock className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-lg md:text-xl font-black text-white">
                                SAME-DAY DELIVERY
                            </div>
                            <div className="text-sm text-slate-300">
                                Lagos only • Order before <span className="text-blue-400 font-bold">2pm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Delivery Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {deliveryTiers.map((tier, index) => (
                    <motion.div
                        key={tier.tier}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className={`glass-card rounded-2xl p-6 border ${tier.borderColor} hover:bg-white/5 transition-all hover:scale-[1.02] relative overflow-hidden group`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                                {tier.icon}
                            </div>

                            {/* Tier Name */}
                            <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                                {tier.tier}
                            </div>

                            {/* Locations */}
                            <div className="flex items-start gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm font-bold text-white leading-tight">
                                    {tier.locations}
                                </div>
                            </div>

                            {/* Duration & Price */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs text-slate-400 font-medium">
                                        {tier.duration}
                                    </span>
                                </div>
                                <div className="text-lg font-black text-white">
                                    {tier.price}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                    Delivery times are estimates and may vary based on location and order volume.
                </p>
            </div>
        </section>
    );
};

export default DeliveryInfo;
