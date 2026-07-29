'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';

export default function AccountDeletionPage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!password || !confirmation) {
            setError('Enter your current password and type DELETE to continue.');
            return;
        }

        if (confirmation !== 'DELETE') {
            setError('Type DELETE exactly to confirm account deletion.');
            return;
        }

        try {
            setSubmitting(true);
            await userApi.deleteAccount({ password, confirmation });
            setSuccess(true);
            await logout();
            router.push('/login');
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Could not delete account.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="px-3 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-32">
            <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                    <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
                        Account Deletion
                    </span>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                        Delete Your PlugNG Account
                    </h1>
                    <p className="max-w-2xl text-xs sm:text-base leading-relaxed text-slate-400">
                        This page exists so you can initiate account deletion outside the mobile app as well. Deletion closes your account access immediately and signs out your session.
                    </p>
                </div>

                <div className="rounded-2xl sm:rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-8 space-y-4 sm:space-y-6">
                    <div className="rounded-xl sm:rounded-3xl border border-red-500/20 bg-red-500/5 p-4 sm:p-6 space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2.5 sm:gap-3 text-red-400">
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">Before you continue</h2>
                        </div>
                        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm leading-relaxed text-slate-300">
                            <li>• Your PlugNG account access will be closed immediately.</li>
                            <li>• Your saved addresses, wishlist access, and wallet access will no longer be available.</li>
                            <li>• Some records may still be retained where required for orders, fraud prevention, or legal compliance.</li>
                        </ul>
                    </div>

                    {isLoading ? (
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                            Checking your session...
                        </div>
                    ) : !user ? (
                        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-8 space-y-4">
                            <div className="flex items-center gap-3 text-blue-400">
                                <Lock className="h-5 w-5 shrink-0" />
                                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">Sign in to continue</h2>
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
                                To protect your account, deletion must be completed from an authenticated session.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-blue-500/20 bg-blue-600 px-6 py-3.5 sm:py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-500 active:scale-95"
                            >
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleDelete} className="space-y-4 sm:space-y-6">
                            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 space-y-4 sm:space-y-5">
                                <div>
                                    <label className="mb-2 block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 sm:px-5 sm:py-4 text-white text-sm outline-none transition focus:border-blue-500/40"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                                        Type DELETE To Confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmation}
                                        onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                                        placeholder="DELETE"
                                        className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 sm:px-5 sm:py-4 text-white text-sm outline-none transition focus:border-blue-500/40"
                                    />
                                </div>
                            </div>

                            {error ? (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-300">
                                    {error}
                                </div>
                            ) : null}

                            {success ? (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-300">
                                    Your account has been deleted and this session has been closed.
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl border border-red-500/20 bg-red-500/15 px-6 py-3.5 sm:py-4 text-xs font-black uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20 active:scale-95 disabled:opacity-60"
                            >
                                <Trash2 className="h-4 w-4 shrink-0" />
                                {submitting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
