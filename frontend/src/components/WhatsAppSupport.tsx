'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsAppSupport: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    // TODO: Replace with actual business WhatsApp number
    const whatsappNumber = '2348107060160';
    const message = encodeURIComponent('Hi, I need help with...');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    return (
        <>
            {/* Floating Button */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            className="absolute bottom-20 right-0 w-72 glass-card rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10 shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>

                            {/* Content */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-emerald-500/20">
                                        <MessageCircle className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white uppercase">
                                            Need Help?
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            We're online now
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Chat with us on WhatsApp for instant support. We typically respond within minutes!
                                </p>

                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-center font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 text-sm"
                                >
                                    Start Chat
                                </a>

                                <div className="text-xs text-slate-500 text-center">
                                    Available Mon-Sat, 9am-7pm WAT
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Button */}
                <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/50 transition-colors group"
                    aria-label="WhatsApp Support"
                >
                    {/* Pulse Animation */}
                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />

                    {/* Icon */}
                    <div className="relative z-10">
                        <AnimatePresence mode="wait">
                            {isExpanded ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className="w-6 h-6" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="whatsapp"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MessageCircle className="w-6 h-6" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notification Badge */}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900" />
                </motion.button>
            </motion.div>
        </>
    );
};

export default WhatsAppSupport;
