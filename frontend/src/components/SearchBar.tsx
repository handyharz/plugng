'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Zap, ChevronRight, ShoppingBag, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { searchApi } from '@/lib/api';

// Types for search results
interface InstantResults {
    products: any[];
    categories: any[];
    brands: string[];
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

interface SearchBarProps {
    variant?: 'header' | 'hero';
    className?: string;
    placeholder?: string;
}

export function SearchBar({ variant = 'header', className = '', placeholder }: SearchBarProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<InstantResults | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    useClickOutside(searchRef, () => setIsOpen(false));

    // Debounce timer
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Load recent searches on mount
    useEffect(() => {
        const saved = localStorage.getItem('plugng_recent_searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved).slice(0, 5));
            } catch (e) { console.error(e); }
        }
    }, []);

    // Handle Search Logic
    const handleSearch = async (searchTerm: string) => {
        if (!searchTerm || searchTerm.length < 2) {
            setResults(null);
            return;
        }

        setIsLoading(true);
        try {
            const data = await searchApi.getInstantResults(searchTerm);
            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced Input Handler
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            handleSearch(val);
        }, 300);
    };

    // Proceed to full search page
    const submitSearch = (term: string) => {
        if (!term.trim()) return;

        // Save to recent
        const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('plugng_recent_searches', JSON.stringify(newRecent));

        setIsOpen(false);
        router.push(`/shop?search=${encodeURIComponent(term)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            submitSearch(query);
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const isHero = variant === 'hero';

    return (
        <div className={`relative ${isHero ? 'w-full max-w-xl' : 'z-50'} ${className}`}>
            {/* Backdrop for focus mode (Header only) */}
            <AnimatePresence>
                {isOpen && !isHero && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            <div ref={searchRef} className={`
                relative z-50 transition-all duration-300
                ${!isHero && isOpen ? 'w-full md:w-[600px] fixed top-4 left-1/2 -translate-x-1/2 px-4 md:px-0' : 'w-full relative'}
            `}>
                {/* Search Input Bar */}
                <div className={`
                    bg-[#0d0d0d] border transition-all duration-300 overflow-hidden flex items-center group
                    ${isHero
                        ? 'border-white/10 rounded-2xl h-16 shadow-2xl focus-within:border-blue-500/50 bg-[#0a0a0a]'
                        : (isOpen ? 'border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.3)] rounded-2xl h-14' : 'border-transparent bg-transparent hover:text-white text-slate-400 p-2')
                    }
                `}>
                    {/* Collapsed State Icon (Header only) */}
                    {!isOpen && !isHero && (
                        <button onClick={() => setIsOpen(true)}>
                            <Search size={20} />
                        </button>
                    )}

                    {/* Expanded Input / Always Visible for Hero */}
                    {(isOpen || isHero) && (
                        <div className="flex items-center w-full px-4">
                            {isHero ? (
                                <Sparkles size={22} className="text-blue-500 mr-3 shrink-0" />
                            ) : (
                                <Search size={22} className="text-blue-500 mr-3 shrink-0" />
                            )}
                            <input
                                autoFocus={isOpen && !isHero}
                                onFocus={() => setIsOpen(true)}
                                type="text"
                                placeholder={placeholder || (isHero ? "Ask Your Plug... (e.g. 'iPhone 15 Case')" : "Ask Your Plug (e.g. 'iPhone 15', 'Cables')...")}
                                value={query}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                className={`w-full bg-transparent text-white outline-none placeholder-slate-600 ${isHero ? 'text-lg font-medium' : 'text-base font-medium'}`}
                            />
                            {isLoading ? (
                                <Zap size={18} className="text-amber-500 animate-pulse ml-2 shrink-0" />
                            ) : query ? (
                                <button onClick={() => { setQuery(''); setResults(null); }} className="text-slate-500 hover:text-white ml-2 shrink-0">
                                    <X size={18} />
                                </button>
                            ) : isHero ? (
                                <button onClick={() => submitSearch(query)} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors ml-2 shrink-0">
                                    <TrendingUp size={20} />
                                </button>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Dropdown Results */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            className={`
                                ${isHero ? 'relative w-full mt-6 bg-white/[0.02] border-white/5' : 'absolute top-full mt-4 left-0 right-0 md:w-[600px] mx-auto bg-[#0a0a0a] border-white/10'} 
                                overflow-hidden border rounded-[2rem] shadow-2xl z-50
                            `}
                        >
                            {/* Zero State (No Query) */}
                            {!query && (
                                <div className="p-6 space-y-6">
                                    {recentSearches.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Recent Discoveries</p>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map(term => (
                                                    <button key={term} onClick={() => submitSearch(term)} className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all group">
                                                        <Clock size={12} className="text-slate-500 group-hover:text-blue-400" />
                                                        <span>{term}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Trending Now</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['iPhone 15 Pro', '30W Charger', 'MagSafe Case', 'Screen Protector'].map((term, i) => (
                                                <button key={term} onClick={() => submitSearch(term)} className="flex items-center justify-between p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-all text-left">
                                                    <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{term}</span>
                                                    <Zap size={14} className={`${i === 0 ? 'text-amber-500' : 'text-slate-700'} group-hover:text-amber-400`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Results State */}
                            {query && results && (
                                <div className="p-2">
                                    {/* Categories & Brands */}
                                    {(results.categories.length > 0 || results.brands.length > 0) && (
                                        <div className="p-3 grid grid-cols-2 gap-4 border-b border-white/5 pb-4 mb-2">
                                            {results.categories.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Categories</p>
                                                    {results.categories.map((cat: any) => (
                                                        <Link key={cat._id} href={`/shop?category=${cat.slug}&showFilters=false`} onClick={() => setIsOpen(false)} className="block text-sm text-blue-400 hover:text-blue-300 hover:underline decoration-blue-500/30 underline-offset-4">
                                                            {cat.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                            {results.brands.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brands</p>
                                                    {results.brands.map((brand) => (
                                                        <Link key={brand} href={`/shop?showFilters=true&brands=${encodeURIComponent(brand)}`} onClick={() => setIsOpen(false)} className="block text-sm text-slate-300 hover:text-white">
                                                            {brand}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Products */}
                                    <div className="space-y-1">
                                        {results.products.length === 0 ? (
                                            <div className="p-8 text-center space-y-2">
                                                <p className="text-slate-500 text-sm italic">No matches found for "{query}"</p>
                                            </div>
                                        ) : (
                                            results.products.map((product: any) => (
                                                <Link
                                                    key={product._id}
                                                    href={`/products/${product.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-all group"
                                                >
                                                    <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden shrink-0 relative">
                                                        <Image src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} fill className="object-cover" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">{product.name}</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{product.category?.name || 'Product'}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-black text-white italic">₦{product.variants?.[0]?.sellingPrice?.toLocaleString()}</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                                                </Link>
                                            ))
                                        )}
                                    </div>

                                    {/* View All Link */}
                                    <div className="p-2 mt-2 border-t border-white/5">
                                        <button
                                            onClick={() => submitSearch(query)}
                                            className="w-full py-3 bg-blue-600/10 text-blue-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center space-x-2"
                                        >
                                            <span>See all results</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
