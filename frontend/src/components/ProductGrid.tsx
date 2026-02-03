'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { CartProduct } from '@/context/CartContext';
import { ProductCard } from './ProductCard';

export function ProductGrid() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['products', 'all'],
        queryFn: () => productApi.getAll({ limit: 8 }),
    });

    const products: CartProduct[] = React.useMemo(() => {
        if (!data?.products) return [];
        console.time('🔢 Product Mapping');
        const mapped = data.products.map((p: any) => ({
            id: p._id,
            name: p.name,
            description: p.description,
            price: p.variants && p.variants.length > 0 ? p.variants[0].sellingPrice : 0,
            image: p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url) : '/placeholder.jpg',
            category: p.category && typeof p.category === 'object' ? p.category.name : 'Uncategorized'
        }));
        console.timeEnd('🔢 Product Mapping');
        return mapped;
    }, [data]);

    return (
        <section id="products-section" className="pb-20 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="space-y-4">
                    <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                        New Arrivals
                    </span>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Premium <br />
                        <span className="text-slate-500">Phone Accessories</span>
                    </h2>
                </div>
                <p className="max-w-xs text-sm text-slate-400 font-medium leading-relaxed">
                    Explore our curated collection of high-quality accessories for the Nigerian smartphone market.
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-[4/5] bg-white/5 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <p className="text-red-400 font-bold uppercase tracking-widest">Failed to load products</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
