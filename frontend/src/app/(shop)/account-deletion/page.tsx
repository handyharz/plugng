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
        <section className="px-6 pb-20">
            <div className="mx-auto max-w-3xl space-y-8">
                <div className="space-y-4">
                    <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
                        Account Deletion
                    </span>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white md:text-5xl">
                        Delete Your PlugNG Account
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-400">
                        This page exists so you can initiate account deletion outside the mobile app as well. Deletion closes your account access immediately and signs out your session.
                    </p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 space-y-6">
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            <h2 className="text-lg font-black uppercase tracking-tight">Before you continue</h2>
                        </div>
                        <ul className="space-y-3 text-sm leading-6 text-slate-300">
                            <li>Your PlugNG account access will be closed immediately.</li>
                            <li>Your saved addresses, wishlist access, and wallet access will no longer be available.</li>
                            <li>Some records may still be retained where required for orders, fraud prevention, or legal compliance.</li>
                        </ul>
                    </div>

                    {isLoading ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                            Checking your session...
                        </div>
                    ) : !user ? (
                        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-4">
                            <div className="flex items-center gap-3 text-blue-400">
                                <Lock className="h-5 w-5" />
                                <h2 className="text-lg font-black uppercase tracking-tight text-white">Sign in to continue</h2>
                            </div>
                            <p className="text-sm leading-6 text-slate-400">
                                To protect your account, deletion must be completed from an authenticated session.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-500"
                            >
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleDelete} className="space-y-6">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition focus:border-blue-500/40"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                                        Type DELETE To Confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmation}
                                        onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                                        placeholder="DELETE"
                                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition focus:border-blue-500/40"
                                    />
                                </div>
                            </div>

                            {error ? (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                                    {error}
                                </div>
                            ) : null}

                            {success ? (
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                                    Your account has been deleted and this session has been closed.
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/15 px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                            >
                                <Trash2 className="h-4 w-4" />
                                {submitting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
