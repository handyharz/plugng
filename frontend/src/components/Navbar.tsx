'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Menu, User, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { motion } from 'framer-motion';
import { UserMenu } from './UserMenu';
import { SearchBar } from './SearchBar';
import { useAuth } from '@/context/AuthContext';
import { CategoryDropdown } from './CategoryDropdown';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
    const { totalItems, setIsCartOpen } = useCart();
    const { totalItems: wishlistCount } = useWishlist();
    const { user } = useAuth();

    const navLinks = [
        { name: 'Shop', href: '/shop?showFilters=false' },
        { name: 'Deals', href: '/shop?onSale=true' },
        { name: 'Track Order', href: '/track' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto glass-card rounded-[2rem] px-8 py-4 flex items-center justify-between border-white/20 shadow-blue-500/5">
                <Link href="/" className="flex items-center space-x-2 group shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Zap className="text-white w-6 h-6 fill-current" />
                    </div>
                    <span className="text-xl font-black tracking-tighter italic text-white hidden sm:block">
                        Plug<span className="text-blue-500">NG</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <CategoryDropdown />
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center space-x-3">
                    <SearchBar />

                    {user && <NotificationBell />}

                    <Link
                        href="/profile?tab=wishlist"
                        className="relative p-2 text-slate-400 hover:text-pink-500 transition-colors group"
                    >
                        <Heart size={20} />
                        {wishlistCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]"
                            >
                                {wishlistCount}
                            </motion.span>
                        )}
                    </Link>

                    {user ? (
                        <UserMenu />
                    ) : (
                        <Link
                            href="/login"
                            className="px-5 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-slate-200 active:scale-95 shrink-0"
                        >
                            Sign In
                        </Link>
                    )}

                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ShoppingCart size={20} />
                        {totalItems > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]"
                            >
                                {totalItems}
                            </motion.span>
                        )}
                    </button>

                    <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
