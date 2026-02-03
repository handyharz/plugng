'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    MessageSquare, Send, ChevronLeft, Clock, ShieldCheck,
    AlertCircle, CheckCircle2, Loader2, User as UserIcon,
    Headset
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function TicketDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: ticket, isLoading, error } = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => ticketApi.getDetails(id),
        refetchInterval: 10000, // Poll every 10 seconds for new replies
    });

    const addCommentMutation = useMutation({
        mutationFn: (message: string) => ticketApi.addComment(id, message),
        onSuccess: () => {
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.comments]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || addCommentMutation.isPending) return;
        addCommentMutation.mutate(message);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-6">
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h2 className="text-2xl font-black text-white uppercase italic">Transmission Failed</h2>
                    <p className="text-slate-500">The requested support ticket could not be retrieved.</p>
                    <Link href="/profile?tab=support" className="inline-block px-8 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest">
                        Return to Center
                    </Link>
                </div>
            </div>
        );
    }

    const publicComments = ticket.comments.filter((c: any) => !c.isInternal);

    return (
        <div className="min-h-screen bg-black pt-32 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/profile?tab=support')}
                        className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
                    >
                        <ChevronLeft size={16} />
                        <span>Terminal Output</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/5 flex items-center space-x-2 ${ticket.status === 'open' ? 'bg-blue-600/10 text-blue-500' :
                            ticket.status === 'resolved' ? 'bg-green-600/10 text-green-500' :
                                'bg-slate-600/10 text-slate-500'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'bg-blue-500 animate-pulse' :
                                ticket.status === 'resolved' ? 'bg-green-500' :
                                    'bg-slate-500'
                                }`} />
                            <span>{ticket.status}</span>
                        </div>
                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {ticket.priority} Priority
                        </div>
                    </div>
                </div>

                {/* Ticket Summary Card */}
                <div className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                                {ticket.subject}
                            </h1>
                            <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                <span>Ref: #{ticket._id.slice(-8).toUpperCase()}</span>
                                <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed max-w-2xl">{ticket.description}</p>
                    </div>
                </div>

                {/* Chat Section */}
                <div className={`glass-card bg-white/5 border rounded-[2.5rem] flex flex-col h-[600px] overflow-hidden transition-all duration-500 ${ticket.status === 'resolved' ? 'border-green-500/50 shadow-[0_0_40px_-15px_rgba(34,197,94,0.2)]' : 'border-white/10'
                    }`}>
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Headset className="text-blue-500" size={24} />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Encrypted Connection</h3>
                        </div>
                        <div className="flex items-center space-x-2 text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                            <ShieldCheck size={10} />
                            <span>Verified Agent Access</span>
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide"
                    >
                        <AnimatePresence initial={false}>
                            {publicComments.map((comment: any, idx: number) => {
                                const isMe = comment.user?._id === user?._id || !comment.isAdmin;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex items-start max-w-[80%] space-x-4 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 ${isMe ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400'
                                                }`}>
                                                {isMe ? <UserIcon size={18} /> : <Headset size={18} />}
                                            </div>
                                            <div className="space-y-2">
                                                <div className={`p-5 rounded-[1.5rem] text-[13px] leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/10'
                                                    }`}>
                                                    {comment.message}
                                                </div>
                                                <p className={`text-[8px] font-black uppercase tracking-widest text-slate-600 ${isMe ? 'text-right' : 'text-left'}`}>
                                                    {formatDistanceToNow(new Date(comment.date), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {publicComments.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                                <MessageSquare size={48} className="text-slate-500" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Awaiting Agent Response</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-black/40 border-t border-white/10">
                        <form onSubmit={handleSendMessage} className="relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={ticket.status === 'closed' || ticket.status === 'resolved' ? "THIS CHANNEL IS CLOSED" : "TYPE YOUR MESSAGE..."}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-16 text-white text-xs font-black uppercase tracking-widest outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800 disabled:opacity-20"
                                disabled={ticket.status === 'resolved' || ticket.status === 'closed'}
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || addCommentMutation.isPending || ticket.status === 'resolved' || ticket.status === 'closed'}
                                className="absolute right-2 top-2 bottom-2 w-12 bg-white rounded-xl flex items-center justify-center text-black hover:bg-slate-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                {addCommentMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            </button>
                        </form>
                        {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                            <p className={`mt-4 text-center text-[8px] font-black uppercase tracking-widest ${ticket.status === 'resolved' ? 'text-green-500/50' : 'text-slate-500/50'}`}>
                                This transmission has been marked as {ticket.status}.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
