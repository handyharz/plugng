'use client';

import {
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Package
} from 'lucide-react';
import { AdminProduct } from '@/types/admin';
import Link from 'next/link';
import { useState } from 'react';

interface ProductsTableProps {
    products: AdminProduct[];
    isLoading: boolean;
    onDelete?: (id: string) => void;
    onBulkUpdate?: (ids: string[], status: string) => Promise<void>;
}

export default function ProductsTable({ products, isLoading, onDelete, onBulkUpdate }: ProductsTableProps) {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p._id));
        }
    };

    const toggleSelectProduct = (id: string) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(pId => pId !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const handleBulkUpdate = async (status: string) => {
        if (!onBulkUpdate || selectedProducts.length === 0) return;
        setIsUpdating(true);
        try {
            await onBulkUpdate(selectedProducts, status);
            setSelectedProducts([]);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(value);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Active</span>;
            case 'draft':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Draft</span>;
            case 'out_of_stock':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Out of Stock</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
        }
    };

    const calculateTotalStock = (product: AdminProduct) => {
        return product.variants?.reduce((acc, variant) => acc + variant.stock, 0) || 0;
    };

    const isLowStock = (product: AdminProduct) => {
        const totalStock = calculateTotalStock(product);
        return totalStock <= product.lowStockThreshold;
    };

    const getDisplayPrice = (product: AdminProduct) => {
        if (product.price) return formatCurrency(product.price);
        if (product.variants && product.variants.length > 0) {
            const prices = product.variants.map(v => v.sellingPrice);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`;
        }
        return 'N/A';
    };

    if (isLoading) {
        return (
            <div className="bg-slate-900 border border-white/10 rounded-xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading products...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="bg-slate-900 border border-white/10 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-6">
                    Start adding products to your shop to see them here.
                </p>
                <Link
                    href="/dashboard/products/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={products.length > 0 && selectedProducts.length === products.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-white/10 bg-slate-800 text-blue-600 focus:ring-blue-500/20 transition-colors"
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((product) => {
                            const totalStock = calculateTotalStock(product);
                            const lowStock = isLowStock(product);
                            const categoryName = typeof product.category === 'object' ? ((product.category as any).fullName || (product.category as any).name) : 'Uncategorized';
                            const isSelected = selectedProducts.includes(product._id);

                            return (
                                <tr key={product._id} className={`hover:bg-white/5 transition-colors group ${isSelected ? 'bg-blue-500/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelectProduct(product._id)}
                                            className="w-4 h-4 rounded border-white/10 bg-slate-800 text-blue-600 focus:ring-blue-500/20 transition-colors"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded bg-slate-800 flex-shrink-0 overflow-hidden border border-white/5 mr-4">
                                                <img
                                                    src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                                    {product.name}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {product.slug}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-400">
                                            {categoryName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(product.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <span className={`text-sm font-medium ${lowStock ? 'text-red-400' : 'text-slate-300'}`}>
                                                {totalStock} in stock
                                            </span>
                                            {lowStock && product.status === 'active' && (
                                                <AlertTriangle className="w-4 h-4 text-red-400 ml-2" />
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500">
                                            {product.variants?.length || 0} variants
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-white">
                                            {getDisplayPrice(product)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/products/${product._id}`}
                                                target="_blank"
                                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                                title="View Source"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={`/dashboard/products/${product._id}/edit`}
                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-colors"
                                                title="Edit Product"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => onDelete?.(product._id)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                                                title="Delete Product"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Bulk Action Bar */}
            {selectedProducts.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
                    <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-blue-500/10 flex items-center gap-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                {selectedProducts.length}
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-tighter">Products Selected</span>
                        </div>

                        <div className="h-8 w-px bg-white/10"></div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkUpdate('active')}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-xs font-black text-green-400 uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                Activate
                            </button>
                            <button
                                onClick={() => handleBulkUpdate('draft')}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-xs font-black text-amber-400 uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                Draft
                            </button>
                            <button
                                onClick={() => setSelectedProducts([])}
                                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
