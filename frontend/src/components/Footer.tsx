'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/5 pt-10 sm:pt-20 pb-16 sm:pb-10 px-4 sm:px-6">
            <div className="max-w-[1440px] mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-16">
                    {/* Brand Section - full width on mobile */}
                    <div className="col-span-2 lg:col-span-1 space-y-4 sm:space-y-6">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <Zap className="text-white w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black tracking-tighter italic text-white">
                                Plug<span className="text-blue-500">NG</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs">
                            Nigeria's premium destination for future-ready smartphone accessories. Elevating your tech lifestyle with authenticity.
                        </p>
                        <div className="flex items-center space-x-4 pt-1">
                            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest">Secured by Paystack</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links - half width on mobile */}
                    <div className="col-span-1 space-y-4 sm:space-y-6">
                        <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] italic">The Plug</h4>
                        <ul className="space-y-2.5 sm:space-y-3">
                            {[
                                { label: 'Deals', href: '/products?sort=discount' },
                                { label: 'Categories', href: '/categories' },
                                { label: 'Track Order', href: '/track' },
                                { label: 'New Arrivals', href: '/products?sort=newest' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-slate-400 hover:text-blue-500 transition-colors text-xs sm:text-sm font-medium">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support - half width on mobile */}
                    <div className="col-span-1 space-y-4 sm:space-y-6">
                        <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] italic">Support</h4>
                        <ul className="space-y-2.5 sm:space-y-3">
                            <li>
                                <a href="mailto:support@plugng.shop" className="flex items-center space-x-2.5 text-slate-400 hover:text-blue-500 transition-colors text-xs sm:text-sm truncate">
                                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                                    <span className="truncate">support@plugng.shop</span>
                                </a>
                            </li>
                            <li>
                                <a href="tel:+2348107060160" className="flex items-center space-x-2.5 text-slate-400 hover:text-blue-500 transition-colors text-xs sm:text-sm">
                                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                                    <span>+234 810 706 0160</span>
                                </a>
                            </li>
                            <li className="flex items-center space-x-2.5 text-slate-400 text-xs sm:text-sm">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                                <span>Abuja, Nigeria</span>
                            </li>
                        </ul>
                    </div>

                    {/* Connect - full width on mobile */}
                    <div className="col-span-2 lg:col-span-1 space-y-4 sm:space-y-6 pt-2 lg:pt-0 border-t border-white/5 lg:border-none">
                        <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] italic">Connect</h4>
                        <div className="flex items-center space-x-3">
                            {[
                                { Icon: Instagram, href: 'https://instagram.com' },
                                { Icon: Twitter, href: 'https://twitter.com' },
                                { Icon: Facebook, href: 'https://facebook.com' },
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all active:scale-95">
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </a>
                            ))}
                        </div>
                        <div className="p-3 sm:p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl sm:rounded-2xl">
                            <p className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5 italic">Empowering Africa</p>
                            <p className="text-xs text-white font-bold tracking-tight">Nexgen Tech Innovations Ltd</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 sm:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
                    <p className="text-slate-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                        © 2026 PlugNG Shop. All Rights Reserved.
                    </p>
                    <div className="flex space-x-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
