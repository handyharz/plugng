'use client';

import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import MetricCard from '@/components/admin/dashboard/MetricCard';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import RecentOrders from '@/components/admin/dashboard/RecentOrders';
import LowStockAlerts from '@/components/admin/dashboard/LowStockAlerts';
import {
    getDashboardStats,
    getRevenueChart,
    getRecentOrders,
    getLowStockAlerts
} from '@/lib/adminApi';

export default function AdminDashboard() {
    // Fetch Dashboard Stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: getDashboardStats
    });

    // Fetch Revenue Chart Data
    const { data: chartData, isLoading: chartLoading } = useQuery({
        queryKey: ['adminRevenueChart'],
        queryFn: () => getRevenueChart(30)
    });

    // Fetch Recent Orders
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['adminRecentOrders'],
        queryFn: () => getRecentOrders(10)
    });

    // Fetch Low Stock Alerts
    const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
        queryKey: ['adminLowStock'],
        queryFn: getLowStockAlerts
    });

    const isLoading = statsLoading || chartLoading || ordersLoading || lowStockLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const stats = statsData?.data || {
        revenue: {
            paid: 0,
            pending: 0,
            failed: 0,
            growth: 0,
            byMethod: {},
            byDeliveryStatus: {}
        },
        orders: { total: 0, byStatus: {}, avgValue: 0 },
        products: { total: 0, active: 0, outOfStock: 0 },
        customers: { total: 0, newThisMonth: 0 },
        kpis: {
            conversionRate: 0,
            deliveryCompletionRate: 0,
            avgOrderValue: 0,
            totalOrders: 0,
            paidOrders: 0
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumSignificantDigits: 3
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-slate-400">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Revenue Breakdown - Three Cards */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Revenue Overview (This Month)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Paid Revenue"
                        value={formatCurrency(stats.revenue?.paid || 0)}
                        change={`${formatPercentage(stats.revenue?.growth || 0)} vs last month`}
                        changeType={stats.revenue?.growth >= 0 ? 'positive' : 'negative'}
                        icon={TrendingUp}
                        iconColor="text-green-400 bg-green-500/10"
                    />
                    <MetricCard
                        title="Pending Revenue"
                        value={formatCurrency(stats.revenue?.pending || 0)}
                        change={`${stats.kpis?.totalOrders - stats.kpis?.paidOrders || 0} orders awaiting payment`}
                        changeType="neutral"
                        icon={Minus}
                        iconColor="text-yellow-400 bg-yellow-500/10"
                    />
                    <MetricCard
                        title="Failed Revenue"
                        value={formatCurrency(stats.revenue?.failed || 0)}
                        change="Lost opportunities"
                        changeType="negative"
                        icon={TrendingDown}
                        iconColor="text-red-400 bg-red-500/10"
                    />
                </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Key Performance Indicators</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Conversion Rate</span>
                            <AlertCircle className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats.kpis?.conversionRate || 0}%
                        </div>
                        <div className="text-xs text-slate-500">
                            {stats.kpis?.paidOrders || 0} of {stats.kpis?.totalOrders || 0} orders paid
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Avg Order Value</span>
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {formatCurrency(stats.kpis?.avgOrderValue || 0)}
                        </div>
                        <div className="text-xs text-slate-500">Per paid order</div>
                    </div>
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Delivery Rate</span>
                            <Package className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats.kpis?.deliveryCompletionRate || 0}%
                        </div>
                        <div className="text-xs text-slate-500">Orders delivered</div>
                    </div>
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Total Orders</span>
                            <ShoppingCart className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats.kpis?.totalOrders || 0}
                        </div>
                        <div className="text-xs text-slate-500">This month</div>
                    </div>
                </div>
            </div>

            {/* Payment Method Breakdown */}
            {stats.revenue?.byMethod && Object.keys(stats.revenue.byMethod).length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Revenue by Payment Method</h2>
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(stats.revenue.byMethod).map(([method, data]: [string, any]) => (
                                <div key={method} className="border border-white/5 rounded-lg p-4">
                                    <div className="text-sm text-slate-400 mb-1 capitalize">
                                        {method.replace('_', ' ')}
                                    </div>
                                    <div className="text-xl font-bold text-white mb-1">
                                        {formatCurrency(data.revenue)}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {data.count} orders • Avg: {formatCurrency(data.revenue / data.count)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Status Breakdown */}
            {stats.revenue?.byDeliveryStatus && Object.keys(stats.revenue.byDeliveryStatus).length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Revenue by Delivery Status</h2>
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {Object.entries(stats.revenue.byDeliveryStatus).map(([status, data]: [string, any]) => {
                                const statusColors: Record<string, string> = {
                                    delivered: 'text-green-400',
                                    shipped: 'text-blue-400',
                                    processing: 'text-yellow-400',
                                    pending: 'text-orange-400',
                                    cancelled: 'text-red-400'
                                };
                                return (
                                    <div key={status} className="border border-white/5 rounded-lg p-4">
                                        <div className={`text-sm mb-1 capitalize ${statusColors[status] || 'text-slate-400'}`}>
                                            {status}
                                        </div>
                                        <div className="text-xl font-bold text-white mb-1">
                                            {formatCurrency(data.revenue)}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {data.count} orders
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Original Metrics Grid */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <MetricCard
                        title="Active Orders"
                        value={stats.orders?.total || 0}
                        change={`${stats.orders?.byStatus?.pending || 0} pending`}
                        changeType="neutral"
                        icon={ShoppingCart}
                        iconColor="text-blue-400 bg-blue-500/10"
                    />
                    <MetricCard
                        title="Products"
                        value={stats.products?.total || 0}
                        change={`${stats.products?.outOfStock || 0} out of stock`}
                        changeType={stats.products?.outOfStock > 0 ? 'negative' : 'neutral'}
                        icon={Package}
                        iconColor="text-purple-400 bg-purple-500/10"
                    />
                    <MetricCard
                        title="Customers"
                        value={stats.customers?.total || 0}
                        change={`+${stats.customers?.newThisMonth || 0} this month`}
                        changeType="positive"
                        icon={Users}
                        iconColor="text-orange-400 bg-orange-500/10"
                    />
                </div>
            </div>

            {/* Charts & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <RevenueChart data={chartData?.data || []} />
                </div>
                <div className="lg:col-span-1">
                    <LowStockAlerts products={lowStockData?.data || []} />
                </div>
            </div>

            {/* Recent Orders */}
            <div className="mb-8">
                <RecentOrders orders={ordersData?.data || []} />
            </div>
        </div>
    );
}
