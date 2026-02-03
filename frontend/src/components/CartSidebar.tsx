'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { X, ShoppingBag, Trash2, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function CartSidebar() {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        totalAmount
    } = useCart();
    const { initiateCheckout, isProcessing } = useCheckout();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-screen w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <ShoppingBag className="text-blue-500 w-6 h-6" />
                                <h2 className="text-xl font-black tracking-tighter uppercase italic text-white">Your Plug</h2>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {cart.length > 0 ? (
                                cart.map((item) => {
                                    const itemKey = item.variantId || item.id;
                                    return (
                                        <motion.div
                                            layout
                                            key={itemKey}
                                            className="flex space-x-4 group"
                                        >
                                            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {item.name}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeFromCart(itemKey)}
                                                        className="p-1 text-slate-600 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                                                        {item.category}
                                                    </p>
                                                    {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                                                                <span key={key} className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded-md border border-blue-500/10">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-1 px-2 border border-white/10">
                                                        <button
                                                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                                                            className="text-slate-400 hover:text-white font-bold"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-xs font-black text-white w-4 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                                                            className="text-slate-400 hover:text-white font-bold"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-black text-white tracking-tighter italic">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20 grayscale">
                                    <ShoppingBag size={80} className="text-slate-400" />
                                    <p className="font-bold uppercase tracking-[0.2em] text-sm">Plug is Empty</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-colors backdrop-blur-md border border-white/5"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-8 border-t border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Valuation</span>
                                    <span className="text-2xl font-black text-white tracking-tighter italic">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>

                                <div className="w-full">
                                    <Link
                                        href="/checkout"
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center space-x-2 group/checkout"
                                    >
                                        <span>Proceed to Checkout</span>
                                        <ArrowRight className="w-4 h-4 group-hover/checkout:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                                <div className="flex items-center justify-center space-x-2 text-slate-500 opacity-50">
                                    <ShieldCheck size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Secured by PayUnify Gateway</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
