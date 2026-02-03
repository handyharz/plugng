'use client';

import React from 'react';
import { CartProduct, useCart } from '@/context/CartContext';
import { ShoppingCart, Zap, Heart } from 'lucide-react';
import { wishlistApi } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
    product: CartProduct;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const isWishlisted = isInWishlist(product.id);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const isWalletDiscountActive = product.walletOnlyDiscount?.enabled &&
        (!product.walletOnlyDiscount.validUntil || new Date(product.walletOnlyDiscount.validUntil) > new Date());

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "50px" }}
            className="group glass-card rounded-[2.5rem] overflow-hidden flex flex-col h-full hover:border-white/30 hover:shadow-blue-500/10 transition-all duration-500"
        >
            <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-900/50">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-6 left-6 z-10">
                    <span className="bg-black/50 backdrop-blur-md text-[10px] font-black text-white px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                        {product.category}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="mt-2">
                            <span className="bg-red-500 text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/20">
                                On Sale
                            </span>
                        </div>
                    )}
                    {isWalletDiscountActive && (
                        <div className="mt-2">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/20">
                                {product.walletOnlyDiscount?.percentage}% OFF with Wallet
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-8 flex flex-col flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                        {product.name}
                    </h3>
                </div>

                <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                <div className="pt-4 mt-auto flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col">
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs text-slate-500 line-through decoration-red-500/50">
                                {formatCurrency(product.compareAtPrice)}
                            </span>
                        )}
                        <p className="text-lg font-black text-white tracking-tighter italic">
                            {formatCurrency(product.price)}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={async () => {
                                if (isWishlisted) {
                                    await removeFromWishlist(product.id);
                                } else {
                                    await addToWishlist(product.id);
                                }
                            }}
                            className={`w-12 h-12 border rounded-2xl flex items-center justify-center transition-all duration-300 group/wish ${isWishlisted
                                ? 'bg-pink-500/20 text-pink-500 border-pink-500/50'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/30'
                                }`}
                        >
                            <Heart className={`w-5 h-5 group-hover/wish:scale-110 transition-transform ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={() => addToCart(product)}
                            className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-xl shadow-black/10 group/btn"
                        >
                            <ShoppingCart className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div >
    );
}
