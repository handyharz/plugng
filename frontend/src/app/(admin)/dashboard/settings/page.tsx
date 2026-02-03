'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Settings,
    Save,
    Globe,
    Truck,
    CreditCard,
    Mail,
    Bell,
    Shield,
    Info,
    Loader2,
    CheckCircle
} from 'lucide-react';
import adminApi from '@/lib/adminApi';

const CATEGORIES = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email & SMS', icon: Mail },
];

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('general');
    const [localSettings, setLocalSettings] = useState<any>({});

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ['adminSettings'],
        queryFn: adminApi.getSettings
    });

    const updateMutation = useMutation({
        mutationFn: adminApi.updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
            alert('Settings updated successfully!');
        }
    });

    useEffect(() => {
        if (settingsData?.data) {
            const transformed = settingsData.data.reduce((acc: any, curr: any) => {
                const cat = curr.category;
                if (!acc[cat]) acc[cat] = {};
                acc[cat][curr.key] = curr.value;
                return acc;
            }, {});
            setLocalSettings(transformed);
        }
    }, [settingsData]);

    const handleInputChange = (category: string, key: string, value: any) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const handleSave = () => {
        const payload = [];
        for (const category in localSettings) {
            for (const key in localSettings[category]) {
                payload.push({
                    category,
                    key,
                    value: localSettings[category][key]
                });
            }
        }
        updateMutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="p-8 mx-auto min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-500" />
                        Store Configuration
                    </h1>
                    <p className="text-slate-400 text-sm">Fine-tune your store's behavior and integrations</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-2 sticky top-8">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === cat.id ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">General Settings</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <FormItem
                                        label="Store Name"
                                        value={localSettings.general?.storeName || ''}
                                        onChange={(v: any) => handleInputChange('general', 'storeName', v)}
                                        description="This will appear on invoices and emails"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormItem
                                            label="Contact Email"
                                            value={localSettings.general?.contactEmail || ''}
                                            onChange={(v: any) => handleInputChange('general', 'contactEmail', v)}
                                        />
                                        <FormItem
                                            label="Contact Phone"
                                            value={localSettings.general?.contactPhone || ''}
                                            onChange={(v: any) => handleInputChange('general', 'contactPhone', v)}
                                        />
                                    </div>
                                    <FormItem
                                        label="Currency"
                                        value={localSettings.general?.currency || 'NGN'}
                                        onChange={(v: any) => handleInputChange('general', 'currency', v)}
                                        placeholder="e.g. NGN, USD"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'delivery' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Delivery Configurations</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <FormItem
                                        label="Base Shipping Fee"
                                        type="number"
                                        value={localSettings.delivery?.baseShippingFee || 0}
                                        onChange={(v: any) => handleInputChange('delivery', 'baseShippingFee', parseFloat(v))}
                                        description="Default fee for all orders"
                                    />
                                    <FormItem
                                        label="Free Shipping Threshold"
                                        type="number"
                                        value={localSettings.delivery?.freeShippingThreshold || 0}
                                        onChange={(v: any) => handleInputChange('delivery', 'freeShippingThreshold', parseFloat(v))}
                                        description="Orders above this amount will have zero shipping fee"
                                    />
                                    <FormItem
                                        label="Estimated Delivery Days"
                                        value={localSettings.delivery?.estimatedDays || '3-5 Days'}
                                        onChange={(v: any) => handleInputChange('delivery', 'estimatedDays', v)}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                    <h2 className="text-lg font-bold text-white">Payment Gateways</h2>
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded border border-green-500/20">Paystack Active</span>
                                </div>
                                <div className="space-y-6">
                                    <FormItem
                                        label="Paystack Public Key"
                                        value={localSettings.payment?.paystackPublicKey || ''}
                                        onChange={(v: any) => handleInputChange('payment', 'paystackPublicKey', v)}
                                        placeholder="pk_test_..."
                                        type="password"
                                    />
                                    <FormItem
                                        label="Paystack Secret Key"
                                        value={localSettings.payment?.paystackSecretKey || ''}
                                        onChange={(v: any) => handleInputChange('payment', 'paystackSecretKey', v)}
                                        placeholder="sk_test_..."
                                        type="password"
                                    />
                                </div>
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 mt-8">
                                    <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <p className="text-[11px] text-amber-500/80 leading-relaxed font-medium">
                                        Your secret keys are encrypted on the server. Never share these with anyone. PlugNG will only ever ask for keys through this interface.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'email' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">External Communications</h2>
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-pink-500" /> Resend (Email Service)
                                        </h3>
                                        <FormItem
                                            label="Resend API Key"
                                            value={localSettings.email?.resendApiKey || ''}
                                            onChange={(v: any) => handleInputChange('email', 'resendApiKey', v)}
                                            type="password"
                                        />
                                    </div>
                                    <div className="pt-6 border-t border-white/5">
                                        <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                                            <Bell className="w-3.5 h-3.5 text-blue-500" /> Termii (SMS Gateway)
                                        </h3>
                                        <FormItem
                                            label="Termii API Key"
                                            value={localSettings.email?.termiiApiKey || ''}
                                            onChange={(v: any) => handleInputChange('email', 'termiiApiKey', v)}
                                            type="password"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormItem({ label, value, onChange, description, type = 'text', placeholder = '' }: any) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
            />
            {description && (
                <p className="text-[10px] text-slate-600 font-medium px-1 italic">{description}</p>
            )}
        </div>
    );
}
