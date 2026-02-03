'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react';
import { getAllProducts, deleteProduct, getCategories, bulkUpdateProducts } from '@/lib/adminApi';
import ProductsTable from '@/components/admin/products/ProductsTable';
import Link from 'next/link';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import StatusModal from '@/components/ui/StatusModal';

export default function AdminProductsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [category, setCategory] = useState('all');
    const [page, setPage] = useState(1);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        confirm: { isOpen: boolean; id: string; title: string; message: string };
        status: { isOpen: boolean; type: 'success' | 'error'; title: string; message: string };
    }>({
        confirm: { isOpen: false, id: '', title: '', message: '' },
        status: { isOpen: false, type: 'success', title: '', message: '' }
    });

    const closeConfirm = () => setModalConfig(prev => ({ ...prev, confirm: { ...prev.confirm, isOpen: false } }));
    const closeStatus = () => setModalConfig(prev => ({ ...prev, status: { ...prev.status, isOpen: false } }));

    const showStatus = (type: 'success' | 'error', title: string, message: string) => {
        setModalConfig(prev => ({
            ...prev,
            status: { isOpen: true, type, title, message }
        }));
    };

    const { data: categoriesData } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: () => getCategories()
    });
    const categories = categoriesData?.data?.categories || [];

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['adminProducts', { search, status, category, page }],
        queryFn: () => getAllProducts({
            search,
            status: status === 'all' ? undefined : status,
            category: category === 'all' ? undefined : category,
            page,
            limit: 10
        }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            showStatus('success', 'Deleted!', 'The product has been permanently removed.');
        },
        onError: (error: any) => {
            showStatus('error', 'Delete Failed', error.response?.data?.message || 'We encountered an error removing this product.');
        }
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: ({ ids, status }: { ids: string[], status: string }) =>
            bulkUpdateProducts(ids, { status }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            showStatus('success', 'Updated!', data.message || 'Products status has been updated.');
        },
        onError: (error: any) => {
            showStatus('error', 'Update Failed', error.response?.data?.message || 'Failed to update multiple products.');
        }
    });

    const handleDelete = (id: string) => {
        setModalConfig(prev => ({
            ...prev,
            confirm: {
                isOpen: true,
                id,
                title: 'Delete Product?',
                message: 'Are you sure you want to delete this product? This action cannot be undone.'
            }
        }));
    };

    const handleConfirmDelete = () => {
        if (modalConfig.confirm.id) {
            deleteMutation.mutate(modalConfig.confirm.id);
            closeConfirm();
        }
    };

    const handleBulkStatusUpdate = async (ids: string[], status: string) => {
        bulkUpdateMutation.mutate({ ids, status });
    };

    const products = data?.data || [];
    const pagination = data?.pagination || { total: 0, pages: 1 };

    return (
        <div className="p-8  mx-auto min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Products Management</h1>
                    <p className="text-slate-400">Total Products: {pagination.total}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => refetch()}
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <Link
                        href="/dashboard/products/new"
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-2 relative text-slate-400 focus-within:text-white transition-colors">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by product name or slug..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 appearance-none transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 appearance-none transition-all"
                    >
                        <option value="all">All Categories</option>
                        {categories.filter((cat: any) => cat.level <= 2).map((cat: any) => (
                            <option key={cat._id} value={cat._id}>{cat.fullName || cat.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    className="hidden md:flex items-center justify-center px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                    onClick={() => {
                        setSearch('');
                        setStatus('all');
                        setCategory('all');
                    }}
                >
                    Clear Filters
                </button>
            </div>

            {/* Table Area */}
            <ProductsTable
                products={products}
                isLoading={isLoading}
                onDelete={handleDelete}
                onBulkUpdate={handleBulkStatusUpdate}
            />

            {/* Pagination */}
            {
                pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-between text-slate-400">
                        <p className="text-sm">
                            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg hober:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-lg border transition-all ${page === p
                                            ? 'bg-blue-600 text-white border-blue-500 font-bold'
                                            : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                disabled={page === pagination.pages}
                                onClick={() => setPage(page + 1)}
                                className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Modals */}
            <ConfirmationModal
                isOpen={modalConfig.confirm.isOpen}
                onClose={closeConfirm}
                onConfirm={handleConfirmDelete}
                title={modalConfig.confirm.title}
                message={modalConfig.confirm.message}
                isLoading={deleteMutation.isPending}
            />

            <StatusModal
                isOpen={modalConfig.status.isOpen}
                onClose={closeStatus}
                type={modalConfig.status.type}
                title={modalConfig.status.title}
                message={modalConfig.status.message}
            />
        </div >
    );
}
