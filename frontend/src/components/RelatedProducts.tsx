'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi, Product } from '@/lib/api';
import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';

interface RelatedProductsProps {
    currentProductId: string;
    categorySlug: string;
    limit?: number;
    compact?: boolean;
}

export function RelatedProducts({ currentProductId, categorySlug, limit = 4, compact = false }: RelatedProductsProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['related-products', categorySlug, currentProductId, limit],
        queryFn: async () => {
            const results = await productApi.getAll({
                category: categorySlug,
                limit: limit + 2, // Get extra to filter out current
            });
            // Filter out current product and take requested limit
            return results.products
                .filter(p => p._id !== currentProductId)
                .slice(0, limit);
        },
    });

    if (isLoading || !data || data.length === 0) return null;

    return (
        <section className={`${compact ? '' : 'mt-20 pt-20 border-t border-white/5'}`}>
            <div className={`flex flex-col space-y-2 ${compact ? 'mb-6' : 'mb-10'}`}>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Discover More</span>
                <h2 className={`${compact ? 'text-2xl' : 'text-4xl'} font-black text-white uppercase italic tracking-tighter`}>Related Gear</h2>
            </div>

            <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {data.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={{
                            id: product._id,
                            name: product.name,
                            price: product.variants?.[0]?.sellingPrice || 0,
                            compareAtPrice: product.variants?.[0]?.compareAtPrice,
                            image: product.variants?.[0]?.image || product.images[0]?.url || '',
                            category: typeof product.category === 'string' ? product.category : product.category.name,
                            description: product.description
                        } as any}
                    />
                ))}
            </div>
        </section>
    );
}
