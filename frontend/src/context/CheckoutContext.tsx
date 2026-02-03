'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { orderApi } from '@/lib/api';

import { useRouter } from 'next/navigation';

interface CheckoutContextType {
    initiateCheckout: (shippingDetails: any, paymentMethod?: any, couponCode?: string) => Promise<void>;
    isProcessing: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
    const { cart, totalAmount, clearCart, setIsCartOpen } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const initiateCheckout = async (shippingDetails: any, paymentMethod: string = 'card', couponCode?: string) => {
        if (cart.length === 0) return;

        setIsProcessing(true);
        try {
            const data = await orderApi.create({
                shippingAddress: shippingDetails,
                paymentMethod: paymentMethod,
                couponCode: couponCode
            });

            if (data.paymentUrl) {
                console.log('Redirecting to Paystack:', data.paymentUrl);
                setIsCartOpen(false);
                window.location.href = data.paymentUrl;
            } else if (data.reference) {
                // Dev mode successful order - Success page handles clearing
                setIsCartOpen(false);
                router.push(`/checkout/success?reference=${data.reference}`);
            } else {
                // Fallback for safety
                alert('Order created! No reference returned.');
                setIsCartOpen(false);
                router.push('/');
            }
        } catch (error: any) {
            console.error('Checkout Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create order. Please try again.';
            alert(errorMessage);
            setIsProcessing(false); // Only reset on error
        }
    };

    return (
        <CheckoutContext.Provider value={{ initiateCheckout, isProcessing }}>
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const context = useContext(CheckoutContext);
    if (context === undefined) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
}
