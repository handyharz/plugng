'use client';

import React, { useEffect } from 'react';
import Modal from './Modal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'success' | 'error';
    title: string;
    message: string;
    autoClose?: boolean;
    duration?: number;
}

export default function StatusModal({
    isOpen,
    onClose,
    type,
    title,
    message,
    autoClose = true,
    duration = 3000
}: StatusModalProps) {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, duration, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} maxWidth="max-w-sm">
            <div className="flex flex-col items-center text-center py-4">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                >
                    {type === 'success' ? (
                        <CheckCircle2 size={40} className="animate-in zoom-in duration-500" />
                    ) : (
                        <AlertCircle size={40} className="animate-in zoom-in duration-500" />
                    )}
                </motion.div>

                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                    {title}
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                    {message}
                </p>

                {!autoClose && (
                    <button
                        onClick={onClose}
                        className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 transition-all"
                    >
                        Close
                    </button>
                )}

                {autoClose && (
                    <div className="mt-8 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: 0 }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                            className={`h-full ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
}
