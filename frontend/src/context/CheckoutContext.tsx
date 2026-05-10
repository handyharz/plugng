'use client';

import React, { createContext, useContext, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { orderApi } from '@/lib/api';

import { useRouter } from 'next/navigation';

type CheckoutErrorShape = {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
};

interface CheckoutContextType {
    initiateCheckout: (shippingDetails: any, paymentMethod?: any, couponCode?: string) => Promise<void>;
    isProcessing: boolean;
    processingMessage: string;
    redirectUrl: string | null;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
    const { cart, setIsCartOpen } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('Verifying your order...');
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const router = useRouter();

    const resetProcessingState = () => {
        setIsProcessing(false);
        setProcessingMessage('Verifying your order...');
        setRedirectUrl(null);
    };

    const initiateCheckout = async (shippingDetails: any, paymentMethod: string = 'card', couponCode?: string) => {
        if (cart.length === 0) return;

        setIsProcessing(true);
        setRedirectUrl(null);
        setProcessingMessage(
            paymentMethod === 'afriexchange'
                ? 'Creating your AfriExchange payment request...'
                : 'Preparing secure checkout...'
        );

        try {
            const data = await orderApi.create({
                shippingAddress: shippingDetails,
                paymentMethod: paymentMethod,
                couponCode: couponCode,
                callbackUrl: `${window.location.origin}/checkout/success`
            });

            if (data.paymentUrl) {
                const providerName = data.provider === 'afriexchange' ? 'AfriExchange' : 'payment gateway';

                setProcessingMessage(`Redirecting to ${providerName}...`);
                setRedirectUrl(data.paymentUrl);
                setIsCartOpen(false);

                if (typeof window !== 'undefined') {
                    window.sessionStorage.setItem(
                        'plugng_pending_checkout',
                        JSON.stringify({
                            paymentUrl: data.paymentUrl,
                            reference: data.reference,
                            provider: data.provider || paymentMethod
                        })
                    );
                }

                window.setTimeout(() => {
                    window.location.assign(data.paymentUrl as string);
                }, 150);

                // If the redirect is blocked or slow, recover the UI and let the user continue manually.
                window.setTimeout(() => {
                    setIsProcessing(false);
                    setProcessingMessage(`If the redirect did not open, continue to ${providerName} manually.`);
                }, 4000);
            } else if (data.reference) {
                // Dev mode successful order - Success page handles clearing
                setIsCartOpen(false);
                const providerQuery = data.provider ? `&provider=${encodeURIComponent(data.provider)}` : '';
                resetProcessingState();
                router.push(`/checkout/success?reference=${encodeURIComponent(data.reference)}${providerQuery}`);
            } else {
                // Fallback for safety
                resetProcessingState();
                alert('Order created! No reference returned.');
                setIsCartOpen(false);
                router.push('/');
            }
        } catch (error: unknown) {
            console.error('Checkout Error:', error);
            const checkoutError = error as CheckoutErrorShape;
            const errorMessage =
                checkoutError.response?.data?.message ||
                checkoutError.message ||
                'Failed to create order. Please try again.';
            alert(errorMessage);
            resetProcessingState();
        }
    };

    return (
        <CheckoutContext.Provider value={{ initiateCheckout, isProcessing, processingMessage, redirectUrl }}>
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
