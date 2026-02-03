'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft,
    User,
    ShoppingBag,
    Calendar,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    Loader2,
    History,
    MoreVertical,
    Check,
    Tag,
    ArrowUpRight,
    Lock,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import adminApi from '@/lib/adminApi';

const STATUS_OPTIONS = ['open', 'in-progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const STATUS_COLORS: Record<string, string> = {
    open: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    'in-progress': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    resolved: 'text-green-500 bg-green-500/10 border-green-500/20',
    closed: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [reply, setReply] = useState('');
    const [isInternal, setIsInternal] = useState(false);

    const { data: ticket, isLoading } = useQuery({
        queryKey: ['adminTicket', id],
        queryFn: () => adminApi.getTicketById(id),
    });

    const replyMutation = useMutation({
        mutationFn: (data: { message: string, isInternal: boolean }) =>
            adminApi.replyToTicket(id, data.message, data.isInternal),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminTicket', id] });
            setReply('');
            setIsInternal(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => adminApi.updateTicket(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminTicket', id] });
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.comments]);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || replyMutation.isPending) return;
        replyMutation.mutate({ message: reply, isInternal });
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Fetching ticket history...</p>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="p-8 mx-auto min-h-screen flex flex-col">
            {/* Header & Meta */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                    <Link
                        href="/dashboard/support"
                        className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all shadow-lg shadow-white/5 mt-1"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{ticket.subject}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_COLORS[ticket.status]}`}>
                                {ticket.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                            <span className="font-mono">TID: #{ticket._id.slice(-8)}</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Created {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 px-3">
                        <Tag className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Priority</span>
                    </div>
                    {PRIORITY_OPTIONS.map((p) => (
                        <button
                            key={p}
                            onClick={() => updateMutation.mutate({ priority: p })}
                            disabled={updateMutation.isPending}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${ticket.priority === p ? 'bg-white text-slate-950 shadow-lg shadow-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
                {/* Main Chat/Timeline */}
                <div className="lg:col-span-3 flex flex-col bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Initial Description */}
                    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Initial Complaint</h4>
                        </div>
                        <p className="text-white leading-relaxed bg-slate-950/50 p-6 rounded-2xl border border-white/5 italic">
                            "{ticket.description}"
                        </p>
                    </div>

                    {/* Messages Body */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-8 space-y-8 min-h-[400px] scroll-smooth"
                    >
                        {ticket.comments?.map((comment: any, idx: number) => (
                            <div
                                key={idx}
                                className={`flex ${comment.isAdmin ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`max-w-[80%] flex flex-col ${comment.isAdmin ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-2 px-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${comment.isInternal ? 'text-amber-400' : (comment.isAdmin ? 'text-blue-400' : 'text-slate-500')}`}>
                                            {comment.isInternal ? 'Internal Note' : (comment.isAdmin ? 'Admin Support' : `${ticket.user?.firstName} (Customer)`)}
                                        </span>
                                        {comment.isInternal && <Lock className="w-3 h-3 text-amber-500" />}
                                        <span className="text-[10px] text-slate-600 font-medium">
                                            {new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`p-4 md:p-5 rounded-2xl shadow-sm ${comment.isInternal ? 'bg-amber-500/10 border border-amber-500/20 text-amber-100 italic rounded-tr-none' : (comment.isAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5')}`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Input */}
                    <div className="p-6 border-t border-white/5 bg-slate-950/30">
                        <form onSubmit={handleReply} className="relative">
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder={isInternal ? "Write an internal note..." : "Write your response here..."}
                                className={`w-full bg-slate-900 border rounded-2xl p-5 pr-16 text-white text-sm focus:outline-none transition-all resize-none shadow-inner ${isInternal ? 'border-amber-500/30 focus:border-amber-500/50' : 'border-white/10 focus:border-blue-500/50'}`}
                                rows={3}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!reply.trim() || replyMutation.isPending}
                                className={`absolute right-4 bottom-4 p-3 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg ${isInternal ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}
                            >
                                {replyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                        <div className="flex items-center justify-between mt-3">
                            <button
                                type="button"
                                onClick={() => setIsInternal(!isInternal)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider ${isInternal ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-slate-300'}`}
                            >
                                {isInternal ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {isInternal ? 'Internal Note (Hidden from Customer)' : 'Public Response'}
                            </button>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                Press Enter to send, Shift + Enter for new line
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Status Actions */}
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Quick Actions</h4>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => updateMutation.mutate({ status: 'resolved' })}
                                className="flex items-center gap-3 w-full px-4 py-3 bg-green-600/10 border border-green-600/20 text-green-500 rounded-xl hover:bg-green-600/20 transition-all text-xs font-bold"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Mark as Resolved
                            </button>
                            <button
                                onClick={() => updateMutation.mutate({ status: 'closed' })}
                                className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800 border border-white/5 text-slate-400 rounded-xl hover:bg-slate-700 transition-all text-xs font-bold"
                            >
                                <Check className="w-4 h-4" />
                                Close Ticket
                            </button>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Customer</h4>
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold uppercase overflow-hidden">
                                {ticket.user?.firstName?.[0]}{ticket.user?.lastName?.[0]}
                            </div>
                            <div>
                                <h5 className="text-white font-bold text-sm">{ticket.user?.firstName} {ticket.user?.lastName}</h5>
                                <p className="text-slate-500 text-xs truncate max-w-[120px]">{ticket.user?.email}</p>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/customers/${ticket.user?._id}`}
                            className="flex items-center justify-between text-xs font-bold text-blue-400 hover:text-white transition-colors"
                        >
                            View Full Profile
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Related Order */}
                    {ticket.order && (
                        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Related Order</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs">Order Number</span>
                                    <span className="text-white font-mono text-xs">#{ticket.order?.orderNumber}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs">Total Amount</span>
                                    <span className="text-white font-bold text-xs">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(ticket.order?.total)}</span>
                                </div>
                                <Link
                                    href={`/dashboard/orders/${ticket.order?._id}`}
                                    className="block mt-4 w-full py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-white text-center hover:bg-white/10 transition-all uppercase tracking-wider"
                                >
                                    View Order
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
