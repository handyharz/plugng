'use client';

import { use, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft,
    Mail,
    Phone,
    Calendar,
    MapPin,
    CreditCard,
    ShoppingBag,
    History,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Plus,
    Minus,
    Loader2,
    AlertCircle,
    BadgeCheck,
    Coins,
    TrendingUp,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { getCustomerDetails, adjustCustomerWallet } from '@/lib/adminApi';

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-amber-500 bg-amber-500/10',
    processing: 'text-blue-500 bg-blue-500/10',
    shipped: 'text-purple-500 bg-purple-500/10',
    delivered: 'text-green-500 bg-green-500/10',
    cancelled: 'text-red-500 bg-red-500/10',
};

type TabType = 'orders' | 'wallet' | 'addresses';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [walletAmount, setWalletAmount] = useState(0);
    const [walletType, setWalletType] = useState<'credit' | 'debit'>('credit');
    const [walletReason, setWalletReason] = useState('Admin adjustment');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: customer, isLoading, error } = useQuery({
        queryKey: ['adminCustomer', id],
        queryFn: () => getCustomerDetails(id),
    });

    const walletMutation = useMutation({
        mutationFn: (data: any) => adjustCustomerWallet(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCustomer', id] });
            setIsWalletOpen(false);
            setWalletAmount(0);
            alert('Wallet updated successfully');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to update wallet');
        }
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const customerData = customer?.data;

    const filteredOrders = useMemo(() => {
        if (!customerData?.orderHistory) return [];
        return customerData.orderHistory.filter((order: any) =>
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.deliveryStatus.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [customerData?.orderHistory, searchQuery]);

    const filteredTransactions = useMemo(() => {
        if (!customerData?.wallet?.transactions) return [];
        return [...customerData.wallet.transactions].reverse().filter((tx: any) =>
            tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [customerData?.wallet?.transactions, searchQuery]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400">Loading customer profile...</p>
            </div>
        );
    }

    if (!customer || !customer.data) {
        return (
            <div className="p-12 text-center bg-slate-900 border border-white/10 rounded-2xl m-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Customer Not Found</h2>
                <p className="text-slate-400 mb-6">The requested customer record could not be found or has been removed.</p>
                <Link href="/dashboard/customers" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                    Return to List
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 mx-auto min-h-screen max-w-7xl">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/customers"
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
                                {customerData.firstName} {customerData.lastName}
                            </h1>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full uppercase tracking-widest border border-blue-500/20">
                                CUSTOMER
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-0.5">ID: {customerData._id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsWalletOpen(true)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Adjust Credit
                    </button>
                    {/* Add other actions here if needed */}
                </div>
            </div>

            {/* Top Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <MetricCard
                    title="Lifetime Spend"
                    value={formatCurrency(customerData.totalSpent || 0)}
                    icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                    trend="Total Sales"
                />
                <MetricCard
                    title="Total Orders"
                    value={customerData.orderCount || 0}
                    icon={<ShoppingBag className="w-5 h-5 text-blue-500" />}
                    trend={`${customerData.orderHistory?.length || 0} lifetime`}
                />
                <MetricCard
                    title="Wallet Balance"
                    value={formatCurrency(customerData.wallet?.balance || 0)}
                    icon={<Wallet className="w-5 h-5 text-purple-500" />}
                    trend="Available"
                />
                <MetricCard
                    title="Loyalty Tier"
                    value={customerData.loyaltyTier || 'Enthusiast'}
                    icon={<BadgeCheck className="w-5 h-5 text-amber-500" />}
                    trend="Tier Status"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar: Profile Details (4 cols) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-blue-600/20 via-blue-600/10 to-transparent border-b border-white/5"></div>
                        <div className="px-8 pb-8">
                            <div className="relative -mt-16 mb-6">
                                <div className="w-32 h-32 rounded-3xl bg-slate-950 border-4 border-slate-900 shadow-2xl flex items-center justify-center text-5xl font-bold text-blue-400">
                                    {customerData.firstName[0]}{customerData.lastName[0]}
                                </div>
                                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-900" title="Active"></div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        <ProfileInfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={customerData.email} />
                                        <ProfileInfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={customerData.phone} />
                                        <ProfileInfoItem
                                            icon={<Calendar className="w-4 h-4" />}
                                            label="Member Since"
                                            value={new Date(customerData.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Default Address</h3>
                                    {customerData.addresses?.find((a: any) => a.isDefault) ? (
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                            <p className="text-white text-sm font-medium">{customerData.addresses.find((a: any) => a.isDefault).address}</p>
                                            <p className="text-slate-400 text-xs">
                                                {customerData.addresses.find((a: any) => a.isDefault).city}, {customerData.addresses.find((a: any) => a.isDefault).state}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-sm italic">No default address set</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Tabs & History (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden min-h-[600px]">
                        {/* Tabs Header */}
                        <div className="flex items-center justify-between px-8 pt-8 border-b border-white/5">
                            <div className="flex gap-8">
                                <TabButton
                                    active={activeTab === 'orders'}
                                    onClick={() => setActiveTab('orders')}
                                    label="Order History"
                                    count={customerData.orderHistory?.length}
                                />
                                <TabButton
                                    active={activeTab === 'wallet'}
                                    onClick={() => setActiveTab('wallet')}
                                    label="Wallet Log"
                                    count={customerData.wallet?.transactions?.length}
                                />
                                <TabButton
                                    active={activeTab === 'addresses'}
                                    onClick={() => setActiveTab('addresses')}
                                    label="Addresses"
                                />
                            </div>

                            <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-blue-500 transition-all mb-4">
                                <Search className="w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search details..."
                                    className="bg-transparent border-none outline-none text-sm text-white w-40"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-0">
                            {activeTab === 'orders' && (
                                <div className="fade-in">
                                    {filteredOrders.length === 0 ? (
                                        <EmptyState icon={<ShoppingBag />} title="No Orders Found" message="This customer hasn't placed any orders matching your criteria." />
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-white/5">
                                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Order Number</th>
                                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                                        <th className="px-8 py-5 text-right"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {filteredOrders.map((order: any) => (
                                                        <tr key={order._id} className="group hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-8 py-5">
                                                                <Link href={`/dashboard/orders/${order._id}`} className="text-white font-bold hover:text-blue-400 flex items-center gap-2 transition-colors">
                                                                    #{order.orderNumber}
                                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                                                                </Link>
                                                            </td>
                                                            <td className="px-8 py-5 text-slate-400 text-sm">
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.deliveryStatus as keyof typeof STATUS_COLORS] || 'text-slate-400 bg-slate-400/10'}`}>
                                                                    {order.deliveryStatus}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5 text-white font-bold text-sm">
                                                                {formatCurrency(order.total)}
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <Link href={`/dashboard/orders/${order._id}`} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all inline-flex">
                                                                    <ChevronLeft className="w-4 h-4 rotate-180" />
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'wallet' && (
                                <div className="fade-in">
                                    {filteredTransactions.length === 0 ? (
                                        <EmptyState icon={<History />} title="No Transactions" message="No wallet activity recorded for this customer yet." />
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-white/5">
                                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Reference / Reason</th>
                                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {filteredTransactions.map((tx: any, idx: number) => (
                                                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-8 py-5 whitespace-nowrap">
                                                                <p className="text-white text-sm font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                                                                <p className="text-slate-500 text-[10px] uppercase font-bold mt-0.5">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${tx.type === 'credit' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                                                                    {tx.type === 'credit' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                                    {tx.type}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 max-w-xs">
                                                                <p className="text-slate-300 text-sm truncate">{tx.description}</p>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 fade-in">
                                    {customerData.addresses?.length === 0 ? (
                                        <div className="col-span-2">
                                            <EmptyState icon={<MapPin />} title="No Addresses" message="Customer hasn't saved any addresses yet." />
                                        </div>
                                    ) : customerData.addresses?.map((addr: any, idx: number) => (
                                        <div key={idx} className={`p-6 rounded-3xl border transition-all ${addr.isDefault ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-950 rounded-xl text-slate-400">
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm tracking-tight">{addr.label || 'Home'}</h4>
                                                        {addr.isDefault && <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Default</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <p className="text-white font-medium">{addr.fullName}</p>
                                                <p className="text-slate-400">{addr.address}</p>
                                                {addr.landmark && <p className="text-slate-500 text-xs italic">Near {addr.landmark}</p>}
                                                <p className="text-slate-400">{addr.city}, {addr.state}</p>
                                                <p className="text-slate-500 mt-2 flex items-center gap-2">
                                                    <Phone className="w-3 h-3" />
                                                    {addr.phone}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Adjustment Modal */}
            {isWalletOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Adjust Wallet</h2>
                                <p className="text-slate-500 text-sm mt-1">Updates available for instant use.</p>
                            </div>
                            <button onClick={() => setIsWalletOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <div className="flex gap-2 p-1.5 bg-slate-950 border border-white/5 rounded-2xl mb-8">
                            <button
                                onClick={() => setWalletType('credit')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${walletType === 'credit' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <ArrowDownRight className="w-4 h-4" />
                                Credit
                            </button>
                            <button
                                onClick={() => setWalletType('debit')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${walletType === 'debit' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <ArrowUpRight className="w-4 h-4" />
                                Debit
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">Amount (NGN)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 font-bold">₦</div>
                                    <input
                                        type="number"
                                        value={walletAmount}
                                        onChange={(e) => setWalletAmount(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-white/10 group-hover:border-white/20 focus:border-blue-500 rounded-2xl py-5 px-10 text-3xl font-bold text-white text-center transition-all outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">Transaction Reason</label>
                                <textarea
                                    rows={3}
                                    value={walletReason}
                                    onChange={(e) => setWalletReason(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-2xl p-4 text-white text-sm outline-none transition-all resize-none"
                                    placeholder="e.g., Refund for order #1234, Promotional credit..."
                                />
                            </div>

                            <button
                                onClick={() => walletMutation.mutate({ amount: walletAmount, type: walletType, reason: walletReason })}
                                disabled={walletMutation.isPending || walletAmount <= 0}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${walletType === 'credit' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'} disabled:opacity-50 disabled:active:scale-100`}
                            >
                                {walletMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <BadgeCheck className="w-5 h-5" />}
                                Confirm Adjustment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components for cleaner code
function MetricCard({ title, value, icon, trend }: { title: string; value: string | number; icon: React.ReactNode; trend: string }) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{trend}</span>
            </div>
            <div>
                <p className="text-slate-400 text-xs font-medium mb-1">{title}</p>
                <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
            </div>
        </div>
    );
}

function ProfileInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="p-2.5 bg-slate-950 rounded-xl text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</p>
                <p className="text-sm text-slate-200 font-medium truncate max-w-[180px]">{value}</p>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
    return (
        <button
            onClick={onClick}
            className={`relative py-8 text-sm font-bold uppercase tracking-widest transition-all ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <span className="flex items-center gap-2">
                {label}
                {count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${active ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                        {count}
                    </span>
                )}
            </span>
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full animate-in slide-in-from-bottom-1 duration-300"></div>
            )}
        </button>
    );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-slate-950 rounded-[40px] flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                {icon && <div className="scale-[2]">{icon}</div>}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">{message}</p>
        </div>
    );
}
