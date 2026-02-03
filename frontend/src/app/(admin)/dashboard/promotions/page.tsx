'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Ticket,
    Plus,
    Calendar,
    Tag,
    Trash2,
    RefreshCw,
    X,
    CheckCircle,
    Clock,
    DollarSign,
    Percent,
    AlertCircle,
    TrendingUp,
    Gift,
    Users,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import adminApi from '@/lib/adminApi';

export default function PromotionsPage() {
    // Helper Component
    const StatCard = ({ title, value, subtitle, icon, gradient, alert }: any) => (
        <div className={`relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-5 transition-all hover:border-white/20 group`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                        {icon}
                    </div>
                    {alert && (
                        <div className="animate-pulse bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                            Expiring
                        </div>
                    )}
                </div>
                <h3 className="text-2xl font-black text-white mb-1">
                    {value}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {title}
                </p>
                {subtitle && (
                    <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );

    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: 0,
        minOrderAmount: 0,
        expiryDate: '',
        usageLimit: 0,
        maxDiscountAmount: 0,
        description: ''
    });

    const { data, isLoading } = useQuery({
        queryKey: ['adminCoupons'],
        queryFn: adminApi.getAllCoupons
    });

    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['adminCouponStats'],
        queryFn: adminApi.getCouponStats
    });

    const stats = statsData?.data || {
        totalCoupons: 0,
        activeCoupons: 0,
        totalRedemptions: 0,
        totalSaved: 0,
        expiringSoon: 0
    };

    const createMutation = useMutation({
        mutationFn: adminApi.createCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            queryClient.invalidateQueries({ queryKey: ['adminCouponStats'] });
            setIsCreateModalOpen(false);
            setFormData({
                code: '',
                type: 'percentage',
                value: 0,
                minOrderAmount: 0,
                expiryDate: '',
                usageLimit: 0,
                maxDiscountAmount: 0,
                description: ''
            });
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to create coupon');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            queryClient.invalidateQueries({ queryKey: ['adminCouponStats'] });
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to delete coupon');
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) =>
            adminApi.updateCoupon(id, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            queryClient.invalidateQueries({ queryKey: ['adminCouponStats'] });
        }
    });

    const handleDelete = (id: string, code: string) => {
        if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const coupons = data?.data || [];

    return (
        <div className="p-8 mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Tag className="w-6 h-6 text-purple-500" />
                        Promotion Engine
                    </h1>
                    <p className="text-slate-400">Manage discount coupons and marketing campaigns</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                >
                    <Plus className="w-5 h-5" />
                    New Coupon
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Active Campaigns"
                    value={stats.activeCoupons}
                    subtitle={`Out of ${stats.totalCoupons} total`}
                    icon={<Gift className="w-5 h-5 text-emerald-400" />}
                    gradient="from-emerald-500/10 to-teal-500/10"
                />
                <StatCard
                    title="Total Redemptions"
                    value={stats.totalRedemptions}
                    icon={<Users className="w-5 h-5 text-blue-400" />}
                    gradient="from-blue-500/10 to-indigo-500/10"
                />
                <StatCard
                    title="Revenue Impact"
                    value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(stats.totalSaved)}
                    icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                    gradient="from-purple-500/10 to-pink-500/10"
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats.expiringSoon}
                    subtitle="Next 7 days"
                    icon={<Clock className="w-5 h-5 text-orange-400" />}
                    gradient="from-orange-500/10 to-rose-500/10"
                    alert={stats.expiringSoon > 0}
                />
            </div>

            {/* Coupons List */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Coupon Code</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type & Value</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usage & Limits</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic text-sm">
                                        Loading coupons...
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Tag className="w-12 h-12 text-slate-700" />
                                            <p className="text-slate-500 italic text-sm">No coupons found. Create your first promotion!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : coupons.map((coupon: any) => (
                                <tr key={coupon._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white uppercase tracking-wider">{coupon.code}</span>
                                            <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{coupon.description || 'No description'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {coupon.type === 'percentage' ? (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold">
                                                    <Percent className="w-3 h-3" />
                                                    {coupon.value}% OFF
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold">
                                                    <DollarSign className="w-3 h-3" />
                                                    ₦{coupon.value.toLocaleString()} OFF
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 w-32">
                                            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                                                <span>Progress</span>
                                                <span>{coupon.usageLimit ? `${Math.round((coupon.usageCount / coupon.usageLimit) * 100)}%` : '∞'}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${coupon.usageLimit && (coupon.usageCount >= coupon.usageLimit)
                                                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                                                        : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                                                        }`}
                                                    style={{ width: coupon.usageLimit ? `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%` : '15%' }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{coupon.usageCount} / {coupon.usageLimit || 'Unlimited'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                                                <Calendar className="w-4 h-4 text-slate-600" />
                                                {new Date(coupon.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            {new Date(coupon.expiryDate) < new Date() && (
                                                <span className="flex items-center gap-1 text-[10px] text-rose-500 font-black uppercase">
                                                    <Clock className="w-3 h-3" /> Expired
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatusMutation.mutate({ id: coupon._id, isActive: !coupon.isActive })}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${coupon.isActive
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                                                }`}
                                        >
                                            {coupon.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(coupon._id, coupon.code)}
                                            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-purple-500" />
                                Create New Coupon
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Coupon Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="E.G. WELCOME20"
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all uppercase"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₦)</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount Value</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Min Order (₦)</label>
                                    <input
                                        type="number"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usage Limit (0=∞)</label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Cap (₦)</label>
                                    <input
                                        type="number"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-[10px]"
                                        placeholder="0 = No Cap"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                                        placeholder="Describe this promotion..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                            >
                                {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
