'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ProductForm from '@/components/admin/products/ProductForm';
import { updateProduct, getProductById } from '@/lib/adminApi';
import { Product } from '@/lib/api';
import StatusModal from '@/components/ui/StatusModal';
import { useState } from 'react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: productData, isLoading: isFetching } = useQuery({
        queryKey: ['adminProduct', id],
        queryFn: () => getProductById(id),
    });

    const product = productData?.data;

    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const showStatus = (type: 'success' | 'error', title: string, message: string) => {
        setStatusModal({ isOpen: true, type, title, message });
    };

    const mutation = useMutation({
        mutationFn: (data: any) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            queryClient.invalidateQueries({ queryKey: ['adminProduct', id] });
            showStatus('success', 'Updated Successfully', 'Product details and variants have been updated.');
            setTimeout(() => {
                router.push('/dashboard/products');
            }, 2000);
        },
        onError: (error: any) => {
            showStatus('error', 'Update Failed', error.response?.data?.message || 'We encountered an error updating this product.');
        }
    });

    const handleSubmit = (data: any) => {
        // Remove _id and other read-only fields if they are in data
        const { _id, createdAt, updatedAt, __v, ...updateData } = data;
        mutation.mutate(updateData);
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400">Fetching product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-8 text-center bg-slate-900 border border-white/10 rounded-xl m-8">
                <h2 className="text-xl font-bold text-white mb-2">Product not found</h2>
                <p className="text-slate-400 mb-6">The product you are trying to edit does not exist or has been removed.</p>
                <Link
                    href="/dashboard/products"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/dashboard/products"
                    className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Edit Product</h1>
                    <p className="text-slate-400 text-sm">Update "{product.name}" details and variants</p>
                </div>
            </div>

            <ProductForm
                initialData={product as any}
                onSubmit={handleSubmit}
                isLoading={mutation.isPending}
            />

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />
        </div>
    );
}
