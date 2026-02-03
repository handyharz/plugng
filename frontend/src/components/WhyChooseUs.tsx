'use client';

import React from 'react';
import { Shield, RotateCcw, Wallet, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const WhyChooseUs: React.FC = () => {
    const features = [
        {
            icon: Shield,
            title: '100% Authentic',
            description: 'All products are sourced directly from authorized distributors. No fakes, ever.',
            color: 'from-blue-500/20',
            iconColor: 'text-blue-400',
            borderColor: 'border-blue-500/30'
        },
        {
            icon: RotateCcw,
            title: '7-Day Returns',
            description: 'Changed your mind? Return unopened items within 7 days for a full refund.',
            color: 'from-purple-500/20',
            iconColor: 'text-purple-400',
            borderColor: 'border-purple-500/30'
        },
        {
            icon: Wallet,
            title: 'Wallet Bonuses',
            description: 'Load ₦10,000 and get ₦500 free. Zero transaction fees on wallet payments.',
            color: 'from-emerald-500/20',
            iconColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/30'
        },
        {
            icon: Headphones,
            title: '24/7 Support',
            description: 'Our customer support team is always ready to help via WhatsApp, email, or phone.',
            color: 'from-rose-500/20',
            iconColor: 'text-rose-400',
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
                >
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter">
                        Why Choose <span className="text-blue-400">PlugNG</span>?
                    </h2>
                    <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto">
                        We're not just another online store. We're your trusted partner for authentic phone accessories.
                    </p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className={`group relative overflow-hidden glass-card rounded-3xl p-8 border ${feature.borderColor} hover:bg-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                        <div className="relative z-10 space-y-4">
                            {/* Icon */}
                            <div className="inline-flex p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default WhyChooseUs;
