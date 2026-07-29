'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { productApi, Product } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { Loader2, LayoutGrid, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartProduct } from '@/context/CartContext';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ShopContent() {
    const searchParams = useSearchParams();
    const showFiltersParam = searchParams.get('showFilters') !== 'false';
    const onSaleParam = searchParams.get('onSale') === 'true';
    const featuredParam = searchParams.get('featured') === 'true';
    const trendingParam = searchParams.get('trending') === 'true';
    const sortParam = searchParams.get('sort') || 'newest';
    const searchParam = searchParams.get('search') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [showFilters, setShowFilters] = useState(showFiltersParam);

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
        sort: sortParam,
        search: searchParam,
        inStock: false,
        onSale: onSaleParam,
        featured: featuredParam,
        trending: trendingParam,
        brands: [],
        colors: []
    });

    // Update filters when search params change
    useEffect(() => {
        setShowFilters(searchParams.get('showFilters') !== 'false');
        setFilters(prev => ({
            ...prev,
            onSale: searchParams.get('onSale') === 'true',
            featured: searchParams.get('featured') === 'true',
            trending: searchParams.get('trending') === 'true',
            sort: searchParams.get('sort') || 'newest',
            search: searchParams.get('search') || prev.search
        }));
    }, [searchParams]);

    // Fetch Products with Filters
    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => {
            productApi.getAll({
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
    }, [filters]);

    const mappedProducts: CartProduct[] = useMemo(() => {
        return products.map(p => ({
            id: p._id,
            name: p.name,
            description: p.description,
            price: p.variants && p.variants.length > 0 ? p.variants[0].sellingPrice : 0,
            image: p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url) : '/placeholder.jpg',
            category: typeof p.category === 'object' ? (p.category as any).name : 'Product'
        }));
    }, [products]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setFilters({
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
    };

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    return (
        <div className="min-h-screen pt-16 sm:pt-20 md:pt-24 pb-20 px-3 sm:px-6 max-w-[1440px] mx-auto">
            {/* Header */}
            <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-blue-500">Shop</span>
                    <span>/</span>
                    <span className="text-white">All Products</span>
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
                    The <span className="text-blue-500">Full</span> Inventory
                </h1>
                <p className="text-slate-400 max-w-2xl text-xs sm:text-base font-medium leading-relaxed">
                    Browse our entire premium collection of smartphone accessories, parts, and gear.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                {/* Desktop Filters Sidebar */}
                <aside className="hidden lg:block w-80 shrink-0">
                    <ProductFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onReset={handleReset}
                    />
                </aside>

                {/* Mobile Filter Drawer */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden"
                            />
                            <motion.aside
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                                className="fixed top-0 left-0 bottom-0 w-[90%] max-w-md bg-[#0a0a0a] border-r border-white/10 z-[101] p-5 overflow-y-auto lg:hidden"
                            >
                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                                    <h2 className="text-lg font-black text-white uppercase italic">Filter Gear</h2>
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <ProductFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onReset={handleReset}
                                />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Product Grid Main */}
                <main className="flex-grow space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-white">{mappedProducts.length}</span> of {total} products
                        </p>

                        {/* Mobile Filter Toggle Button */}
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            <SlidersHorizontal size={14} />
                            <span>Filters</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" strokeWidth={1.5} />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Syncing Inventory...</p>
                        </div>
                    ) : mappedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                        <div className="glass-card bg-white/5 border border-dashed border-white/10 rounded-3xl py-24 sm:py-32 text-center space-y-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                                <ShoppingBag size={36} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg sm:text-xl font-bold text-white uppercase italic">No items found</h3>
                                <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
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

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen py-32 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" strokeWidth={1.5} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Initializing Shop...</p>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
