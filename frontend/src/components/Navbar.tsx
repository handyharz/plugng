'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Zap, Menu, Heart, X, ChevronRight, User, Package, Wallet, Phone, Mail, LogOut, Flame, Layers, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserMenu } from './UserMenu';
import { SearchBar } from './SearchBar';
import { useAuth } from '@/context/AuthContext';
import { CategoryDropdown } from './CategoryDropdown';
import { NotificationBell } from './NotificationBell';
import { formatCurrency } from '@/lib/utils';

export function Navbar() {
    const { totalItems, setIsCartOpen } = useCart();
    const { totalItems: wishlistCount } = useWishlist();
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile drawer on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scrolling when mobile drawer is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'Shop', href: '/shop?showFilters=false' },
        { name: 'Deals', href: '/shop?onSale=true' },
        { name: 'Track Order', href: '/track' },
    ];

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-3 py-2 sm:px-6 sm:py-4">
                <div className="max-w-[1440px] mx-auto glass-card rounded-2xl sm:rounded-[2rem] px-4 py-3 md:px-8 md:py-4 flex items-center justify-between border-white/20 shadow-blue-500/5">
                    {/* Brand Logo & Name */}
                    <Link href="/" className="flex items-center space-x-2 group shrink-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="text-white w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                        </div>
                        <span className="text-lg sm:text-xl font-black tracking-tighter italic text-white flex items-center">
                            Plug<span className="text-blue-500">NG</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
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

                    {/* Actions */}
                    <div className="flex items-center space-x-1.5 sm:space-x-3">
                        <SearchBar />

                        {user && (
                            <div className="hidden sm:block">
                                <NotificationBell />
                            </div>
                        )}

                        <Link
                            href="/profile?tab=wishlist"
                            className="hidden sm:flex relative p-2 text-slate-400 hover:text-pink-500 transition-colors group"
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

                        {/* User Profile / Auth Button on Desktop */}
                        <div className="hidden md:block">
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
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-slate-400 hover:text-white transition-colors group"
                            aria-label="Open cart"
                        >
                            <ShoppingCart className="w-5 h-5 sm:w-5 sm:h-5" />
                            {totalItems > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]"
                                >
                                    {totalItems}
                                </motion.span>
                            )}
                        </button>

                        {/* Hamburger Button (Mobile Only) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors active:scale-95"
                            aria-label="Open navigation menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Drawer Overlay */}
            <AnimatePresence key="mobile-nav-presence">
                {isMobileMenuOpen && (
                    <React.Fragment key="mobile-menu-fragment">
                        {/* Backdrop */}
                        <motion.div
                            key="mobile-menu-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] md:hidden"
                        />

                        {/* Slide-out Drawer */}
                        <motion.div
                            key="mobile-menu-drawer"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="fixed top-0 right-0 bottom-0 w-[88%] max-w-sm bg-[#0a0a0a] border-l border-white/10 z-[101] flex flex-col justify-between p-5 md:hidden overflow-y-auto shadow-2xl"
                        >
                            <div className="space-y-6">
                                {/* Drawer Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Zap className="text-white w-5 h-5 fill-current" />
                                        </div>
                                        <span className="text-lg font-black tracking-tighter italic text-white">
                                            Plug<span className="text-blue-500">NG</span>
                                        </span>
                                    </Link>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 active:scale-95 transition-all"
                                        aria-label="Close navigation menu"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* User Info Card or Sign In Banner */}
                                {user ? (
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 relative overflow-hidden">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base border border-blue-400/30 shadow-md">
                                                {getInitials(user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || 'User'))}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-sm font-bold text-white truncate">
                                                        {user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || 'User')}
                                                    </h3>
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                                                        {user.loyaltyTier || user.tier || 'MASTER'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-medium">Wallet Balance:</span>
                                            <span className="text-sm font-black text-emerald-400 italic">
                                                {formatCurrency(user.wallet?.balance ?? user.walletBalance ?? 0)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                                        <p className="text-xs text-slate-300 font-medium">
                                            Sign in to access your wallet balance, orders, and exclusive rewards.
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <Link
                                                href="/login"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl text-center transition-colors"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl text-center transition-colors border border-white/10"
                                            >
                                                Register
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Main Navigation Section */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Navigation</p>
                                    <div className="space-y-1">
                                        <Link
                                            href="/shop?showFilters=false"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Layers className="w-5 h-5 text-blue-400" />
                                                <span>Shop Inventory</span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-500" />
                                        </Link>

                                        <Link
                                            href="/shop?onSale=true"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Flame className="w-5 h-5 text-red-500" />
                                                <span>Hot Deals</span>
                                            </div>
                                            <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full uppercase">Sale</span>
                                        </Link>

                                        <Link
                                            href="/categories"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Package className="w-5 h-5 text-purple-400" />
                                                <span>Categories & Brands</span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-500" />
                                        </Link>

                                        <Link
                                            href="/track"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Truck className="w-5 h-5 text-emerald-400" />
                                                <span>Track Order Status</span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-500" />
                                        </Link>
                                    </div>
                                </div>

                                {/* User Shortcuts Section */}
                                {user && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">My Account</p>
                                        <div className="space-y-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white font-medium text-xs transition-all"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <User size={18} className="text-slate-400" />
                                                    <span>Profile Settings</span>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-600" />
                                            </Link>

                                            <Link
                                                href="/profile?tab=orders"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white font-medium text-xs transition-all"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Package size={18} className="text-slate-400" />
                                                    <span>My Orders</span>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-600" />
                                            </Link>

                                            <Link
                                                href="/profile?tab=wallet"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white font-medium text-xs transition-all"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Wallet size={18} className="text-slate-400" />
                                                    <span>Plug Wallet</span>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-600" />
                                            </Link>

                                            <Link
                                                href="/profile?tab=wishlist"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white font-medium text-xs transition-all"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Heart size={18} className="text-slate-400" />
                                                    <span>Saved Wishlist</span>
                                                </div>
                                                {wishlistCount > 0 && (
                                                    <span className="text-[10px] font-bold bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">
                                                        {wishlistCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Support Info Block */}
                                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Support</p>
                                    <div className="space-y-1.5 text-xs text-slate-400">
                                        <div className="flex items-center space-x-2">
                                            <Phone size={14} className="text-blue-400" />
                                            <span>+234 810 706 0160</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Mail size={14} className="text-blue-400" />
                                            <span>support@plugng.shop</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sign Out Button */}
                            {user && (
                                <div className="pt-4 mt-6 border-t border-white/10">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95"
                                    >
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </React.Fragment>
                )}
            </AnimatePresence>
        </>
    );
}
