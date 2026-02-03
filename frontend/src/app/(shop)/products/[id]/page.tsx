'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi, reviewApi } from '@/lib/api';
import { ProductDetails } from '@/components/ProductDetails';
import { ProductReviews } from '@/components/ProductReviews';
import { RelatedProducts } from '@/components/RelatedProducts';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

export default function ProductPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: product, isLoading: isProductLoading, error: productError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productApi.getById(id),
    });

    const { data: reviews, isLoading: isReviewsLoading } = useQuery({
        queryKey: ['product-reviews', id],
        queryFn: () => reviewApi.getProductReviews(id),
        enabled: !!product?._id,
    });

    const isLoading = isProductLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen pt-3 px-6 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-t-2 border-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Gear...</p>
                </div>
            </div>
        );
    }

    if (productError || !product) {
        return (
            <div className="min-h-screen pt-3 px-6 flex items-center justify-center text-center">
                <div className="space-y-6">
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gear Not Found</h2>
                    <p className="text-slate-400">The product you're looking for might have been retired.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="cyber-button px-8"
                    >
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-3 pb-20 px-6">
            <div className="max-w-7xl mx-auto space-y-24">
                <ProductDetails product={product}>
                    <ProductReviews reviews={reviews || []} />
                </ProductDetails>

                <div>
                    <RelatedProducts
                        currentProductId={product._id}
                        categorySlug={typeof product.category === 'string' ? product.category : product.category.slug}
                        limit={4}
                        compact={false}
                    />
                </div>
            </div>
        </main>
    );
}
