'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Clock, Zap, ChevronRight, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
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
    suggestions: string[];
    trending: {
        terms: string[];
        categories: any[];
        brands: string[];
    };
    queryMeta: {
        normalizedQuery: string;
        expandedTerms: string[];
        personalized: boolean;
    };
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
    const [trendingTerms, setTrendingTerms] = useState<string[]>(['iPhone 15 Pro', '30W Charger', 'MagSafe Case', 'Screen Protector']);
    const [mounted, setMounted] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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

        searchApi.getTrending()
            .then((data) => {
                if (data.terms?.length) {
                    setTrendingTerms(data.terms.slice(0, 6));
                }
            })
            .catch((error) => {
                console.error('Trending search load failed:', error);
            });
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

    // Modal Content for Header variant using React Portal to prevent layout shifts
    const headerModalContent = (!isHero && isOpen && mounted) ? createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] overflow-hidden"
            />
            <motion.div
                ref={searchRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 left-0 right-0 z-[1000] bg-[#0a0a0a] border-b border-white/10 p-3 sm:p-5 md:top-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:w-[92vw] md:rounded-3xl md:border md:shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
                {/* Top Bar: Input + Cancel */}
                <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex-1 bg-[#121212] border border-blue-500/40 rounded-xl sm:rounded-2xl h-12 sm:h-14 px-3 sm:px-4 flex items-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <Search className="text-blue-500 w-5 h-5 mr-2.5 shrink-0" />
                        <input
                            autoFocus
                            type="text"
                            placeholder={placeholder || "Search gear (e.g. iPhone, Cases)..."}
                            value={query}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent text-white outline-none placeholder-slate-500 text-sm sm:text-base font-medium"
                        />
                        {isLoading ? (
                            <Zap className="w-4 h-4 text-amber-500 animate-pulse ml-2 shrink-0" />
                        ) : query ? (
                            <button
                                onClick={() => { setQuery(''); setResults(null); }}
                                className="text-slate-500 hover:text-white p-1 ml-1 shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        ) : null}
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors shrink-0 uppercase tracking-wider"
                    >
                        Cancel
                    </button>
                </div>

                {/* Dropdown Results Box */}
                <div className="overflow-y-auto flex-1 mt-3 space-y-4 no-scrollbar">
                    {!query && (
                        <div className="p-2 sm:p-4 space-y-4">
                            {recentSearches.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Recent Searches</p>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map(term => (
                                            <button
                                                key={term}
                                                onClick={() => submitSearch(term)}
                                                className="flex items-center space-x-2 px-3.5 py-1.5 bg-white/5 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all group"
                                            >
                                                <Clock className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                                                <span>{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Trending Now</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {trendingTerms.map((term, i) => (
                                        <button
                                            key={term}
                                            onClick={() => submitSearch(term)}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-all text-left"
                                        >
                                            <span className="text-xs sm:text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{term}</span>
                                            <Zap className={`w-3.5 h-3.5 ${i === 0 ? 'text-amber-500' : 'text-slate-600'} group-hover:text-amber-400`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {query && results && (
                        <div className="p-2 space-y-3">
                            {(results.categories.length > 0 || results.brands.length > 0) && (
                                <div className="p-2 grid grid-cols-2 gap-3 border-b border-white/10 pb-3">
                                    {results.categories.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Categories</p>
                                            {results.categories.map((cat: any) => (
                                                <Link
                                                    key={cat._id}
                                                    href={`/shop?category=${cat.slug}&showFilters=false`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline truncate"
                                                >
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {results.brands.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brands</p>
                                            {results.brands.map((brand) => (
                                                <Link
                                                    key={brand}
                                                    href={`/shop?showFilters=true&brands=${encodeURIComponent(brand)}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block text-xs font-bold text-slate-300 hover:text-white truncate"
                                                >
                                                    {brand}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-1">
                                {results.products.length === 0 ? (
                                    <div className="p-6 text-center space-y-1">
                                        <p className="text-slate-400 text-xs italic">No matches found for "{query}"</p>
                                    </div>
                                ) : (
                                    results.products.map((product: any) => (
                                        <Link
                                            key={product._id}
                                            href={`/products/${product.slug}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all group"
                                        >
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg overflow-hidden shrink-0 relative">
                                                <Image
                                                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                                                    alt={product.name}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">{product.name}</h4>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{product.category?.name || 'Product'}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs sm:text-sm font-black text-white italic">₦{product.variants?.[0]?.sellingPrice?.toLocaleString()}</p>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                                        </Link>
                                    ))
                                )}
                            </div>

                            <div className="pt-2 border-t border-white/10">
                                <button
                                    onClick={() => submitSearch(query)}
                                    className="w-full py-2.5 sm:py-3 bg-blue-600/20 text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>See all results</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    ) : null;

    return (
        <div className={`relative ${isHero ? 'w-full max-w-xl' : ''} ${className}`}>
            {/* Header Collapsed Button (Header variant only) */}
            {!isHero && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-slate-400 hover:text-white transition-colors rounded-xl active:scale-95 flex items-center justify-center shrink-0"
                    aria-label="Open search"
                >
                    <Search className="w-5 h-5" />
                </button>
            )}

            {/* Portal Overlay for Header Search */}
            {headerModalContent}

            {/* Hero Variant Display */}
            {isHero && (
                <div ref={searchRef} className="w-full relative">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl h-14 sm:h-16 shadow-2xl focus-within:border-blue-500/50 flex items-center px-3 sm:px-4 group">
                        <Sparkles className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6 mr-2.5 sm:mr-3 shrink-0" />
                        <input
                            type="text"
                            onFocus={() => setIsOpen(true)}
                            placeholder={placeholder || "Ask Your Plug... (e.g. 'iPhone 15 Case')"}
                            value={query}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent text-white outline-none placeholder-slate-500 text-sm sm:text-base font-medium"
                        />
                        {isLoading ? (
                            <Zap className="w-4 h-4 text-amber-500 animate-pulse ml-2 shrink-0" />
                        ) : query ? (
                            <button onClick={() => { setQuery(''); setResults(null); }} className="text-slate-500 hover:text-white ml-2 shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={() => submitSearch(query)} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors ml-2 shrink-0">
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        )}
                    </div>

                    {/* Hero Instant Dropdown Results */}
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            className="relative w-full mt-4 bg-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-50 p-3 sm:p-4"
                        >
                            {!query && (
                                <div className="space-y-4">
                                    {recentSearches.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Recent Searches</p>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map(term => (
                                                    <button key={term} onClick={() => submitSearch(term)} className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                                                        <Clock className="w-3 h-3 text-slate-500" />
                                                        <span>{term}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Trending Searches</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {trendingTerms.map((term) => (
                                                <button key={term} onClick={() => submitSearch(term)} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all text-xs font-bold text-slate-300">
                                                    <span>{term}</span>
                                                    <Zap className="w-3 h-3 text-amber-500" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {query && results && (
                                <div className="space-y-3">
                                    {results.products.slice(0, 4).map((product: any) => (
                                        <Link
                                            key={product._id}
                                            href={`/products/${product.slug}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden shrink-0 relative">
                                                <Image src={product.images?.[0]?.url || '/placeholder.jpg'} alt={product.name} fill unoptimized className="object-cover" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="text-xs font-bold text-white truncate italic">{product.name}</h4>
                                            </div>
                                            <span className="text-xs font-black text-white italic">₦{product.variants?.[0]?.sellingPrice?.toLocaleString()}</span>
                                        </Link>
                                    ))}
                                    <button
                                        onClick={() => submitSearch(query)}
                                        className="w-full py-2.5 bg-blue-600/20 text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center space-x-2"
                                    >
                                        <span>View All Matches</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
