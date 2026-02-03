'use client';

import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    const variantStyles = {
        danger: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
        warning: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20',
        info: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
            <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${variant === 'danger' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        variant === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                    {variant === 'danger' ? <Trash2 size={32} /> : <AlertTriangle size={32} />}
                </div>

                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                    {title}
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">
                    {message}
                </p>

                <div className="flex flex-col w-full gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center ${variantStyles[variant]} disabled:opacity-50`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 transition-all"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
