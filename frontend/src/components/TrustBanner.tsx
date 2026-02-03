'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Package, Truck, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatProps {
    end: number;
    label: string;
    suffix?: string;
    prefix?: string;
}

const AnimatedStat: React.FC<StatProps> = ({ end, label, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = end / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [end]);

    return (
        <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-white mb-1">
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-bold">
                {label}
            </div>
        </div>
    );
};

const TrustBanner: React.FC = () => {
    const badges = [
        {
            icon: Shield,
            title: '100% Authentic',
            description: 'Genuine Products',
            color: 'from-blue-500/20'
        },
        {
            icon: Package,
            title: '7-Day Returns',
            description: 'Easy Returns',
            color: 'from-purple-500/20'
        },
        {
            icon: Truck,
            title: 'Fast Delivery',
            description: 'Nationwide',
            color: 'from-emerald-500/20'
        },
        {
            icon: Award,
            title: 'Secure Payment',
            description: 'Paystack Protected',
            color: 'from-rose-500/20'
        }
    ];

    return (
        <section className="px-6 max-w-7xl mx-auto py-8">
            <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                {/* Stats Section */}
                <div className="relative z-10 grid grid-cols-3 gap-6 md:gap-12 mb-12 pb-8 border-b border-white/10">
                    <AnimatedStat end={1000} label="Products" suffix="+" />
                    <AnimatedStat end={1000} label="Happy Customers" suffix="+" />
                    <AnimatedStat end={24} label="Support" suffix="/7" />
                </div>

                {/* Trust Badges */}
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map((badge, index) => (
                        <motion.div
                            key={badge.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative overflow-hidden glass-card hover:bg-white/10 border border-white/10 rounded-2xl p-4 md:p-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <badge.icon className="w-6 h-6 md:w-8 md:h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                                </div>
                                <div>
                                    <div className="text-sm md:text-base font-black text-white uppercase tracking-tight">
                                        {badge.title}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-slate-400 font-medium">
                                        {badge.description}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustBanner;
