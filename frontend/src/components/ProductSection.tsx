'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { CartProduct } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProductSectionProps {
    title: string;
    icon?: React.ReactNode;
    products: CartProduct[];
    isLoading?: boolean;
    ctaText?: string;
    ctaLink?: string;
    layout?: 'grid' | 'carousel';
    accentColor?: string;
    badge?: {
        text: string;
        color: string;
    };
}

export default function ProductSection({
    title,
    icon,
    products,
    isLoading = false,
    ctaText,
    ctaLink,
    layout = 'grid',
    accentColor = '#3B82F6',
}: ProductSectionProps) {
    if (isLoading) {
        return (
            <section className="py-16">
                <div className="flex items-center justify-center space-x-4">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading {title}...</p>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="py-16 border-t border-white/5">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                    {icon && <div style={{ color: accentColor }}>{icon}</div>}
                    <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                        {title}
                    </h2>
                </div>
                {ctaText && ctaLink && (
                    <Link
                        href={ctaLink}
                        className="group flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    >
                        <span className="text-xs font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">
                            {ctaText}
                        </span>
                        <ArrowRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                    </Link>
                )}
            </div>

            {/* Products Display */}
            {layout === 'carousel' ? (
                <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="flex-none w-[280px] md:w-[320px] snap-start"
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
}
