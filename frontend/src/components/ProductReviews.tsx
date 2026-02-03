'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, Image as ImageIcon } from 'lucide-react';

interface Review {
    _id: string;
    user: {
        firstName: string;
        lastName: string;
    };
    rating: number;
    comment: string;
    images?: { url: string; alt?: string }[];
    createdAt: string;
}

interface ProductReviewsProps {
    reviews: Review[];
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
    const [visibleCount, setVisibleCount] = React.useState(5);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMore = reviews.length > visibleCount;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0
            ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
            : 0
    }));

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/5 pb-6">
                <div className="space-y-3">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Field Reports</h2>
                    <div className="flex items-center space-x-3">
                        <div className="text-4xl font-black text-white tracking-tighter italic">{averageRating}</div>
                        <div className="space-y-1">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-slate-600'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Based on {reviews.length} reviews</p>
                        </div>
                    </div>
                </div>

                <div className="flex-grow max-w-md space-y-2">
                    {ratingCounts.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center space-x-4 text-xs font-black uppercase tracking-widest">
                            <span className="w-4 text-slate-400">{star}</span>
                            <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    className="h-full bg-blue-600"
                                />
                            </div>
                            <span className="w-8 text-right text-slate-500">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest italic opacity-50">No field reports yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-4">
                        {visibleReviews.map((review, idx) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4 hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-white font-black uppercase tracking-tighter italic">
                                                {review.user.firstName} {review.user.lastName.charAt(0)}.
                                            </div>
                                            <div className="flex text-yellow-500/80">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-700'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <Calendar className="w-3 h-3 mr-1.5" />
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>

                                <p className="text-slate-300 font-medium leading-relaxed italic">
                                    "{review.comment}"
                                </p>

                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-3 pt-2">
                                        {review.images.map((img: { url: string; alt?: string }, i: number) => (
                                            <div key={i} className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer relative">
                                                <img src={img.url} alt={img.alt || 'Review image'} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ImageIcon className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="pt-4 text-center">
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                Load More Intel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
