'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface LowStockProduct {
    _id: string;
    name: string;
    slug: string;
    totalStock: number;
    lowStockThreshold: number;
    variants?: {
        sku: string;
        color: string;
        size: string;
        stock: number;
    }[];
}

interface LowStockAlertsProps {
    products: LowStockProduct[];
}

export default function LowStockAlerts({ products }: LowStockAlertsProps) {
    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                    Low Stock Alerts
                </h3>
                <Link
                    href="/dashboard/inventory"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    Manage
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px]">
                {products.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <p>No low stock alerts currently.</p>
                        <p className="text-sm mt-1">Great job keeping inventory healthy! 🎉</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {products.map((product) => (
                            <div key={product._id} className="p-4 hover:bg-white/5 transition-colors">
                                <Link href={`/dashboard/products/${product._id}/edit`} className="flex items-start justify-between group">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                                            {product.name}
                                        </h4>
                                        <div className="mt-1 space-y-1">
                                            {product.variants?.map((variant) => (
                                                <div key={variant.sku} className="flex items-center text-sm">
                                                    <span className="text-slate-400 w-24">
                                                        {variant.color} / {variant.size}
                                                    </span>
                                                    <span className={`font-medium ${variant.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                                                        {variant.stock} left
                                                    </span>
                                                </div>
                                            ))}
                                            {!product.variants?.length && (
                                                <div className="flex items-center text-sm">
                                                    <span className="text-slate-400 w-24">Main Stock</span>
                                                    <span className={`font-medium ${product.totalStock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                                                        {product.totalStock} left
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center p-2 rounded-lg bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {products.length > 0 && (
                <div className="p-4 border-t border-white/10 bg-amber-900/10">
                    <p className="text-xs text-amber-200 text-center">
                        {products.length} products require restocking soon.
                    </p>
                </div>
            )}
        </div>
    );
}
