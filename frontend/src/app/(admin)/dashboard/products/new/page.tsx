'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import ProductForm from '@/components/admin/products/ProductForm';
import { createProduct } from '@/lib/adminApi';
import StatusModal from '@/components/ui/StatusModal';
import { useState } from 'react';

export default function NewProductPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

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

    const mutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Created!',
                message: 'Your new product has been successfully listed.'
            });
            setTimeout(() => {
                router.push('/dashboard/products');
            }, 2000);
        },
        onError: (error: any) => {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Creation Failed',
                message: error.response?.data?.message || 'We encountered an error creating this product.'
            });
        }
    });

    const handleSubmit = (data: any) => {
        mutation.mutate(data);
    };

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
                    <h1 className="text-2xl font-bold text-white">Add New Product</h1>
                    <p className="text-slate-400 text-sm">Create a new product listing for your shop</p>
                </div>
            </div>

            <ProductForm
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
