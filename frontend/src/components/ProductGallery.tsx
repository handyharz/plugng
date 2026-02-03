'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
    images: {
        url: string;
        alt?: string;
    }[];
    activeImageUrl?: string;
}

export function ProductGallery({ images, activeImageUrl }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    // Sync state if an external image URL is provided (e.g., from variant selection)
    React.useEffect(() => {
        if (activeImageUrl) {
            const index = images.findIndex(img => img.url === activeImageUrl);
            if (index !== -1) {
                setSelectedImage(index);
            }
        }
    }, [activeImageUrl, images]);

    return (
        <div className="space-y-6">
            <div className="aspect-square glass-card rounded-[3rem] overflow-hidden border-white/20 bg-slate-900/50 relative">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedImage}
                        src={images[selectedImage]?.url}
                        alt={images[selectedImage]?.alt || 'Product Image'}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>
            </div>

            <div
                className="flex overflow-x-auto gap-4 scrollbar-hide snap-x scroll-smooth"
            >
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`group aspect-square w-24 flex-shrink-0 glass-card rounded-2xl overflow-hidden border-2 transition-all duration-500 snap-start ${selectedImage === index ? 'border-blue-600 scale-95 shadow-lg shadow-blue-500/20' : 'border-white/10 hover:border-white/30'
                            }`}
                    >
                        <img
                            src={image.url}
                            alt={image.alt || `Thumbnail ${index}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
