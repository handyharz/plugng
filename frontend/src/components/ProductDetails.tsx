'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { ProductGallery } from './ProductGallery';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, ShieldCheck, Truck, RefreshCcw, Heart } from 'lucide-react';
import { RelatedProducts } from './RelatedProducts';
import { useWishlist } from '@/context/WishlistContext';

interface ProductDetailsProps {
    product: Product;
    children?: React.ReactNode;
}

export function ProductDetails({ product, children }: ProductDetailsProps) {
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const isWishlisted = isInWishlist(product._id);

    // 1. Extract Unique Attributes
    const attributeNames = useMemo(() => {
        if (!product.variants) return [];
        const names = new Set<string>();
        product.variants.forEach(v => {
            const keys = v.attributeValues instanceof Map
                ? Array.from(v.attributeValues.keys())
                : Object.keys(v.attributeValues || {});
            keys.forEach(key => names.add(key));
        });
        return Array.from(names);
    }, [product.variants]);

    // 1.5. Aggregate All Unique Images for the Gallery
    const allImages = useMemo(() => {
        const uniqueImages = new Map<string, { url: string; alt?: string }>();

        // Add primary product images first
        product.images.forEach(img => {
            if (img.url) uniqueImages.set(img.url, { url: img.url, alt: img.alt || product.name });
        });

        // Add variant images if they are unique
        product.variants?.forEach(v => {
            if (v.image && !uniqueImages.has(v.image)) {
                uniqueImages.set(v.image, { url: v.image, alt: `${product.name} - ${Object.values(v.attributeValues).join(' ')}` });
            }
        });

        return Array.from(uniqueImages.values());
    }, [product.images, product.variants, product.name]);

    // 2. Initial Selected Options
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            const entries = firstVariant.attributeValues instanceof Map
                ? Array.from(firstVariant.attributeValues.entries())
                : Object.entries(firstVariant.attributeValues || {});

            entries.forEach(([key, value]) => {
                initial[key] = value;
            });
        }
        return initial;
    });

    // 3. Find Matching Variant
    const selectedVariant = useMemo(() => {
        if (!product.variants) return null;
        return product.variants.find(v =>
            Object.entries(selectedOptions).every(([key, value]) => {
                const attrVal = v.attributeValues instanceof Map
                    ? v.attributeValues.get(key)
                    : v.attributeValues[key];
                return attrVal === value;
            })
        ) || product.variants[0];
    }, [product.variants, selectedOptions]);

    const handleOptionChange = (name: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [name]: value }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const currentPrice = selectedVariant?.sellingPrice || 0;
    const comparePrice = selectedVariant?.compareAtPrice;

    const handleAddToCart = () => {
        const cartProduct = {
            id: product._id,
            variantId: selectedVariant?._id || selectedVariant?.sku,
            name: product.name,
            price: currentPrice,
            description: product.description,
            image: selectedVariant?.image || product.images[0]?.url,
            category: typeof product.category === 'string' ? product.category : product.category.name,
            selectedOptions
        };
        addToCart(cartProduct as any);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left: Gallery + Reviews Section */}
            <div className="lg:col-span-7 space-y-12">
                <div className="space-y-8">
                    <ProductGallery
                        images={allImages}
                        activeImageUrl={selectedVariant?.image}
                    />
                </div>

                {/* Embedded Content (Reviews) */}
                {children && (
                    <div className="mt-16">
                        {children}
                    </div>
                )}
            </div>

            {/* Right: Info (Sticky) */}
            <div className="lg:col-span-5">
                <div className="sticky top-24 space-y-10">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-2"
                        >
                            <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                {typeof product.category === 'string' ? 'Premium Gear' : product.category.name}
                            </span>
                            {selectedVariant?.stock && selectedVariant.stock > 0 ? (
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                                    In Stock
                                </span>
                            ) : (
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
                                    Out of Stock
                                </span>
                            )}
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none italic uppercase">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline space-x-4">
                            <p className="text-3xl font-black text-white tracking-tighter italic">
                                {formatCurrency(currentPrice)}
                            </p>
                            {comparePrice && (
                                <p className="text-xl font-bold text-slate-500 line-through tracking-tighter italic">
                                    {formatCurrency(comparePrice)}
                                </p>
                            )}
                        </div>
                    </div>

                    <p className="text-slate-400 font-medium leading-relaxed text-lg max-w-xl">
                        {product.description}
                    </p>

                    {/* Variant Selectors */}
                    <div className="space-y-8">
                        {attributeNames.map(attrName => {
                            const isColor = /colou?r/i.test(attrName);
                            // Case-insensitive and spelling-flexible option lookup
                            const optionsData = product.options?.find(opt =>
                                opt.name.toLowerCase() === attrName.toLowerCase() ||
                                (/colou?r/i.test(opt.name) && isColor)
                            );

                            // Helper to get attribute value (handles Map or Object)
                            const getAttrValue = (v: any, key: string) => {
                                if (!v.attributeValues) return undefined;
                                if (v.attributeValues instanceof Map) return v.attributeValues.get(key);
                                return v.attributeValues[key];
                            };

                            const allValuesForAttr = Array.from(new Set(product.variants?.map(v => getAttrValue(v, attrName)))).filter(Boolean);

                            return (
                                <div key={attrName} className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                        Select {attrName}
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {allValuesForAttr.map(value => {
                                            // 1. Try to find explicit swatch URL
                                            let swatchUrl = optionsData?.values.find(v =>
                                                v.value.toLowerCase() === String(value).toLowerCase()
                                            )?.swatchUrl;

                                            // 2. Fallback: If it's a color attribute and swatch is missing, use the first matching variant's image
                                            if (!swatchUrl && isColor) {
                                                swatchUrl = product.variants?.find(v => getAttrValue(v, attrName) === value)?.image;
                                            }

                                            const isSelected = selectedOptions[attrName] === value;

                                            return (
                                                <button
                                                    key={String(value)}
                                                    onClick={() => handleOptionChange(attrName, String(value))}
                                                    title={String(value)}
                                                    className={`transition-all duration-300 flex items-center space-x-3 ${isColor && swatchUrl
                                                        ? `pr-6 pl-1 py-1 rounded-full border-2 overflow-hidden ${isSelected ? 'border-blue-600 bg-blue-600/10 scale-105 shadow-lg shadow-blue-500/20' : 'border-white/10 hover:border-white/30'}`
                                                        : `px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${isSelected
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
                                                        }`
                                                        }`}
                                                >
                                                    {isColor && swatchUrl ? (
                                                        <>
                                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                                                <img src={swatchUrl} alt={String(value)} className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                                                {String(value)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        String(value)
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-6 space-y-6">
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedVariant || selectedVariant.stock === 0}
                                className="flex-grow cyber-button py-6 text-lg font-black uppercase italic tracking-tighter group flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                <span>{selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Gear Bag'}</span>
                            </button>

                            <button
                                onClick={async () => {
                                    if (isWishlisted) {
                                        await removeFromWishlist(product._id);
                                    } else {
                                        await addToWishlist(product._id);
                                    }
                                }}
                                className={`w-20 border rounded-[2rem] flex items-center justify-center transition-all duration-300 group/wish ${isWishlisted
                                    ? 'bg-pink-500/20 text-pink-500 border-pink-500/50'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-pink-500 hover:bg-pink-500/10 hover:border-pink-500/30'
                                    }`}
                            >
                                <Heart className={`w-6 h-6 group-hover/wish:scale-110 transition-transform ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                            <div className="flex items-center space-x-3 text-slate-400">
                                <Truck className="w-5 h-5 text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Fast Delivery</span>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-400">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Original Gear</span>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-400">
                                <RefreshCcw className="w-5 h-5 text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
