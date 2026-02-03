'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartApi } from '@/lib/api';

export interface CartProduct {
    id: string;
    variantId?: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    description: string;
    image: string;
    category: string;
    selectedOptions?: Record<string, string>;
    walletOnlyDiscount?: {
        enabled: boolean;
        percentage: number;
        validUntil?: Date;
    };
}

export interface CartItem extends CartProduct {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: CartProduct) => Promise<void>;
    removeFromCart: (cartItemId: string) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user, isLoading: loading } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    // Mapper helper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapBackendCartToFrontend = (backendItems: any[]): CartItem[] => {
        return backendItems
            .filter(item => item.product && typeof item.product === 'object') // Filter out null/deleted products
            .map(item => {
                const product = item.product;

                let price = 0;
                let image = product.images?.[0]?.url || '/placeholder.png'; // Safe access with fallback

                if (item.variantId && product.variants) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const variant = product.variants.find((v: any) => v.sku === item.variantId || v._id === item.variantId);
                    if (variant) {
                        price = variant.sellingPrice;
                        if (variant.image) image = variant.image;
                    } else {
                        // Fallback if variant not found (rare)
                        price = product.variants?.[0]?.sellingPrice || 0;
                    }
                } else {
                    price = product.variants?.[0]?.sellingPrice || 0;
                }

                return {
                    id: product._id,
                    variantId: item.variantId,
                    name: product.name,
                    price: price,
                    compareAtPrice: item.variantId && product.variants
                        ? product.variants.find((v: any) => v.sku === item.variantId || v._id === item.variantId)?.compareAtPrice
                        : product.variants?.[0]?.compareAtPrice,
                    description: product.description,
                    image: image,
                    category: typeof product.category === 'string' ? product.category : product.category?.name,
                    selectedOptions: item.selectedOptions, // Map from backend Map/Object
                    quantity: item.quantity,
                    walletOnlyDiscount: product.walletOnlyDiscount
                };
            });
    };

    // Load cart on auth change
    useEffect(() => {
        if (loading) return;

        const syncAndFetchCart = async () => {
            if (user) {
                // If we have local items, sync them first (once)
                const localCart = localStorage.getItem('plugng_cart');
                let itemsToSync = [];
                if (localCart) {
                    try {
                        itemsToSync = JSON.parse(localCart);
                    } catch (e) { console.error('Error parsing local cart', e); }
                }

                if (itemsToSync.length > 0 && !isSyncing) {
                    setIsSyncing(true);
                    console.time('🛒 Cart Sync');
                    try {
                        // Sync local items to server
                        const updatedCart = await cartApi.sync(itemsToSync);
                        console.timeLog('🛒 Cart Sync', 'Server sync complete');
                        setCart(mapBackendCartToFrontend(updatedCart));
                        // Clear local storage after sync
                        localStorage.removeItem('plugng_cart');
                    } catch (error) {
                        console.error('Failed to sync cart:', error);
                    } finally {
                        setIsSyncing(false);
                        console.timeEnd('🛒 Cart Sync');
                    }
                } else if (!isSyncing) {
                    // Just fetch server cart
                    console.time('🛒 Fetch Cart');
                    try {
                        const serverCart = await cartApi.get();
                        setCart(mapBackendCartToFrontend(serverCart));
                    } catch (error) {
                        console.error('Failed to fetch cart:', error);
                    } finally {
                        console.timeEnd('🛒 Fetch Cart');
                    }
                }
            } else {
                // Load from local storage for guest
                const saved = localStorage.getItem('plugng_cart');
                if (saved) {
                    try {
                        setCart(JSON.parse(saved));
                    } catch (e) {
                        console.error('Error parsing local cart', e);
                    }
                }
            }
        };

        syncAndFetchCart();
    }, [user, loading]);

    // Save to local storage only if guest
    useEffect(() => {
        if (!user && !loading) {
            localStorage.setItem('plugng_cart', JSON.stringify(cart));
        }
    }, [cart, user, loading]);

    const addToCart = useCallback(async (product: CartProduct) => {
        // Optimistic update
        const newItem = { ...product, quantity: 1 };
        const itemKey = product.variantId || product.id;

        let newCart: CartItem[] = [];

        setCart(prev => {
            const existing = prev.find(item => (item.variantId || item.id) === itemKey);
            if (existing) {
                newCart = prev.map(item =>
                    (item.variantId || item.id) === itemKey
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                newCart = [...prev, newItem];
            }
            return newCart;
        });
        setIsCartOpen(true);

        if (user) {
            try {
                await cartApi.add({
                    productId: product.id,
                    variantId: product.variantId,
                    quantity: 1,
                    selectedOptions: product.selectedOptions
                });
            } catch (error) {
                console.error('Failed to add to cart API:', error);
            }
        }
    }, [user]);

    const removeFromCart = useCallback(async (cartItemId: string) => {
        setCart(prev => {
            const itemToRemove = prev.find(item => (item.variantId || item.id) === cartItemId);
            const updated = prev.filter(item => (item.variantId || item.id) !== cartItemId);

            if (user && itemToRemove) {
                cartApi.remove({
                    productId: itemToRemove.id,
                    variantId: itemToRemove.variantId
                }).catch(err => console.error('Failed to remove from cart API:', err));
            }
            return updated;
        });
    }, [user]);

    const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
        if (quantity < 1) {
            await removeFromCart(cartItemId);
            return;
        }

        setCart(prev => {
            const itemToUpdate = prev.find(item => (item.variantId || item.id) === cartItemId);
            const updated = prev.map(item =>
                (item.variantId || item.id) === cartItemId ? { ...item, quantity } : item
            );

            if (user && itemToUpdate) {
                cartApi.update({
                    productId: itemToUpdate.id,
                    variantId: itemToUpdate.variantId,
                    quantity: quantity
                }).catch(err => console.error('Failed to update cart quantity API:', err));
            }
            return updated;
        });
    }, [user, removeFromCart]);

    const clearCart = useCallback(() => setCart([]), []);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalAmount,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
