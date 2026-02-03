'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Star,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Trash2,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Search,
    User,
    ShoppingBag,
    Image as ImageIcon,
    AlertCircle,
    TrendingUp,
    ShieldCheck,
    ThumbsUp,
    Clock,
    MoreHorizontal
} from 'lucide-react';
import adminApi from '@/lib/adminApi';

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    approved: 'text-green-500 bg-green-500/10 border-green-500/20',
    rejected: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

type TabType = 'pending' | 'history';

export default function CatalogModerationPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const limit = 10;

    // We use the status filter based on the active tab
    const statusFilter = activeTab === 'pending' ? 'pending' : ''; // 'history' will show all or we can filter by approved/rejected

    const { data, isLoading } = useQuery({
        queryKey: ['adminReviews', page, activeTab, ratingFilter, searchQuery],
        queryFn: () => adminApi.getAllReviews({
            page,
            limit,
            status: activeTab === 'pending' ? 'pending' : (statusFilter || undefined)
        })
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            adminApi.updateReviewStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
        }
    });

    const reviews = data?.data || [];
    const meta = data?.meta || { total: 0, totalPages: 1 };

    // Filter by rating client-side if needed, though ideally backend should handle it
    const filteredReviews = useMemo(() => {
        let result = reviews;
        if (ratingFilter) {
            result = result.filter((r: any) => r.rating === ratingFilter);
        }
        if (searchQuery) {
            result = result.filter((r: any) =>
                r.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.user?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.comment.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return result;
    }, [reviews, ratingFilter, searchQuery]);

    const handleApprove = (id: string) => {
        updateStatusMutation.mutate({ id, status: 'approved' });
    };

    const handleReject = (id: string) => {
        updateStatusMutation.mutate({ id, status: 'rejected' });
    };

    return (
        <div className="p-8 mx-auto min-h-screen max-w-7xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Catalog Moderation</h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Manage and verify customer feedback for quality assurance.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-2xl p-1.5 shadow-xl">
                        <TabItem
                            label="Queue"
                            active={activeTab === 'pending'}
                            onClick={() => { setActiveTab('pending'); setPage(1); }}
                            count={activeTab === 'pending' ? meta.total : undefined}
                        />
                        <TabItem
                            label="History"
                            active={activeTab === 'history'}
                            onClick={() => { setActiveTab('history'); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Insights Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <MetricCard
                    title="Pending Queue"
                    value={activeTab === 'pending' ? meta.total : "..."}
                    icon={<Clock className="w-5 h-5 text-amber-500" />}
                    trend="Needs Review"
                />
                <MetricCard
                    title="Satisfaction"
                    value="4.8"
                    icon={<ThumbsUp className="w-5 h-5 text-blue-500" />}
                    trend="Avg Rating"
                />
                <MetricCard
                    title="Weekly Volume"
                    value="+124"
                    icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                    trend="New Feedback"
                />
                <MetricCard
                    title="Approval Rate"
                    value="92%"
                    icon={<CheckCircle2 className="w-5 h-5 text-purple-500" />}
                    trend="System Efficiency"
                />
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-pink-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search product, customer, or comment keyword..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-pink-500/50 focus:bg-slate-900 transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filter Rating:</span>
                    <div className="flex gap-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${ratingFilter === star ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                            >
                                {star} <Star className={`w-3 h-3 ${ratingFilter === star ? 'fill-amber-500' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="min-h-[500px] flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4 shadow-lg shadow-pink-500/20 rounded-full" />
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Loading moderation data...</p>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-900/50 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-sm">
                        <div className="w-24 h-24 bg-slate-950 rounded-[40px] flex items-center justify-center text-slate-800 mb-6 border border-white/5">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Queue is Empty</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">Everything has been processed! New customer feedback will appear here as soon as it's submitted.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredReviews.map((review: any) => (
                            <ReviewCard
                                key={review._id}
                                review={review}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onDelete={(id: string) => {
                                    if (confirm('Permanently delete this feedback?')) deleteMutation.mutate(id);
                                }}
                                isProcessing={updateStatusMutation.isPending || deleteMutation.isPending}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-12 p-8 bg-slate-900/50 border border-white/10 rounded-[2.5rem] backdrop-blur-xl">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Displaying {filteredReviews.length} results <span className="text-slate-700 mx-2">|</span> Page {page} of {meta.totalPages}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-3 rounded-2xl bg-slate-950 border border-white/10 text-slate-400 disabled:opacity-20 hover:text-white hover:border-white/20 transition-all shadow-xl"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="p-3 rounded-2xl bg-slate-950 border border-white/10 text-slate-400 disabled:opacity-20 hover:text-white hover:border-white/20 transition-all shadow-xl"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Internal Components
function MetricCard({ title, value, icon, trend }: { title: string; value: string | number; icon: React.ReactNode; trend: string }) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 transition-all group-hover:bg-white/[0.05]"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{trend}</span>
            </div>
            <div className="relative z-10">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
                <h4 className="text-3xl font-bold text-white tracking-tight">{value}</h4>
            </div>
        </div>
    );
}

function TabItem({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-white text-slate-950 shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
        >
            {label}
            {count !== undefined && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${active ? 'bg-slate-950 text-white' : 'bg-white/5 text-slate-600'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}

function ReviewCard({ review, onApprove, onReject, onDelete, isProcessing }: any) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-white/20 transition-all group shadow-2xl">
            <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-white/5">
                {/* Product Detail Section */}
                <div className="xl:w-80 p-8 flex-shrink-0 bg-white/[0.02]">
                    <div className="flex flex-row xl:flex-col gap-6">
                        <div className="w-24 h-24 xl:w-full xl:aspect-square rounded-3xl bg-slate-950 border border-white/5 overflow-hidden group-hover:border-pink-500/30 transition-all shadow-inner relative">
                            {review.product?.images?.[0] ? (
                                <img src={review.product.images[0].url} alt={review.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-800">
                                    <ImageIcon className="w-10 h-10" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 p-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold leading-tight mb-2 line-clamp-2 uppercase tracking-tight text-sm">{review.product?.name}</h4>
                            <div className="flex items-center gap-1.5 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'}`} />
                                ))}
                                <span className="ml-2 text-xs font-black text-amber-500/80">{review.rating}.0</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <Clock className="w-3 h-3" />
                                {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Content Content */}
                <div className="flex-1 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 via-pink-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center text-white font-black uppercase text-lg shadow-xl">
                                {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                            </div>
                            <div>
                                <h5 className="text-white font-bold text-sm">{review.user?.firstName} {review.user?.lastName}</h5>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{review.user?.email}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${STATUS_COLORS[review.status]}`}>
                            {review.status}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -top-6 -left-4 text-6xl font-serif text-white/5 select-none">“</div>
                        <p className="text-slate-200 text-sm leading-relaxed italic relative z-10 pl-2">
                            {review.comment}
                        </p>
                    </div>

                    {review.images?.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-8">
                            {review.images.map((img: any, idx: number) => (
                                <div key={idx} className="w-20 h-20 rounded-2xl border border-white/10 overflow-hidden bg-slate-950 group/img cursor-zoom-in">
                                    <img src={img.url} className="w-full h-full object-cover group-hover/img:scale-125 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vertical Actions Panel */}
                <div className="xl:w-60 p-8 flex flex-col justify-between gap-6 bg-slate-950/30">
                    <div className="space-y-3">
                        <h6 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 ml-1">Administration</h6>

                        {review.status !== 'approved' && (
                            <button
                                onClick={() => onApprove(review._id)}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/20 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Approve
                            </button>
                        )}

                        {review.status !== 'rejected' && (
                            <button
                                onClick={() => onReject(review._id)}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-600/20 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => onDelete(review._id)}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-slate-700 hover:text-rose-500 transition-colors text-[11px] font-black uppercase tracking-widest hover:bg-rose-500/5 rounded-2xl"
                    >
                        <Trash2 className="w-4 h-4" />
                        Trash Entry
                    </button>
                </div>
            </div>
        </div>
    );
}
