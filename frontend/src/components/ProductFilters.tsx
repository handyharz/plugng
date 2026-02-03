'use client';

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, RotateCcw, Check, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productApi } from '@/lib/api';

interface ProductFiltersProps {
    filters: {
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
    };
    onFilterChange: (key: string, value: any) => void; // Value can be string, boolean, array
    onReset: () => void;
}

export default function ProductFilters({ filters, onFilterChange, onReset }: ProductFiltersProps) {
    // Quick Sections State
    const [sections, setSections] = useState({
        availability: true,
        brands: true,
        colors: true,
        price: true
    });

    // Dynamic filter options
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [availableColors, setAvailableColors] = useState<string[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);

    // Fetch available filter options on mount
    useEffect(() => {
        productApi.getFilterOptions()
            .then(data => {
                setAvailableBrands(data.brands);
                setAvailableColors(data.colors);
            })
            .catch(console.error)
            .finally(() => setIsLoadingOptions(false));
    }, []);

    const toggleSection = (key: keyof typeof sections) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCheckboxChange = (key: string, checked: boolean) => {
        onFilterChange(key, checked);
    };

    const handleArrayToggle = (key: string, value: string) => {
        const currentArray = filters[key as keyof typeof filters] as string[] || [];
        if (currentArray.includes(value)) {
            onFilterChange(key, currentArray.filter(item => item !== value));
        } else {
            onFilterChange(key, [...currentArray, value]);
        }
    };

    return (
        <div className="space-y-6 glass-card bg-white/5 border border-white/10 rounded-3xl p-6 sticky top-32 max-h-[80vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center space-x-2">
                    <SlidersHorizontal size={16} className="text-blue-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Filters</h3>
                </div>
                <button
                    onClick={onReset}
                    className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center space-x-1"
                >
                    <RotateCcw size={10} />
                    <span>Reset</span>
                </button>
            </div>

            {/* Search */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search Products..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Status</label>
                <div className="flex flex-wrap gap-2">
                    <FilterTag
                        label="In Stock"
                        active={!!filters.inStock}
                        onClick={() => handleCheckboxChange('inStock', !filters.inStock)}
                    />
                    <FilterTag
                        label="On Sale"
                        active={!!filters.onSale}
                        onClick={() => handleCheckboxChange('onSale', !filters.onSale)}
                        icon="🔥"
                    />
                    <FilterTag
                        label="Featured"
                        active={!!filters.featured}
                        onClick={() => handleCheckboxChange('featured', !filters.featured)}
                    />
                    <FilterTag
                        label="Trending"
                        active={!!filters.trending}
                        onClick={() => handleCheckboxChange('trending', !filters.trending)}
                        icon="📈"
                    />
                </div>
            </div>

            {/* Brands Section */}
            <div className="space-y-3 border-t border-white/5 pt-4">
                <button
                    onClick={() => toggleSection('brands')}
                    className="flex items-center justify-between w-full group"
                >
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 cursor-pointer group-hover:text-white transition-colors">Brands</label>
                    {sections.brands ? <Minus size={10} className="text-slate-500" /> : <Plus size={10} className="text-slate-500" />}
                </button>

                <AnimatePresence>
                    {sections.brands && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-2 pt-1">
                                {isLoadingOptions ? (
                                    <div className="text-xs text-slate-500 py-2">Loading brands...</div>
                                ) : availableBrands.length > 0 ? (
                                    availableBrands.map(brand => (
                                        <label
                                            key={brand}
                                            onClick={() => handleArrayToggle('brands', brand)}
                                            className="flex items-center space-x-3 cursor-pointer group/item"
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${(filters.brands || []).includes(brand)
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-white/20 group-hover/item:border-white/50'
                                                }`}>
                                                {(filters.brands || []).includes(brand) && <Check size={10} className="text-white" />}
                                            </div>
                                            <span className={`text-xs font-bold transition-colors ${(filters.brands || []).includes(brand) ? 'text-white' : 'text-slate-400 group-hover/item:text-slate-300'
                                                }`}>{brand}</span>
                                        </label>
                                    ))
                                ) : (
                                    <div className="text-xs text-slate-500 py-2">No brands available</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Colors Section */}
            <div className="space-y-3 border-t border-white/5 pt-4">
                <button
                    onClick={() => toggleSection('colors')}
                    className="flex items-center justify-between w-full group"
                >
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 cursor-pointer group-hover:text-white transition-colors">Colors</label>
                    {sections.colors ? <Minus size={10} className="text-slate-500" /> : <Plus size={10} className="text-slate-500" />}
                </button>

                <AnimatePresence>
                    {sections.colors && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 pt-1">
                                {isLoadingOptions ? (
                                    <div className="text-xs text-slate-500 py-2">Loading colors...</div>
                                ) : availableColors.length > 0 ? (
                                    availableColors.map(color => {
                                        // Map color names to hex values
                                        const colorMap: Record<string, string> = {
                                            'Black': '#000000',
                                            'White': '#FFFFFF',
                                            'Blue': '#3B82F6',
                                            'Red': '#EF4444',
                                            'Green': '#22C55E',
                                            'Gold': '#EAB308',
                                            'Silver': '#9CA3AF',
                                            'Purple': '#A855F7',
                                            'Pink': '#EC4899',
                                            'Orange': '#F97316',
                                            'Yellow': '#FCD34D',
                                            'Gray': '#6B7280',
                                            'Brown': '#92400E'
                                        };
                                        const hex = colorMap[color] || '#6B7280';

                                        return (
                                            <button
                                                key={color}
                                                onClick={() => handleArrayToggle('colors', color)}
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${(filters.colors || []).includes(color)
                                                    ? 'border-blue-500 scale-110'
                                                    : 'border-transparent hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: hex }}
                                                title={color}
                                            >
                                                {(filters.colors || []).includes(color) && (
                                                    <Check size={12} className={color === 'White' ? 'text-black' : 'text-white'} />
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="text-xs text-slate-500 py-2">No colors available</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Price Range */}
            <div className="space-y-4 border-t border-white/5 pt-4">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full group"
                >
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 cursor-pointer group-hover:text-white transition-colors">Price Range (₦)</label>
                    {sections.price ? <Minus size={10} className="text-slate-500" /> : <Plus size={10} className="text-slate-500" />}
                </button>

                <AnimatePresence>
                    {sections.price && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => onFilterChange('minPrice', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-blue-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-blue-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {[5000, 10000, 25000, 50000].map((price) => (
                                        <button
                                            key={price}
                                            onClick={() => onFilterChange('maxPrice', price.toString())}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all"
                                        >
                                            &lt; ₦{price.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sort */}
            <div className="space-y-3 border-t border-white/5 pt-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Sort By</label>
                <div className="relative">
                    <select
                        value={filters.sort}
                        onChange={(e) => onFilterChange('sort', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="newest" className="bg-slate-900">Newest Arrivals</option>
                        <option value="popular" className="bg-slate-900">Most Popular</option>
                        <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
                        <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                </div>
            </div>
        </div>
    );
}

function FilterTag({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon?: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${active
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                }`}
        >
            {icon && <span className="mr-1">{icon}</span>}
            {label}
        </button>
    );
}
