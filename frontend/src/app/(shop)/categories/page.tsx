'use client';

import React, { useState, useEffect } from 'react';
import { categoryApi, Category } from '@/lib/api';
import { LayoutGrid, ArrowRight, Sparkles, Smartphone, Laptop, Zap, Headphones, Watch, Gamepad } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        categoryApi.getTree()
            .then(data => {
                // Ensure we have categories
                setCategories(data || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    // Helper to get icon component
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case '📱': return <Smartphone size={20} />;
            case '💻': return <Laptop size={20} />;
            case '⚡': return <Zap size={20} />;
            case '🎧': return <Headphones size={20} />;
            case '⌚': return <Watch size={20} />;
            case '🎮': return <Gamepad size={20} />;
            default: return <LayoutGrid size={20} />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-3 px-6 max-w-7xl mx-auto space-y-12">
                <div className="h-12 w-64 bg-white/5 animate-pulse rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`h-64 bg-white/5 animate-pulse rounded-3xl ${i === 0 || i === 3 ? 'md:col-span-2' : ''}`} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-3 pb-20 px-6 max-w-7xl mx-auto">
            {/* Cinematic Header */}
            <div className="mb-16 space-y-4 relative">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] relative z-10">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-blue-500">The Archive</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-white italic uppercase tracking-tighter relative z-10">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Archive</span>
                </h1>
                <p className="text-slate-400 max-w-xl font-medium leading-relaxed text-lg relative z-10">
                    Explore our curated collection of premium gear. Meticulously organized for the discerning tech enthusiast.
                </p>
            </div>

            {/* Bento Grid Layout */}
            {categories.length > 0 ? (
                <BentoGrid>
                    {categories.map((category, index) => (
                        <BentoGridItem
                            key={category._id}
                            title={category.name}
                            description={
                                <span className="flex items-center space-x-2">
                                    <span className="bg-white/10 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {category.productCount || 0} Items
                                    </span>
                                    {category.children && category.children.length > 0 && (
                                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">
                                            + {category.children.length} collections
                                        </span>
                                    )}
                                </span>
                            }
                            header={
                                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5 relative overflow-hidden group-hover/bento:border-blue-500/20 transition-all">
                                    {/* Decorative Background */}
                                    <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]" />

                                    {/* Icon Large */}
                                    <div className="absolute -right-4 -bottom-4 text-9xl text-white/5 font-black italic select-none pointer-events-none group-hover/bento:text-blue-500/10 transition-colors">
                                        {category.icon}
                                    </div>
                                </div>
                            }
                            icon={getIcon(category.icon || '')}
                            className={index === 0 || index === 3 || index === 6 ? "md:col-span-2" : ""}
                            products={category.products}
                            onClick={() => router.push(`/categories/${category.slug}`)}
                        />
                    ))}
                </BentoGrid>
            ) : (
                <div className="text-center py-32 space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                        <Sparkles size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase italic">The Archive is Empty</h3>
                        <p className="text-slate-500 text-sm">We are currently curating new collections.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
