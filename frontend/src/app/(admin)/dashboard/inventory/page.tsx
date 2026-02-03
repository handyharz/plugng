'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Package,
    AlertTriangle,
    TrendingUp,
    Database,
    Search,
    RefreshCw,
    Plus,
    Minus,
    ArrowUpDown,
    CheckCircle2,
    History,
    FileText,
    ArrowUpCircle,
    ArrowDownCircle,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Layers
} from 'lucide-react';
import { getInventoryOverview, adjustStock } from '@/lib/adminApi';
import StatusModal from '@/components/ui/StatusModal';

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
    const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
    const [adjustingVariant, setAdjustingVariant] = useState<any>(null);
    const [adjustAmount, setAdjustAmount] = useState(0);
    const [adjustReason, setAdjustReason] = useState('correction');
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

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['inventoryOverview'],
        queryFn: getInventoryOverview,
    });

    const adjustMutation = useMutation({
        mutationFn: adjustStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventoryOverview'] });
            setAdjustingProduct(null);
            setAdjustAmount(0);
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Stock Updated',
                message: 'Inventory level has been adjusted correctly.'
            });
        },
        onError: (error: any) => {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Adjustment Failed',
                message: error.response?.data?.message || 'Failed to adjust stock level.'
            });
        }
    });

    const summary = data?.data?.summary || { totalItems: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0, totalProducts: 0, recentStats: { restock: 0, return: 0, damaged: 0, correction: 0 } };
    const inventory = data?.data?.inventory || [];
    const recentActivities = data?.data?.recentActivities || [];

    const filteredInventory = inventory.filter((item: any) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
        if (filter === 'low') return matchesSearch && item.lowStock;
        if (filter === 'out') return matchesSearch && item.outOfStock;
        return matchesSearch;
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(value);
    };

    const toggleExpand = (productId: string) => {
        setExpandedProducts(prev => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    };

    const handleAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustingProduct) return;

        // Intuitive logic based on reason
        let type: 'restock' | 'deduct' | 'correction' = 'correction';
        let amount = Math.abs(adjustAmount);

        if (adjustReason === 'restock' || adjustReason === 'return') {
            type = 'restock'; // Backend handles restock/return as addition
        } else if (adjustReason === 'damaged') {
            type = 'deduct'; // Backend handles deduct/damaged as subtraction
        } else {
            type = 'correction';
            amount = adjustAmount; // Explicit value for correction
        }

        adjustMutation.mutate({
            productId: adjustingProduct._id,
            variantSku: adjustingVariant?.sku,
            quantity: amount,
            type,
            reason: adjustReason
        });
    };

    return (
        <div className="p-8 mx-auto min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">Inventory <span className="text-blue-500">Terminal</span></h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Global Stock Control & Logistics Intelligence</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all hover:bg-white/10"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                    Sync Database
                </button>
            </div>

            {/* Summary Grid - Primary Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
                    <Database className="w-5 h-5 text-blue-500 mb-4" />
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Total Units</span>
                    <h3 className="text-3xl font-black text-white italic mt-1">{summary.totalItems.toLocaleString()}</h3>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all" />
                    <TrendingUp className="w-5 h-5 text-green-500 mb-4" />
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Asset Value</span>
                    <h3 className="text-3xl font-black text-white italic mt-1">{formatCurrency(summary.totalValue)}</h3>
                </div>
                <div className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                    <AlertTriangle className="w-5 h-5 text-amber-500 mb-4" />
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Low Stock</span>
                    <h3 className="text-3xl font-black text-amber-500 italic mt-1">{summary.lowStockItems}</h3>
                </div>
                <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
                    <Package className="w-5 h-5 text-red-500 mb-4" />
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Stock Out</span>
                    <h3 className="text-3xl font-black text-red-500 italic mt-1">{summary.outOfStockItems}</h3>
                </div>
            </div>

            {/* Reason-Based Metrics - Last 30 Days */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <ArrowUpCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Monthly Restocks</p>
                        <p className="text-lg font-black text-white">{summary.recentStats?.restock || 0}</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <RotateCcw size={20} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Monthly Returns</p>
                        <p className="text-lg font-black text-white">{summary.recentStats?.return || 0}</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                        <ArrowDownCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Damaged/Loss</p>
                        <p className="text-lg font-black text-white">{summary.recentStats?.damaged || 0}</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-400">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Audits/Corrections</p>
                        <p className="text-lg font-black text-white">{summary.recentStats?.correction || 0}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inventory List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                type="text"
                                placeholder="Locate stock by Name or SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all italic font-medium"
                            />
                        </div>
                        <div className="flex bg-slate-950 border border-white/10 rounded-xl p-1">
                            {['all', 'low', 'out'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card bg-slate-900/40 border border-white/10 rounded-[2.5rem] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Entity</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Inventory Level</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-600 italic font-medium">Downloading inventory registry...</td></tr>
                                    ) : filteredInventory.length === 0 ? (
                                        <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-600 italic font-medium">No entities match the current query.</td></tr>
                                    ) : filteredInventory.map((item: any) => (
                                        <React.Fragment key={item._id}>
                                            <tr className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        {item.variants?.length > 1 && (
                                                            <button
                                                                onClick={() => toggleExpand(item._id)}
                                                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                                            >
                                                                {expandedProducts.has(item._id) ? (
                                                                    <ChevronDown className="w-4 h-4 text-blue-500" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                                )}
                                                            </button>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-white italic uppercase">{item.name}</span>
                                                                {item.variants?.length > 1 && (
                                                                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                                                                        <Layers className="w-2.5 h-2.5" />
                                                                        {item.variants.length}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-mono text-slate-500 mt-0.5">{item.sku}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${item.outOfStock ? 'w-0' : (item.lowStock ? 'bg-amber-500 w-1/4' : 'bg-blue-500 w-3/4')}`}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-black italic ${item.outOfStock ? 'text-red-500' : (item.lowStock ? 'text-amber-500' : 'text-white')}`}>
                                                            {item.outOfStock ? 'Out of Stock' : `${item.stock} Units`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    {item.variants?.length === 1 ? (
                                                        <button
                                                            onClick={() => {
                                                                setAdjustingProduct(item);
                                                                setAdjustingVariant(item.variants[0]);
                                                                setAdjustAmount(0);
                                                            }}
                                                            className="inline-flex items-center px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            <ArrowUpDown className="w-3 h-3 mr-2" />
                                                            Adjust
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600 italic">Expand to adjust</span>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedProducts.has(item._id) && item.variants?.map((variant: any, idx: number) => (
                                                <tr key={`${item._id}-${variant.sku}`} className="bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                                    <td className="px-8 py-3 pl-20">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1 h-8 bg-blue-500/20 rounded-full" />
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-medium text-slate-300">
                                                                    {Object.entries(variant.attributeValues).map(([key, val]) => `${val}`).join(' • ') || 'Default'}
                                                                </span>
                                                                <span className="text-[9px] font-mono text-slate-600 mt-0.5">{variant.sku}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all ${variant.isOutOfStock ? 'w-0' : (variant.isLowStock ? 'bg-amber-500 w-1/4' : 'bg-blue-500 w-3/4')}`}
                                                                />
                                                            </div>
                                                            <span className={`text-[11px] font-bold ${variant.isOutOfStock ? 'text-red-500' : (variant.isLowStock ? 'text-amber-500' : 'text-slate-300')}`}>
                                                                {variant.isOutOfStock ? 'Out of Stock' : variant.stock}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setAdjustingProduct(item);
                                                                setAdjustingVariant(variant);
                                                                setAdjustAmount(0);
                                                            }}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            <ArrowUpDown className="w-2.5 h-2.5 mr-1.5" />
                                                            Adjust
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Activity History */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                            <History className="text-blue-500" size={20} />
                            Logistics Log
                        </h3>
                    </div>
                    <div className="glass-card bg-slate-900/40 border border-white/10 rounded-[2rem] p-6 space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
                        {recentActivities.length === 0 ? (
                            <p className="text-center py-10 text-slate-600 text-xs italic">No recent transactions found.</p>
                        ) : recentActivities.map((activity: any) => (
                            <div key={activity._id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">
                                        {new Date(activity.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase">
                                        ID: {activity._id.slice(-6)}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-300 font-medium leading-relaxed italic">
                                    {activity.details}
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                    <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">
                                        {(activity.admin?.firstName?.[0] || 'A')}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                        {activity.admin?.firstName} {activity.admin?.lastName}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Adjust Stock Modal */}
            {adjustingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />

                        <div className="flex items-center justify-between mb-8 relative">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Stock <span className="text-blue-500">Adjustment</span></h2>
                            <button onClick={() => setAdjustingProduct(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-10 p-6 bg-white/5 rounded-3xl border border-white/5 relative">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Active Entity</p>
                            <h4 className="text-white font-black italic uppercase text-lg">{adjustingProduct.name}</h4>
                            {adjustingVariant && Object.keys(adjustingVariant.attributeValues).length > 0 && (
                                <p className="text-blue-400 text-xs font-medium mt-1">
                                    {Object.entries(adjustingVariant.attributeValues).map(([key, val]) => `${val}`).join(' • ')}
                                </p>
                            )}
                            <p className="text-blue-500 text-[10px] font-mono font-bold mt-1 tracking-widest">{adjustingVariant?.sku || adjustingProduct.sku}</p>
                            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Current Balance</span>
                                <span className="text-white font-black italic">{adjustingVariant?.stock || adjustingProduct.stock} Units</span>
                            </div>
                        </div>

                        <form onSubmit={handleAdjust} className="space-y-8 relative">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Reason for Adjustment</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'restock', label: 'Restock', icon: ArrowUpCircle },
                                        { id: 'return', label: 'Return', icon: RotateCcw },
                                        { id: 'damaged', label: 'Damaged', icon: ArrowDownCircle },
                                        { id: 'correction', label: 'Correction', icon: FileText },
                                    ].map((r) => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setAdjustReason(r.id)}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${adjustReason === r.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                        >
                                            <r.icon size={16} />
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                                    {adjustReason === 'correction' ? 'New Total Stock' : 'Transaction Quantity'}
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustAmount(a => Math.max(0, a - 1))}
                                        className="w-14 h-14 shrink-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all font-black text-2xl"
                                    >
                                        <Minus className="w-6 h-6" />
                                    </button>
                                    <input
                                        type="number"
                                        value={adjustAmount}
                                        onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                                        className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-2xl py-4 text-center text-3xl font-black text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all italic [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAdjustAmount(a => a + 1)}
                                        className="w-14 h-14 shrink-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20 transition-all font-black text-2xl"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="mt-6 flex items-center justify-center gap-3 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Projected Inventory:</span>
                                    <span className="text-white font-black italic">
                                        {(() => {
                                            const currentStock = adjustingVariant?.stock || adjustingProduct.stock;
                                            if (adjustReason === 'correction') return adjustAmount;
                                            if (adjustReason === 'damaged') return Math.max(0, currentStock - adjustAmount);
                                            return currentStock + adjustAmount;
                                        })()} Units
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={adjustMutation.isPending}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {adjustMutation.isPending ? (
                                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Commit Adjustment
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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

function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    )
}


