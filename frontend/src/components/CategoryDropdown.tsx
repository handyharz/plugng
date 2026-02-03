'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/lib/api';
import { ChevronDown, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CategoryDropdown() {
    const [isOpen, setIsOpen] = useState(false);

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories', 'featured'],
        queryFn: () => categoryApi.getAll({ level: 1, featured: true }),
    });

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className="flex items-center space-x-1 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors group">
                <span>Categories</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-4 w-64 bg-[#0d0d0d]/90 shadow-2xl rounded-2xl overflow-hidden border border-white/10 z-50 p-2 backdrop-blur-3xl"
                    >
                        {isLoading ? (
                            <div className="p-4 space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="py-2">
                                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Brands</p>
                                {categories?.map((category) => (
                                    <Link
                                        key={category._id}
                                        href={`/categories/${category.slug}`}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-600/20 hover:text-white text-slate-200 transition-all group/item"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover/item:bg-blue-600/30 transition-colors">
                                            <span className="text-sm">{category.icon || '📱'}</span>
                                        </div>
                                        <span className="text-sm font-bold">{category.name}</span>
                                    </Link>
                                ))}

                                <div className="mt-2 pt-2 border-t border-white/5">
                                    <Link
                                        href="/categories"
                                        className="flex justify-center p-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                                    >
                                        View All Categories →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
