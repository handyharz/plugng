'use client';

import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { useAuth } from '@/context/AuthContext';
import { UserAddress } from '@/lib/api';
import { ArrowRight, Lock, MapPin, Phone, User as UserIcon, Loader2, Tag, XCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { couponApi } from '@/lib/api';

interface ShippingDetails {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    landmark: string;
}

export default function CheckoutPage() {
    const { cart, totalAmount } = useCart();
    const { initiateCheckout, isProcessing } = useCheckout();
    const { user } = useAuth();
    const router = useRouter();

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
        fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: 'Lagos', // Default
        landmark: ''
    });

    // Auto-fill form with default address on mount or when user loads
    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0) {
            const defaultAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];
            setShippingDetails({
                fullName: defaultAddress.fullName || `${user.firstName} ${user.lastName}`,
                phone: defaultAddress.phone || user.phone,
                address: defaultAddress.address,
                city: defaultAddress.city,
                state: defaultAddress.state,
                landmark: defaultAddress.landmark || ''
            });
        }
    }, [user]);

    const handleAddressSelect = (addr: UserAddress) => {
        setShippingDetails({
            fullName: addr.fullName,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            landmark: addr.landmark || ''
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        setCouponError('');
        try {
            const response = await couponApi.validate(couponCode, totalAmount);
            if (response.success) {
                setAppliedCoupon(response.data);
            } else {
                setCouponError(response.message || 'Invalid coupon');
                setAppliedCoupon(null);
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Failed to validate coupon');
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.type === 'percentage') {
            const discount = (totalAmount * appliedCoupon.value) / 100;
            return appliedCoupon.maxDiscountAmount ? Math.min(discount, appliedCoupon.maxDiscountAmount) : discount;
        }
        return appliedCoupon.value;
    };

    const couponDiscount = calculateDiscount();
    const finalTotal = totalAmount - couponDiscount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await initiateCheckout(shippingDetails, paymentMethod, appliedCoupon?.code);
    };

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <Lock className="absolute inset-0 m-auto w-6 h-6 text-blue-500 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white animate-pulse">
                        Securing <span className="text-blue-500">Transaction</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Bridging to Secure Gateway...</p>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-8 p-12 text-center">
                <div className="p-8 bg-blue-500/10 rounded-full">
                    <Image src="/logo.png" alt="PlugNG" width={48} height={48} className="opacity-50 grayscale" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Your Plug is <span className="text-blue-500">Empty</span></h1>
                    <p className="text-slate-500 max-w-xs mx-auto">Looks like you haven't secured any deals yet. Head back to the shop to find your next plug.</p>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-3 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left: Shipping Form */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-2">Checkout</h1>
                        <p className="text-slate-400">Secure Delivery Information</p>
                    </div>

                    {user?.addresses && user.addresses.length > 0 && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
                                Saved Addresses
                            </label>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {user.addresses.map((addr, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAddressSelect(addr)}
                                        className={`flex-shrink-0 w-64 p-4 rounded-3xl border-2 text-left transition-all duration-300 ${shippingDetails.address === addr.address
                                            ? 'border-blue-600 bg-blue-600/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/30'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                                                {addr.label}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="text-[8px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-sm text-white mb-1 truncate">{addr.fullName}</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{addr.address}</p>
                                        <p className="text-[10px] text-slate-500 mt-2 font-mono">{addr.phone}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            value={shippingDetails.fullName}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={shippingDetails.phone}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="080 1234 5678"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Delivery Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={shippingDetails.address}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="123 Street Name, Estate"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={shippingDetails.city}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Ikeja"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">State</label>
                                    <select
                                        name="state"
                                        value={shippingDetails.state}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                                    >
                                        <option value="Lagos" className="bg-black">Lagos</option>
                                        <option value="Abuja" className="bg-black">Abuja</option>
                                        <option value="Rivers" className="bg-black">Rivers</option>
                                        {/* Add more states as needed */}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-32 ${paymentMethod === 'card'
                                            ? 'border-blue-600 bg-blue-600/10 scale-[1.02] shadow-lg shadow-blue-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/30'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <Lock className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-blue-500' : 'text-slate-400'}`} />
                                            </div>
                                            {paymentMethod === 'card' && (
                                                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase italic">Secure Card</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Paystack Gateway</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('wallet')}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-32 ${paymentMethod === 'wallet'
                                            ? 'border-blue-600 bg-blue-600/10 scale-[1.02] shadow-lg shadow-blue-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/30'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <Image src="/logo.png" alt="Wallet" width={20} height={20} className={paymentMethod === 'wallet' ? '' : 'opacity-50 grayscale'} />
                                            </div>
                                            {paymentMethod === 'wallet' && (
                                                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase italic">Wallet Fund</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                Balance: <span className={user?.wallet?.balance && user.wallet.balance >= totalAmount ? 'text-emerald-500' : 'text-rose-500'}>
                                                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(user?.wallet?.balance || 0)}
                                                </span>
                                            </p>
                                        </div>
                                    </button>
                                </div>
                                {paymentMethod === 'wallet' && user?.wallet?.balance !== undefined && user.wallet.balance < totalAmount && (
                                    <p className="text-[10px] font-black uppercase text-rose-500 pl-1 animate-pulse">
                                        ⚠️ Insufficient Balance. Please top up or use Card.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing || (paymentMethod === 'wallet' && (user?.wallet?.balance || 0) < totalAmount)}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        <span>
                                            {paymentMethod === 'wallet' ? 'Confirm Wallet Payment' : `Pay ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(finalTotal)}`}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Order Summary */}
                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 h-fit">
                    <h2 className="text-xl font-black uppercase italic mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {cart.map((item: CartItem) => (
                            <div key={item.variantId || item.id} className="flex gap-4">
                                <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm line-clamp-2">{item.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Qty: {item.quantity}
                                        {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, val]) => (
                                            <span key={key} className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-[10px] uppercase">
                                                {val}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                                <div className="font-mono text-sm">
                                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/10 pt-4 space-y-4">
                        {/* Coupon Section */}
                        {!appliedCoupon ? (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
                                    Promo Code
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors uppercase font-bold"
                                            placeholder="ENTER CODE"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || isValidatingCoupon}
                                        className="px-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                        {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                    </button>
                                </div>
                                {couponError && (
                                    <p className="text-[10px] text-rose-500 font-bold uppercase pl-1 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" />
                                        {couponError}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Tag className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Applied</p>
                                        <h4 className="text-xs font-bold text-white uppercase">{appliedCoupon.code}</h4>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeCoupon}
                                    className="p-2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="space-y-2 border-t border-white/10 pt-4">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(totalAmount)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-emerald-400">
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Discount ({appliedCoupon.code})
                                    </span>
                                    <span>-{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(couponDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Delivery</span>
                                <span>Calculated at next step (Free)</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-white pt-2 border-t border-white/10 mt-2">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(finalTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
