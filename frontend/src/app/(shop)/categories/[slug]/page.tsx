'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { productApi, categoryApi, Category, Product } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { Loader2, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartProduct } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState<{
        minPrice: string;
        maxPrice: string;
        sort: string;
        search: string;
        inStock?: boolean;
        onSale?: boolean;
        featured?: boolean;
        trending?: boolean;
        brands?: string[];
        colors?: string[];
    }>({
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        search: '',
        inStock: false,
        onSale: false,
        featured: false,
        trending: false,
        brands: [],
        colors: []
    });

    // Fetch Category Metadata
    useEffect(() => {
        categoryApi.getBySlug(slug)
            .then(setCategory)
            .catch(console.error);
    }, [slug]);

    // Fetch Products with Filters
    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => {
            productApi.getAll({
                category: slug,
                minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
                sort: filters.sort,
                search: filters.search || undefined,
                inStock: filters.inStock,
                onSale: filters.onSale,
                featured: filters.featured,
                trending: filters.trending,
                brands: filters.brands,
                colors: filters.colors,
                limit: 24
            })
                .then(data => {
                    setProducts(data.products);
                    setTotal(data.total);
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }, filters.search ? 500 : 0); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [slug, filters]);

    const mappedProducts: CartProduct[] = useMemo(() => {
        return products.map(p => ({
            id: p._id,
            name: p.name,
            description: p.description,
            price: p.variants && p.variants.length > 0 ? p.variants[0].sellingPrice : 0,
            image: p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url) : '/placeholder.jpg',
            category: typeof p.category === 'object' ? (p.category as any).name : category?.name || 'Uncategorized'
        }));
    }, [products, category]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        router.push('/shop');
    };

    return (
        <div className="min-h-screen pt-3 pb-20 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12 space-y-4">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <span
                        className="hover:text-white cursor-pointer transition-colors"
                        onClick={() => window.location.href = '/'}
                    >
                        Home
                    </span>
                    <span>/</span>
                    <span className="text-blue-500">Categories</span>
                    <span>/</span>
                    <span className="text-white">{category?.name || 'Loading...'}</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
                    {category?.parent && typeof category.parent === 'object' ? (
                        <span className="text-slate-500 block text-2xl mb-2">{(category.parent as any).name} /</span>
                    ) : null}
                    {category?.name || 'Explore'} <span className="text-blue-500">Collection</span>
                </h1>
                {category?.description && (
                    <p className="text-slate-400 max-w-2xl font-medium leading-relaxed">{category.description}</p>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Filters Sidebar */}
                <aside className="w-full lg:w-80 shrink-0">
                    <ProductFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onReset={handleReset}
                    />
                </aside>

                {/* Product Grid */}
                <main className="flex-grow space-y-8 pt-6">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-white">{mappedProducts.length}</span> of {total} products
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" strokeWidth={1.5} />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Syncing Inventory...</p>
                        </div>
                    ) : mappedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            <AnimatePresence mode="popLayout">
                                {mappedProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="glass-card bg-white/5 border border-dashed border-white/10 rounded-3xl py-32 text-center space-y-6">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                                <LayoutGrid size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white uppercase italic">No items found</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="px-8 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
