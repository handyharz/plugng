'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { userApi, orderApi, walletApi, wishlistApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Phone, ShieldCheck, MapPin, Save, Loader2,
    CreditCard, ShoppingBag, History, Lock, Heart,
    ChevronRight, Clock, CheckCircle2, AlertCircle,
    ArrowUpRight, ArrowDownLeft, Plus, Trash2, ShoppingCart, ExternalLink,
    MessageSquare, Star, Trophy, Bell, CheckCircle2 as CheckIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ticketApi, reviewApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type TabType = 'profile' | 'addresses' | 'orders' | 'wallet' | 'security' | 'wishlist' | 'support' | 'reviews' | 'notifications';

function ProfilePageContent() {
    const { user, setUser, isLoading: authLoading } = useAuth();
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const { addToCart } = useCart();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab') as TabType;

    const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'profile');

    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Orders state
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Wallet state
    const [topupAmount, setTopupAmount] = useState('');
    const [walletLoading, setWalletLoading] = useState(false);
    const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
    const [walletPage, setWalletPage] = useState(1);
    const [walletTotalPages, setWalletTotalPages] = useState(1);
    const [walletTotal, setWalletTotal] = useState(0);

    // Wishlist state
    const [wishlist, setWishlist] = useState<any>(null);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    // Security state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Tickets state
    const [tickets, setTickets] = useState<any[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' });

    const [myReviews, setMyReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewOrder, setReviewOrder] = useState<any>(null);
    const [reviewProduct, setReviewProduct] = useState<any>(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

    // Logistics Tracker State
    const [trackingOrder, setTrackingOrder] = useState<string | null>(null);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
    });

    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: 'Lagos',
        landmark: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            });
            setNewAddress(prev => ({
                ...prev,
                fullName: prev.fullName || `${user.firstName} ${user.lastName}`,
                phone: prev.phone || user.phone
            }));
        }
    }, [user]);

    // Fetch orders if tab is active
    useEffect(() => {
        if (activeTab === 'orders' && orders.length === 0) {
            fetchOrders();
        }
        if (activeTab === 'wishlist' && !wishlist) {
            fetchWishlist();
        }
        if (activeTab === 'support' && tickets.length === 0) {
            fetchTickets();
        }
        if (activeTab === 'reviews' && myReviews.length === 0) {
            fetchReviews();
        }
        if (activeTab === 'wallet' && walletTransactions.length === 0) {
            fetchWalletTransactions(1);
        }

        // Auto-scroll to active tab
        const tabElement = document.getElementById(`tab-${activeTab}`);
        if (tabElement) {
            tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeTab]);

    const fetchOrders = async (page: number = 1) => {
        setOrdersLoading(true);
        try {
            const data = await orderApi.getMyOrders({ page, limit: 10 });
            setOrders(data.orders);
            // If you want to support pagination inside the profile tab too, you'd need more state here
            // For now, just setting the orders to the first page results to resolve TS error
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchWalletTransactions = async (page: number = 1) => {
        setWalletLoading(true);
        try {
            const data = await walletApi.getTransactionHistory({ page, limit: 10 });
            setWalletTransactions(data.transactions);
            setWalletTotalPages(data.pages);
            setWalletTotal(data.total);
            setWalletPage(data.page);
        } catch (error) {
            console.error('Failed to fetch wallet transactions:', error);
        } finally {
            setWalletLoading(false);
        }
    };

    const fetchWishlist = async () => {
        setWishlistLoading(true);
        try {
            const data = await wishlistApi.get();
            setWishlist(data);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const data = await reviewApi.getMyReviews();
            setMyReviews(data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const fetchTickets = async () => {
        setTicketsLoading(true);
        try {
            const data = await ticketApi.getMyTickets();
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setTicketsLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await ticketApi.create(newTicket);
            fetchTickets();
            setShowTicketForm(false);
            setNewTicket({ subject: '', description: '', priority: 'medium' });
        } catch (error) {
            console.error('Failed to create ticket:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await reviewApi.create({
                product: reviewProduct.product, // This is the product ID in the order item
                order: reviewOrder._id,
                ...reviewData
            });
            fetchReviews();
            setShowReviewForm(false);
            setReviewData({ rating: 5, comment: '' });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const updatedUser = await userApi.updateProfile(formData);
            setUser(updatedUser);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await userApi.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess(true);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            const updatedUser = await userApi.addAddress(newAddress);
            setUser(updatedUser);
            setShowAddressForm(false);
            setNewAddress({
                label: 'Home',
                fullName: `${user.firstName} ${user.lastName}`,
                phone: user.phone,
                address: '',
                city: '',
                state: 'Lagos',
                landmark: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add address');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        setError(null);
        try {
            const updatedUser = await userApi.deleteAddress(id);
            setUser(updatedUser);
        } catch (err: any) {
            setError('Failed to delete address');
        }
    };

    const handleSetDefault = async (id: string) => {
        setError(null);
        try {
            const updatedUser = await userApi.setDefaultAddress(id);
            setUser(updatedUser);
        } catch (err: any) {
            setError('Failed to set default address');
        }
    };

    const handleFundWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(topupAmount);
        if (isNaN(numAmount) || numAmount < 100) return;

        setWalletLoading(true);
        try {
            const data = await walletApi.initializeTopup(numAmount);
            window.location.href = data.paymentUrl;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initialize top-up');
        } finally {
            setWalletLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId: string) => {
        try {
            const data = await wishlistApi.remove(productId);
            setWishlist(data);
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
            {/* Header */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                            Control <span className="text-blue-500">Center</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Manage your premium shop account</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-fit overflow-x-auto scrollbar-hide gap-1 flex-nowrap whitespace-nowrap">
                        {[
                            { id: 'profile', label: 'General', icon: Mail },
                            { id: 'addresses', label: 'Addresses', icon: MapPin },
                            { id: 'orders', label: 'Orders', icon: ShoppingBag },
                            { id: 'wallet', label: 'Wallet', icon: CreditCard },
                            { id: 'security', label: 'Security', icon: Lock },
                            { id: 'wishlist', label: 'Wishlist', icon: Heart },
                            { id: 'support', label: 'Support', icon: MessageSquare },
                            { id: 'reviews', label: 'Reviews', icon: Star },
                            { id: 'notifications', label: 'Alerts', icon: Bell },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                id={`tab-${tab.id}`}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <tab.icon size={12} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                {/* Sidebar Stats */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-32">
                    <div className="glass-card bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center text-white text-3xl font-black italic shadow-2xl shadow-blue-500/20 rotate-3">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            {user.phoneVerified && (
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-xl border-4 border-black shadow-lg">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-white">{user.firstName} {user.lastName}</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{user.role} User</p>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                <div className="flex flex-col items-start">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Balance</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-500">
                                            <CreditCard className="w-3 h-3" />
                                        </div>
                                        <span className="text-lg font-black text-white italic">₦{user.wallet?.balance?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                <div className="flex flex-col items-start">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Orders</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-500">
                                            <ShoppingBag className="w-3 h-3" />
                                        </div>
                                        <span className="text-lg font-black text-white italic">{orders.length || '0'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                <div className="flex flex-col items-start">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Loyalty Tier</span>
                                    <div className="flex items-center space-x-2">
                                        <div className={`p-1.5 rounded-lg ${user.loyaltyTier === 'Master' ? 'bg-amber-500/20 text-amber-500' : user.loyaltyTier === 'Elite' ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-500/20 text-slate-500'}`}>
                                            <Trophy className="w-3 h-3" />
                                        </div>
                                        <span className="text-lg font-black text-white italic uppercase tracking-tighter">{user.loyaltyTier || 'Enthusiast'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 p-2 pt-4">
                                <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-600">
                                    <span>Progress to {user.loyaltyTier === 'Master' ? 'Max Tier' : user.loyaltyTier === 'Elite' ? 'Master' : 'Elite'}</span>
                                    <span>₦{user.totalSpent?.toLocaleString() || '0'} / ₦{user.loyaltyTier === 'Master' ? '1M+' : user.loyaltyTier === 'Elite' ? '1,000,000' : '250,000'}</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, ((user.totalSpent || 0) / (user.loyaltyTier === 'Elite' ? 1000000 : 250000)) * 100)}%` }}
                                        className={`h-full ${user.loyaltyTier === 'Master' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">General Info</h3>
                                </div>
                                <form onSubmit={handleUpdate} className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">First Name</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Last Name</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex items-center space-x-5 p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
                                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors shadow-inner">
                                                <Mail className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Email Address</p>
                                                <p className="text-white font-bold">{user.email}</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className="p-1 px-2 bg-white/5 rounded-lg border border-white/5 text-[7px] font-black text-slate-700 uppercase tracking-widest">Read Only</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-5 p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
                                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors shadow-inner">
                                                <Phone className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Phone Number</p>
                                                <p className="text-white font-bold">{user.phone}</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className="p-1 px-2 bg-white/5 rounded-lg border border-white/5 text-[7px] font-black text-slate-700 uppercase tracking-widest">Read Only</div>
                                            </div>
                                        </div>
                                    </div>

                                    {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="h-4">
                                            {success && (
                                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-green-500 text-[10px] font-black uppercase tracking-widest">
                                                    Identity Updated Successfully
                                                </motion.p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-10 py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-200 active:scale-95 shadow-xl shadow-white/5 transition-all flex items-center space-x-3 disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            <span>Update Profile</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'addresses' && (
                            <motion.div key="addresses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Saved Addresses</h3>
                                    <button
                                        onClick={() => setShowAddressForm(!showAddressForm)}
                                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600/20 transition-all"
                                    >
                                        {showAddressForm ? 'Cancel' : <span><Plus className="inline mr-1" size={14} /> Add New</span>}
                                    </button>
                                </div>

                                {showAddressForm && (
                                    <form onSubmit={handleAddAddress} className="glass-card bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Label (e.g. Home, Office)</label>
                                                <input type="text" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all" required />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Full Recipient Name</label>
                                                <input type="text" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all" required />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Street Address</label>
                                            <input type="text" value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all" required />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">City</label>
                                                <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all" required />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Phone</label>
                                                <input type="text" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all" required />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={isSaving} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-200 transition-all flex items-center justify-center space-x-3 shadow-2xl">
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            <span>Secure Address</span>
                                        </button>
                                    </form>
                                )}

                                <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                    {user.addresses?.length === 0 ? (
                                        <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-20 text-center space-y-6">
                                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                                                <MapPin className="w-10 h-10 text-slate-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">No addresses secured</p>
                                                <p className="text-slate-700 text-[8px] font-bold uppercase tracking-widest">Your future deliveries are waiting for a home.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        user.addresses?.map((addr: any) => (
                                            <div key={addr._id} className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 group transition-all hover:bg-white/[0.08] relative overflow-hidden">
                                                {addr.isDefault && (
                                                    <div className="absolute top-0 right-10 bg-blue-600 text-white text-[7px] font-black uppercase px-3 py-1.5 rounded-b-xl tracking-tighter shadow-lg">Default Hub</div>
                                                )}
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">{addr.label}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="text-lg font-black text-white italic tracking-tight">{addr.fullName}</h4>
                                                            <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-lg">{addr.address}, {addr.city}, {addr.state}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-slate-500">
                                                            <Phone size={10} />
                                                            <span className="text-[10px] font-black tracking-[0.1em]">{addr.phone}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        {!addr.isDefault && (
                                                            <button onClick={() => handleSetDefault(addr._id)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-blue-600 transition-all" title="Set as Default">
                                                                <ShieldCheck size={18} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDeleteAddress(addr._id)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all transition-all" title="Delete">
                                                            <MapPin className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'orders' && (
                            <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Order History</h3>
                                    <button onClick={() => fetchOrders()} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Refresh</button>
                                </div>

                                {ordersLoading ? (
                                    <div className="space-y-6">
                                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-[2.5rem]" />)}
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-20 text-center space-y-6">
                                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                                            <ShoppingBag className="w-10 h-10 text-slate-600" />
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">No purchases detected</p>
                                            <Link href="/" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Manifest Shop</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                        {orders.map((order, index) => (
                                            <div key={order._id} className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/30 transition-all">
                                                <div className="p-8 flex flex-col md:flex-row md:items-center gap-8">
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${order.deliveryStatus === 'delivered' ? 'bg-green-500/10 text-green-500 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]' :
                                                        order.deliveryStatus === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-blue-500/10 text-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
                                                        }`}>
                                                        {order.deliveryStatus === 'delivered' ? <CheckCircle2 size={32} /> :
                                                            order.deliveryStatus === 'cancelled' ? <AlertCircle size={32} /> :
                                                                <Clock size={32} className="animate-pulse" />}
                                                    </div>

                                                    <div className="flex-grow space-y-2">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ORD-{order.orderNumber}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                                                            <span className="text-[9px] font-bold text-slate-500 uppercase">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <h4 className="text-xl font-black text-white uppercase italic truncate max-w-sm">
                                                            {order.items[0].name} {order.items.length > 1 && <span className="text-blue-500 text-xs ml-1">+ {order.items.length - 1} More</span>}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border border-white/5 ${order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>Payment: {order.paymentStatus}</span>
                                                            <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border border-white/5 ${order.deliveryStatus === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>Shipment: {order.deliveryStatus}</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0 space-y-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Order Total</p>
                                                            <p className="text-2xl font-black text-white italic tracking-tighter">₦{order.total.toLocaleString()}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-2 scale-90 md:scale-100 items-end">
                                                            <button
                                                                onClick={() => setTrackingOrder(trackingOrder === order._id ? null : order._id)}
                                                                className={`flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest transition-all ${trackingOrder === order._id ? 'text-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
                                                            >
                                                                <span>{trackingOrder === order._id ? 'Close Tracking' : 'Track Manifest'}</span>
                                                                <ChevronRight size={14} className={trackingOrder === order._id ? 'rotate-90' : ''} />
                                                            </button>

                                                            <Link
                                                                href={`/orders/${order._id}`}
                                                                className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-blue-500/70 hover:text-blue-500 transition-all"
                                                            >
                                                                <span>Full Details</span>
                                                                <ExternalLink size={10} />
                                                            </Link>

                                                            {order.deliveryStatus === 'delivered' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setReviewOrder(order);
                                                                        setReviewProduct(order.items[0]); // Using the order item which has product info
                                                                        setShowReviewForm(true);
                                                                    }}
                                                                    className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-all"
                                                                >
                                                                    <span>Leave Feedback</span>
                                                                    <Star size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Advanced Logistics Tracker Expansion */}
                                                <AnimatePresence>
                                                    {trackingOrder === order._id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-white/5 bg-white/[0.02]"
                                                        >
                                                            <div className="p-8 space-y-8">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="space-y-1">
                                                                        <h5 className="text-[10px] font-black text-white uppercase italic tracking-widest">Visual Logistics Link</h5>
                                                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Real-time Telemetry Simulation</p>
                                                                    </div>
                                                                    <div className="px-4 py-1.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-lg shadow-blue-500/20">Active Transmission</div>
                                                                </div>

                                                                {/* Tracker Steps */}
                                                                <div className="relative pt-4 pb-8">
                                                                    <div className="absolute top-[44px] left-0 w-full h-0.5 bg-white/5" />
                                                                    <div
                                                                        className="absolute top-[44px] left-0 h-0.5 bg-blue-600 transition-all duration-1000"
                                                                        style={{ width: order.deliveryStatus === 'delivered' ? '100%' : order.deliveryStatus === 'shipped' ? '66%' : order.deliveryStatus === 'processing' ? '33%' : '5%' }}
                                                                    />

                                                                    <div className="flex justify-between items-center relative">
                                                                        {[
                                                                            { id: 'pending', label: 'Logged', icon: Clock },
                                                                            { id: 'processing', label: 'Vault', icon: Lock },
                                                                            { id: 'shipped', label: 'Transit', icon: History },
                                                                            { id: 'delivered', label: 'Arrived', icon: CheckCircle2 }
                                                                        ].map((step, idx) => {
                                                                            const isDone = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.deliveryStatus) >= idx;
                                                                            const isCurrent = order.deliveryStatus === step.id;
                                                                            return (
                                                                                <div key={step.id} className="flex flex-col items-center space-y-4 relative z-10">
                                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-4 border-black shadow-2xl transition-all ${isDone ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-700'}`}>
                                                                                        <step.icon size={16} className={isCurrent ? 'animate-bounce' : ''} />
                                                                                    </div>
                                                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isDone ? 'text-white' : 'text-slate-700'}`}>{step.label}</span>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* Map Simulation */}
                                                                <div className="h-48 bg-slate-900/50 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                                                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                                                    <motion.div
                                                                        animate={{
                                                                            x: [0, 50, -30, 20, 0],
                                                                            y: [0, -20, 40, -10, 0]
                                                                        }}
                                                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                                                        className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] relative z-10"
                                                                    >
                                                                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50" />
                                                                    </motion.div>
                                                                    <div className="absolute bottom-4 left-4 flex items-center space-x-3 text-slate-500">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                                        <span className="text-[8px] font-black uppercase tracking-widest italic font-mono">LAT: 6.5244 / LONG: 3.3792 (Lagos Hub)</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'wallet' && (
                            <motion.div key="wallet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Digital Wallet</h3>
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active Balance: ₦{user.wallet?.balance?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                    {/* Top up Form */}
                                    <div className="lg:col-span-2">
                                        <form onSubmit={handleFundWallet} className="glass-card bg-gradient-to-br from-blue-600/10 to-transparent border border-white/10 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
                                            <div className="space-y-2">
                                                <h4 className="text-lg font-black text-white uppercase italic tracking-tight">Deploy Capital</h4>
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Add funds via Secure Gateway</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black">₦</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Amount"
                                                        value={topupAmount}
                                                        onChange={(e) => setTopupAmount(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-5 pl-12 pr-6 text-2xl font-black text-white placeholder:text-slate-800 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {[1000, 5000, 10000].map(amt => (
                                                        <button key={amt} type="button" onClick={() => setTopupAmount(amt.toString())} className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-slate-500 hover:text-white hover:border-blue-500/30 transition-all uppercase">₦{amt.toLocaleString()}</button>
                                                    ))}
                                                </div>
                                                <button type="submit" disabled={walletLoading} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center space-x-3 shadow-2xl">
                                                    {walletLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                    <span>Fund Credits</span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* History */}
                                    <div className="lg:col-span-3 space-y-6">
                                        <div className="flex items-center space-x-3 px-2">
                                            <History size={18} className="text-blue-500" />
                                            <h4 className="text-lg font-black text-white uppercase italic tracking-tight">Transaction Log</h4>
                                        </div>
                                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                            {walletLoading && walletTransactions.length === 0 ? (
                                                <div className="flex items-center justify-center py-10">
                                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                                </div>
                                            ) : walletTransactions.length === 0 ? (
                                                <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-16 text-center space-y-4">
                                                    <History size={40} className="mx-auto text-slate-700 opacity-20" />
                                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">No data logged</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {walletTransactions.map((tx: any, i) => (
                                                        <div key={i} className="glass-card bg-white/5 border border-white/5 rounded-[1.5rem] p-6 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                                            <div className="flex items-center space-x-5">
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                    {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[12px] font-black text-white italic tracking-tight uppercase">{tx.description}</p>
                                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{new Date(tx.date).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className={`text-xl font-black italic tracking-tighter ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                                                {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {walletTotalPages > 1 && (
                                                        <div className="flex items-center justify-between pt-4">
                                                            <button
                                                                onClick={() => fetchWalletTransactions(walletPage - 1)}
                                                                disabled={walletPage === 1}
                                                                className="px-4 py-2 text-[10px] font-black text-slate-500 hover:text-white disabled:opacity-20 uppercase tracking-widest"
                                                            >
                                                                Previous
                                                            </button>
                                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                                Page {walletPage} of {walletTotalPages}
                                                            </span>
                                                            <button
                                                                onClick={() => fetchWalletTransactions(walletPage + 1)}
                                                                disabled={walletPage === walletTotalPages}
                                                                className="px-4 py-2 text-[10px] font-black text-slate-500 hover:text-white disabled:opacity-20 uppercase tracking-widest"
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Security Center</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                                        <div className="flex items-center space-x-3">
                                            <Lock size={20} className="text-blue-500" />
                                            <h4 className="text-lg font-black text-white uppercase italic tracking-tight">Access Control</h4>
                                        </div>
                                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Existing Password</label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">New Password</label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                            {error && activeTab === 'security' && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}
                                            <button type="submit" disabled={isSaving} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-white/5">
                                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save className="w-4 h-4" />}
                                                <span>Update Secret</span>
                                            </button>
                                        </form>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                                            <div className="flex items-center space-x-3">
                                                <ShieldCheck size={20} className="text-green-500" />
                                                <h4 className="text-lg font-black text-white uppercase italic tracking-tight">System Status</h4>
                                            </div>
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Verified</span>
                                                    {user.emailVerified ? <CheckCircle2 className="text-green-500" size={18} /> :
                                                        <Link href="/verify-email" className="text-[9px] font-black text-blue-500 uppercase underline tracking-widest">Verify Now</Link>}
                                                </div>
                                                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Linked</span>
                                                    {user.phoneVerified ? <CheckCircle2 className="text-green-500" size={18} /> :
                                                        <Link href="/verify-otp" className="text-[9px] font-black text-blue-500 uppercase underline tracking-widest">Enable 2FA</Link>}
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={() => { if (confirm('Exit session?')) setUser(null); }} className="w-full py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-500 hover:text-white transition-all">
                                            Terminate Session
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'wishlist' && (
                            <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">My Wishlist</h3>
                                    <button onClick={fetchWishlist} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Refresh</button>
                                </div>

                                {wishlistLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-[2rem]" />)}
                                    </div>
                                ) : !wishlist || wishlist.items.length === 0 ? (
                                    <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-20 text-center space-y-6">
                                        <div className="w-20 h-20 bg-pink-500/10 rounded-3xl flex items-center justify-center mx-auto text-pink-500 shadow-[inset_0_0_20px_rgba(236,72,153,0.1)]">
                                            <Heart className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Desires are empty</p>
                                            <Link href="/" className="inline-block px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all shadow-xl shadow-white/10">Browse Plug</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                        {wishlist.items.filter((item: any) => item.product !== null).map((item: any) => (
                                            <div key={item.product._id} className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-5 flex items-center gap-6 group hover:bg-white/[0.08] transition-all relative overflow-hidden">
                                                <div className="w-24 h-24 relative rounded-xl overflow-hidden shrink-0">
                                                    <Image
                                                        src={item.product.images[0]?.url || '/placeholder.png'}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-grow space-y-2">
                                                    <h4 className="text-sm font-black text-white uppercase italic tracking-tight truncate max-w-[150px]">{item.product.name}</h4>
                                                    <p className="text-lg font-black text-blue-500 italic">₦{item.product.variants?.[0]?.sellingPrice?.toLocaleString()}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/product/${item.product.slug}`} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white hover:bg-blue-600 transition-all">
                                                            <ExternalLink size={14} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleRemoveFromWishlist(item.product._id)}
                                                            className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => addToCart({
                                                            id: item.product._id,
                                                            name: item.product.name,
                                                            price: item.product.variants?.[0]?.sellingPrice || 0,
                                                            image: item.product.images?.[0]?.url || '/placeholder.png',
                                                            description: item.product.description,
                                                            category: item.product.category?.name || 'Uncategorized'
                                                        })}
                                                        className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                    >
                                                        <ShoppingCart size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'support' && (
                            <motion.div key="support" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Support Hub</h3>
                                    <button
                                        onClick={() => setShowTicketForm(!showTicketForm)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                                    >
                                        {showTicketForm ? 'Cancel' : 'Open Ticket'}
                                    </button>
                                </div>

                                {showTicketForm && (
                                    <form onSubmit={handleCreateTicket} className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Subject</label>
                                            <input
                                                type="text"
                                                value={newTicket.subject}
                                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                                placeholder="e.g., Order Delayed / Payment Issue"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-blue-500/50"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Message</label>
                                            <textarea
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                                placeholder="Describe your issue in detail..."
                                                rows={4}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-blue-500/50"
                                                required
                                            />
                                        </div>
                                        <button type="submit" disabled={isSaving} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2">
                                            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                                            <span>Deploy Request</span>
                                        </button>
                                    </form>
                                )}

                                {ticketsLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-[1.5rem]" />)}
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-16 text-center space-y-4">
                                        <MessageSquare size={40} className="mx-auto text-slate-700 opacity-20" />
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No active transmissions</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                                        {tickets.map(ticket => (
                                            <Link
                                                key={ticket._id}
                                                href={`/profile/support/${ticket._id}`}
                                                className="glass-card bg-white/5 border border-white/10 rounded-[1.5rem] p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all block cursor-pointer"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-blue-500 animate-pulse' : ticket.status === 'resolved' ? 'bg-green-500' : 'bg-slate-500'}`} />
                                                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{ticket.subject}</h4>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 line-clamp-1">{ticket.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-6">
                                                    <div className="text-right">
                                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest ${ticket.priority === 'urgent' ? 'text-red-500' : 'text-slate-500'}`}>{ticket.priority}</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {activeTab === 'reviews' && (
                            <motion.div key="reviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">My Reviews</h3>
                                    <button onClick={fetchReviews} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Refresh</button>
                                </div>

                                {reviewsLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-[2rem]" />)}
                                    </div>
                                ) : myReviews.length === 0 ? (
                                    <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-20 text-center space-y-6">
                                        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
                                            <Star className="w-10 h-10" />
                                        </div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No feedback left yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                        {myReviews.map(review => (
                                            <div key={review._id} className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 relative rounded-xl overflow-hidden shrink-0 border border-white/5">
                                                        <Image
                                                            src={review.product?.images?.[0]?.url || '/placeholder.png'}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-grow space-y-1">
                                                        <h4 className="text-xs font-black text-white uppercase italic tracking-tight line-clamp-1">{review.product?.name}</h4>
                                                        <div className="flex text-amber-500">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={10} fill={i < review.rating ? 'currentColor' : 'none'} className={i >= review.rating ? 'text-slate-700' : ''} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-400 italic leading-relaxed line-clamp-3">"{review.comment}"</p>
                                                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${review.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}>{review.status}</span>
                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Notifications</h3>
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                                    >
                                        Mark All Read
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                    {notifications.length === 0 ? (
                                        <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-20 text-center space-y-4">
                                            <Bell size={40} className="mx-auto text-slate-700 opacity-20" />
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No alerts detected</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification._id}
                                                className={`glass-card border rounded-[1.5rem] p-6 transition-all ${!notification.isRead ? 'bg-blue-600/5 border-blue-500/30' : 'bg-white/5 border-white/10'}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-xl ${!notification.isRead ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                                                        {notification.type === 'payment_success' ? <CheckIcon size={18} /> :
                                                            notification.type === 'wallet_update' ? <CreditCard size={18} /> :
                                                                <Bell size={18} />}
                                                    </div>
                                                    <div className="flex-grow space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className={`text-sm font-black uppercase tracking-tight ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            <span className="text-[9px] font-medium text-slate-600 uppercase">
                                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{notification.message}</p>

                                                        <div className="flex items-center gap-4 pt-2">
                                                            {notification.link && (
                                                                <Link href={notification.link} className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:underline">
                                                                    View Details <ExternalLink size={10} />
                                                                </Link>
                                                            )}
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={() => markAsRead(notification._id)}
                                                                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white"
                                                                >
                                                                    Mark as read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {showReviewForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowReviewForm(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-950 border border-white/10 rounded-[3rem] p-8 md:p-12 w-full max-w-lg relative z-10 overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

                            <div className="relative space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Product Feedback</h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Rate your experience with {reviewProduct?.name || 'this item'}</p>
                                </div>

                                <form onSubmit={handleCreateReview} className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Rating Experience</label>
                                        <div className="flex justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                    className={`transition-all ${reviewData.rating >= star ? 'text-amber-500 scale-125' : 'text-slate-800 hover:text-slate-600'}`}
                                                >
                                                    <Star size={32} fill={reviewData.rating >= star ? 'currentColor' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Detailed Comments</label>
                                        <textarea
                                            value={reviewData.comment}
                                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                            placeholder="What makes this product a plug?"
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-amber-500/50"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowReviewForm(false)}
                                            className="flex-1 py-5 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/5"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex-[2] py-5 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                                            <span>Transmit Review</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        }>
            <ProfilePageContent />
        </Suspense>
    );
}
