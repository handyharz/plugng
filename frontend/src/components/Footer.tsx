'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/5 pt-20 pb-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Zap className="text-white w-6 h-6 fill-current" />
                            </div>
                            <span className="text-xl font-black tracking-tighter italic text-white text-2xl">
                                Plug<span className="text-blue-500">NG</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Nigeria's premium destination for future-ready smartphone accessories. Elevating your tech lifestyle with authenticity.
                        </p>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                <ShieldCheck className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Secured by Paystack</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">The Plug</h4>
                        <ul className="space-y-3">
                            {['Deals', 'Categories', 'Track Order', 'New Arrivals'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-500 hover:text-blue-500 transition-colors text-sm font-medium">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Support</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-3 text-slate-500 text-sm">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <span>support@plugng.shop</span>
                            </li>
                            <li className="flex items-center space-x-3 text-slate-500 text-sm">
                                <Phone className="w-4 h-4 text-blue-500" />
                                <span>+234 810 706 0160</span>
                            </li>
                            <li className="flex items-center space-x-3 text-slate-500 text-sm">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span>Abuja, Nigeria</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter/Social */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Connect</h4>
                        <div className="flex space-x-4">
                            {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-blue-600 transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">Empowering Africa</p>
                            <p className="text-xs text-white font-bold tracking-tight">Nexgen Tech Innovations Ltd</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                        © 2026 PlugNG Shop. All Rights Reserved.
                    </p>
                    <div className="flex space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
