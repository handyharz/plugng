'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';

export default function VerifyOTPPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const { verifyOTP, user } = useAuth();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move focus
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;

        setError('');
        setLoading(true);
        try {
            await verifyOTP(code);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResending(true);
        try {
            await authApi.resendOTP(user?.phone);
            setTimer(60);
        } catch (err: any) {
            setError('Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-card p-10 md:p-16 space-y-10 rounded-[3rem] border-white/10"
            >
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                        <span className="text-2xl">📱</span>
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Verify Phone</h2>
                    <p className="text-slate-400 text-sm">Enter the code sent to <span className="text-white font-bold">{user?.phone || 'your phone'}</span></p>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">(Check the terminal for the code)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                            />
                        ))}
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full cyber-button text-white disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Now'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={timer > 0 || resending}
                                className="text-slate-500 text-xs hover:text-blue-500 transition-colors disabled:opacity-50"
                            >
                                {timer > 0 ? `Resend code in ${timer}s` : resending ? 'Resending...' : 'Resend Verification Code'}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
