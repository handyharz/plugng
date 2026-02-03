import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

import Image from 'next/image';

// ... (BentoGrid stays same)

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    products,
    onClick,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    products?: { name: string; image: string }[];
    onClick?: () => void;
}) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, rotate: 0.5 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "row-span-1 rounded-3xl group/bento hover:shadow-2xl transition duration-200 shadow-input dark:shadow-none p-4 bg-[#0d0d0d] border-white/5 border justify-between flex flex-col space-y-4 cursor-pointer relative overflow-hidden",
                className
            )}
            onClick={onClick}
        >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/0 group-hover/bento:from-blue-500/5 group-hover/bento:to-purple-500/5 transition-all duration-500" />

            {header}

            {/* Trending Info Overlay (Header) */}
            {products && products.length > 0 && (
                <div className="absolute top-6 left-6 right-16 z-20 pointer-events-none">
                    <div className="flex flex-col space-y-1">
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover/bento:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover/bento:translate-y-0">Trending Now</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {products.map((p, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 0.4, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-[10px] text-white font-medium bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap group-hover/bento:opacity-100 transition-opacity"
                                >
                                    {p.name}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Thumbnails Stack (Bottom Right) */}
            {products && products.length > 0 && (
                <div className="absolute right-4 bottom-4 flex -space-x-4 z-20 pointer-events-none transition-all duration-500">
                    {products.filter(p => p.image).slice(0, 3).map((p, i) => (
                        <motion.div
                            key={`${p.image}-${i}`}
                            style={{ zIndex: 30 - i }}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 border-[#0d0d0d] bg-[#1a1a1a] overflow-hidden shadow-2xl relative"
                            initial={{ x: 0, rotate: i * 3 }}
                            whileHover={{ scale: 1.1, rotate: 0, x: i * 15 }}
                        >
                            <Image src={p.image} fill className="object-cover" alt={p.name} sizes="80px" />
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10 w-2/3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-slate-400 group-hover/bento:text-white transition-colors border border-white/5">
                    {icon}
                </div>
                <div className="font-black text-white italic uppercase tracking-tighter mb-2 mt-2 text-xl">
                    {title}
                </div>
                <div className="font-medium text-slate-500 text-xs">
                    {description}
                </div>
            </div>
        </motion.div>
    );
};
