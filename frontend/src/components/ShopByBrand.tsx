'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { categoryApi, Category } from '@/lib/api';

const ShopByBrand: React.FC = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [brands, setBrands] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                // Fetch all Level 1 categories (brands) that are active
                const brandCategories = await categoryApi.getAll({ level: 1, active: true });
                setBrands(brandCategories);
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBrands();
    }, []);

    // Brand color mapping based on name
    const getBrandColor = (name: string): string => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('apple')) return 'from-slate-400/20 to-slate-500/20';
        if (lowerName.includes('samsung')) return 'from-blue-500/20 to-blue-600/20';
        if (lowerName.includes('xiaomi')) return 'from-orange-500/20 to-orange-600/20';
        if (lowerName.includes('tecno')) return 'from-cyan-500/20 to-cyan-600/20';
        if (lowerName.includes('infinix')) return 'from-purple-500/20 to-purple-600/20';
        if (lowerName.includes('oppo')) return 'from-emerald-500/20 to-emerald-600/20';
        if (lowerName.includes('realme')) return 'from-yellow-500/20 to-yellow-600/20';
        if (lowerName.includes('google') || lowerName.includes('pixel')) return 'from-red-500/20 to-red-600/20';
        if (lowerName.includes('oraimo')) return 'from-indigo-500/20 to-indigo-600/20';
        return 'from-slate-500/20 to-slate-600/20'; // Default
    };

    const getBrandHoverColor = (name: string): string => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('apple')) return 'hover:border-slate-400/50';
        if (lowerName.includes('samsung')) return 'hover:border-blue-400/50';
        if (lowerName.includes('xiaomi')) return 'hover:border-orange-400/50';
        if (lowerName.includes('tecno')) return 'hover:border-cyan-400/50';
        if (lowerName.includes('infinix')) return 'hover:border-purple-400/50';
        if (lowerName.includes('oppo')) return 'hover:border-emerald-400/50';
        if (lowerName.includes('realme')) return 'hover:border-yellow-400/50';
        if (lowerName.includes('google') || lowerName.includes('pixel')) return 'hover:border-red-400/50';
        if (lowerName.includes('oraimo')) return 'hover:border-indigo-400/50';
        return 'hover:border-slate-400/50'; // Default
    };

    // Map brand slug to image path
    const getBrandImage = (slug: string): string => {
        const imageMap: Record<string, string> = {
            'apple': '/brands/Apple.png',
            'samsung': '/brands/samsung.webp',
            'tecno': '/brands/tecno.png',
            'infinix': '/brands/infinix.png',
            'xiaomi': '/brands/xiaomi.jpg',
            'oppo': '/brands/oppo.avif',
            'realme': '/brands/realme.webp',
            'google-pixel': '/brands/google_pixel .png',
            'oraimo': '/brands/oraimo.png',
            'huawei': '/brands/huawei.png',
            'sony': '/brands/sony.png',
            'other-brands': '/brands/other_brands.jpg',
        };

        return imageMap[slug] || '/brands/other_brands.jpg'; // Default fallback
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading) {
        return (
            <section className="px-6 max-w-7xl mx-auto py-12">
                <div className="animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-48 mb-8"></div>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-48 h-48 bg-white/10 rounded-3xl"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (brands.length === 0) {
        return null; // Don't show section if no brands
    }

    return (
        <section className="px-6 max-w-7xl mx-auto py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30"
                    >
                        <Smartphone className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                            Find Your Match
                        </span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
                        Shop by <span className="text-purple-400">Brand</span>
                    </h2>
                    <p className="text-slate-400 max-w-md">
                        Find the perfect accessories for your phone brand. All products are guaranteed compatible.
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-3 rounded-xl glass-card border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-3 rounded-xl glass-card border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Brands Carousel */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {brands.map((brand, index) => (
                    <Link
                        key={brand._id}
                        href={`/categories/${brand.slug}`}
                        className="flex-shrink-0"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className={`group relative overflow-hidden glass-card border border-white/10 ${getBrandHoverColor(brand.name)} rounded-3xl p-8 w-48 h-48 transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${getBrandColor(brand.name)} opacity-50 group-hover:opacity-100 transition-opacity`} />

                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="relative w-24 h-24 transform group-hover:scale-110 transition-transform duration-300">
                                    <Image
                                        src={getBrandImage(brand.slug)}
                                        alt={`${brand.name} logo`}
                                        fill
                                        className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                                        sizes="96px"
                                    />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-white uppercase tracking-tight mb-1">
                                        {brand.name}
                                    </div>
                                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors font-medium uppercase tracking-wider">
                                        View Products →
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ShopByBrand;
