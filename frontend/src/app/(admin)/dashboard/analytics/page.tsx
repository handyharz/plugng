'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Download,
    ShoppingBag,
    Users,
    Zap,
    ChevronRight,
    Loader2,
    DollarSign,
    Target,
    Award,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    MoreVertical,
    Eye,
    MessageSquare,
    TrendingUp as TrendingUpIcon,
    Edit,
    ExternalLink
} from 'lucide-react';
import adminApi from '@/lib/adminApi';
import Link from 'next/link';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
const CATEGORY_ICONS: Record<string, any> = {
    Electronics: Zap,
    Fashion: Sparkles,
    Home: Package,
    Sports: Activity,
    Books: Award,
};

export default function BusinessIntelligencePage() {
    const [period, setPeriod] = useState('30days');

    const { data: analyticsData, isLoading } = useQuery({
        queryKey: ['adminAdvancedAnalytics', period],
        queryFn: () => adminApi.getAdvancedAnalytics({ period })
    });

    const stats = analyticsData?.data || {
        salesByCategory: [],
        topProducts: [],
        customerRetention: { repeat: 0, new: 0 }
    };

    // Calculate KPIs
    const totalRevenue = useMemo(() => {
        return stats.salesByCategory.reduce((sum: number, cat: any) => sum + cat.revenue, 0);
    }, [stats.salesByCategory]);

    const totalUnits = useMemo(() => {
        return stats.salesByCategory.reduce((sum: number, cat: any) => sum + cat.units, 0);
    }, [stats.salesByCategory]);

    const totalCustomers = stats.customerRetention.repeat + stats.customerRetention.new;
    const avgOrderValue = totalUnits > 0 ? totalRevenue / totalUnits : 0;
    const retentionRate = totalCustomers > 0 ? (stats.customerRetention.repeat / totalCustomers) * 100 : 0;

    const retentionData = [
        { name: 'Repeat Customers', value: stats.customerRetention.repeat },
        { name: 'First-time Customers', value: stats.customerRetention.new },
    ];

    if (isLoading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4 shadow-lg shadow-indigo-500/20 rounded-full" />
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Loading intelligence data...</p>
            </div>
        );
    }

    return (
        <div className="p-8 mx-auto min-h-screen max-w-[1800px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-500">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Business Intelligence</h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Strategic insights and performance analytics for data-driven decisions.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-2xl p-1.5 shadow-xl">
                        {[
                            { id: '30days', label: '30 Days' },
                            { id: '90days', label: '90 Days' },
                            { id: '1year', label: '1 Year' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-white text-slate-950 shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold border border-white/10 transition-all hover:border-white/20">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Executive KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPICard
                    title="Total Revenue"
                    value={`₦${new Intl.NumberFormat().format(totalRevenue)}`}
                    icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
                    trend={12.5}
                    trendLabel="vs last period"
                    color="emerald"
                />
                <KPICard
                    title="Avg Order Value"
                    value={`₦${new Intl.NumberFormat().format(Math.round(avgOrderValue))}`}
                    icon={<Target className="w-5 h-5 text-blue-500" />}
                    trend={8.3}
                    trendLabel="vs last period"
                    color="blue"
                />
                <KPICard
                    title="Customer Retention"
                    value={`${retentionRate.toFixed(1)}%`}
                    icon={<Users className="w-5 h-5 text-purple-500" />}
                    trend={-2.1}
                    trendLabel="vs last period"
                    color="purple"
                />
                <KPICard
                    title="Total Transactions"
                    value={totalUnits.toString()}
                    icon={<ShoppingBag className="w-5 h-5 text-pink-500" />}
                    trend={15.7}
                    trendLabel="vs last period"
                    color="pink"
                />
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Revenue by Category - Enhanced */}
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Revenue by Category</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Performance Distribution</p>
                        </div>
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                            <PieChartIcon className="w-5 h-5 text-indigo-500" />
                        </div>
                    </div>

                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.salesByCategory}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="_id"
                                    stroke="#64748b"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontWeight: 700 }}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `₦${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        padding: '12px 16px'
                                    }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#barGradient)"
                                    radius={[12, 12, 0, 0]}
                                    barSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Customer Intelligence Panel */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                    <div className="mb-8 relative z-10">
                        <h3 className="text-xl font-bold text-white mb-1">Customer Loyalty</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Retention Analysis</p>
                    </div>

                    <div className="h-[280px] w-full relative mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    <filter id="shadow">
                                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
                                    </filter>
                                </defs>
                                <Pie
                                    data={retentionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="none"
                                    filter="url(#shadow)"
                                >
                                    {retentionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '11px',
                                        fontWeight: 700
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <Users className="w-7 h-7 text-slate-700 mb-2" />
                            <span className="text-3xl font-black text-white">{totalCustomers}</span>
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Total</span>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        {retentionData.map((item, idx) => (
                            <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[idx] }} />
                                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-white">{item.value}</span>
                                    <span className="text-[10px] font-bold text-slate-600">({totalCustomers > 0 ? ((item.value / totalCustomers) * 100).toFixed(0) : 0}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Performance Grid */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Category Performance</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Revenue & Volume Breakdown</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.salesByCategory.map((category: any, idx: number) => {
                        const Icon = CATEGORY_ICONS[category._id] || Package;
                        const isTopPerformer = idx === 0;
                        return (
                            <div
                                key={category._id}
                                className={`bg-slate-900/50 backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden ${isTopPerformer ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent' : 'border-white/10 hover:border-white/20'}`}
                            >
                                {isTopPerformer && (
                                    <div className="absolute top-4 right-4">
                                        <Award className="w-5 h-5 text-amber-500" />
                                    </div>
                                )}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`p-3 rounded-2xl ${isTopPerformer ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 border border-white/10'}`}>
                                        <Icon className={`w-6 h-6 ${isTopPerformer ? 'text-amber-500' : 'text-indigo-500'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold text-lg mb-1">{category._id}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Category</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
                                        <span className="text-sm font-black text-white font-mono">₦{new Intl.NumberFormat().format(category.revenue)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Units Sold</span>
                                        <span className="text-sm font-black text-white">{category.units}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-1">
                                <ShoppingBag className="w-6 h-6 text-indigo-500" />
                                Top Performing Products
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Ranked by unit sales volume</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rank</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Product Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Units Sold</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Revenue</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.topProducts.map((p: any, idx: number) => {
                                const isTopThree = idx < 3;
                                const medals = ['🥇', '🥈', '🥉'];
                                return (
                                    <tr key={p._id} className="hover:bg-white/5 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                {isTopThree ? (
                                                    <span className="text-2xl">{medals[idx]}</span>
                                                ) : (
                                                    <span className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-[11px] font-black text-slate-500">
                                                        {idx + 1}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors cursor-pointer">
                                                {p.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-black border border-indigo-500/20">
                                                {p.units} Units
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-sm font-black text-white font-mono">
                                                ₦{new Intl.NumberFormat().format(p.revenue)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <ProductActionMenu productId={p._id} productName={p.name} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// KPI Card Component
function KPICard({ title, value, icon, trend, trendLabel, color }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: number;
    trendLabel: string;
    color: string;
}) {
    const isPositive = trend > 0;
    const colorClasses: Record<string, string> = {
        emerald: 'from-emerald-500/10 to-transparent',
        blue: 'from-blue-500/10 to-transparent',
        purple: 'from-purple-500/10 to-transparent',
        pink: 'from-pink-500/10 to-transparent',
    };

    return (
        <div className={`bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all group overflow-hidden relative shadow-xl bg-gradient-to-br ${colorClasses[color]}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-16 -mt-16 transition-all group-hover:bg-white/[0.05]"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform border border-white/10">
                    {icon}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
                <h4 className="text-3xl font-black text-white tracking-tight mb-1">{value}</h4>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{trendLabel}</p>
            </div>
        </div>
    );
}

// Product Action Menu Component
function ProductActionMenu({ productId, productName }: { productId: string; productName: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        {
            label: 'View Details',
            icon: <Eye className="w-4 h-4" />,
            href: `/dashboard/products/${productId}/edit`,
            color: 'text-indigo-500'
        },
        {
            label: 'Check Inventory',
            icon: <Package className="w-4 h-4" />,
            href: `/dashboard/inventory`,
            color: 'text-emerald-500'
        },
        {
            label: 'View Reviews',
            icon: <MessageSquare className="w-4 h-4" />,
            href: `/dashboard/moderation`,
            color: 'text-amber-500'
        },

    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl border border-white/10 text-slate-600 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 backdrop-blur-xl">
                        <div className="p-3 border-b border-white/5 bg-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quick Actions</p>
                        </div>
                        <div className="p-2">
                            {actions.map((action, idx) => (
                                <Link
                                    key={idx}
                                    href={action.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
                                >
                                    <div className={`${action.color} group-hover:scale-110 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                        {action.label}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-slate-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
