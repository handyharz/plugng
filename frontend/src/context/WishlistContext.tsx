'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistApi } from '@/lib/api';

interface WishlistContextType {
    wishlist: any[];
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    clearWishlist: () => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    totalItems: number;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, isLoading: authLoading } = useAuth();

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setWishlist([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await wishlistApi.get();
            // Assuming the backend returns the full wishlist object with items array
            // Filter out items where product is null
            const validItems = (data.items || []).filter((item: any) => item.product !== null);
            setWishlist(validItems);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchWishlist();
        }
    }, [user, authLoading, fetchWishlist]);

    const addToWishlist = async (productId: string) => {
        if (!user) return;
        try {
            const data = await wishlistApi.add(productId);
            // Filter out items where product is null
            const validItems = (data.items || []).filter((item: any) => item.product !== null);
            setWishlist(validItems);
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (!user) return;
        try {
            const data = await wishlistApi.remove(productId);
            // Filter out items where product is null
            const validItems = (data.items || []).filter((item: any) => item.product !== null);
            setWishlist(validItems);
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    const clearWishlist = async () => {
        if (!user) return;
        try {
            await wishlistApi.clear();
            setWishlist([]);
        } catch (error) {
            console.error('Failed to clear wishlist:', error);
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => (item.product?._id || item.product) === productId);
    };

    const totalItems = wishlist.length;

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            clearWishlist,
            isInWishlist,
            totalItems,
            isLoading
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
