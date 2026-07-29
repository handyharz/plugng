'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { productApi, Product } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { Loader2, ShoppingBag, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
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

    // Count active filters for badge
    const activeFilterCount = [
        filters.inStock,
        filters.onSale,
        filters.featured,
        filters.trending,
        filters.minPrice,
        filters.maxPrice,
        ...(filters.brands || []),
        ...(filters.colors || [])
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen pb-20 px-3 sm:px-6 max-w-[1440px] mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-12 space-y-2 sm:space-y-4">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-blue-500">Shop</span>
                    <span>/</span>
                    <span className="text-white">All Products</span>
                </div>
                <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
                    The <span className="text-blue-500">Full</span> Inventory
                </h1>
                <p className="text-slate-400 max-w-2xl text-xs sm:text-base font-medium leading-relaxed hidden sm:block">
                    Browse our entire premium collection of smartphone accessories, parts, and gear.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                {/* Desktop Filters Sidebar */}
                <aside className="hidden lg:block w-80 shrink-0">
                    <div className="glass-card bg-white/5 border border-white/10 rounded-3xl p-6 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
                        <ProductFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onReset={handleReset}
                        />
                    </div>
                </aside>

                {/* Mobile Filter Drawer */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <React.Fragment key="mobile-filter-fragment">
                            <motion.div
                                key="mobile-filter-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden"
                            />
                            <motion.aside
                                key="mobile-filter-drawer"
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                                className="fixed top-0 left-0 bottom-0 w-[90%] max-w-sm bg-[#0a0a0a] border-r border-white/10 z-[101] flex flex-col lg:hidden"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                                    <div className="flex items-center space-x-2">
                                        <SlidersHorizontal size={16} className="text-blue-500" />
                                        <h2 className="text-sm font-black text-white uppercase italic">Filter Gear</h2>
                                        {activeFilterCount > 0 && (
                                            <span className="text-[10px] font-black bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {activeFilterCount > 0 && (
                                            <button
                                                onClick={handleReset}
                                                className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors"
                                            >
                                                Clear
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setIsMobileFilterOpen(false)}
                                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white active:scale-95 transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-y-auto flex-1 p-4">
                                    <ProductFilters
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                        onReset={handleReset}
                                    />
                                </div>
                                <div className="p-4 border-t border-white/10 shrink-0">
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                                    >
                                        Show {total} Results
                                    </button>
                                </div>
                            </motion.aside>
                        </React.Fragment>
                    )}
                </AnimatePresence>

                {/* Product Grid Main */}
                <main className="flex-grow space-y-4 sm:space-y-6">
                    {/* Mobile toolbar: count + filter + sort */}
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex-1 truncate">
                            <span className="text-white">{total}</span> items
                        </p>

                        {/* Mobile Sort Dropdown */}
                        <div className="lg:hidden relative">
                            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400">
                                <ArrowUpDown size={12} />
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer appearance-none max-w-[100px]"
                                >
                                    <option value="newest" className="bg-slate-900">Newest</option>
                                    <option value="popular" className="bg-slate-900">Popular</option>
                                    <option value="price-asc" className="bg-slate-900">Price ↑</option>
                                    <option value="price-desc" className="bg-slate-900">Price ↓</option>
                                </select>
                            </div>
                        </div>

                        {/* Mobile Filter Toggle Button */}
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all relative"
                        >
                            <SlidersHorizontal size={13} />
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active filter chips on mobile */}
                    {activeFilterCount > 0 && (
                        <div className="flex items-center gap-2 flex-wrap lg:hidden">
                            {filters.inStock && (
                                <button onClick={() => handleFilterChange('inStock', false)} className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-[10px] font-black text-blue-400 active:scale-95">
                                    <span>In Stock</span><X size={10} />
                                </button>
                            )}
                            {filters.onSale && (
                                <button onClick={() => handleFilterChange('onSale', false)} className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-[10px] font-black text-blue-400 active:scale-95">
                                    <span>On Sale</span><X size={10} />
                                </button>
                            )}
                            {filters.featured && (
                                <button onClick={() => handleFilterChange('featured', false)} className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-[10px] font-black text-blue-400 active:scale-95">
                                    <span>Featured</span><X size={10} />
                                </button>
                            )}
                            {filters.trending && (
                                <button onClick={() => handleFilterChange('trending', false)} className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-[10px] font-black text-blue-400 active:scale-95">
                                    <span>Trending</span><X size={10} />
                                </button>
                            )}
                            {(filters.brands || []).map((brand, i) => (
                                <button key={`chip-brand-${brand}-${i}`} onClick={() => handleFilterChange('brands', (filters.brands || []).filter(b => b !== brand))} className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-[10px] font-black text-blue-400 active:scale-95">
                                    <span>{brand}</span><X size={10} />
                                </button>
                            ))}
                            <button onClick={handleReset} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400 active:scale-95">
                                Clear All
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" strokeWidth={1.5} />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Syncing Inventory...</p>
                        </div>
                    ) : mappedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
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
