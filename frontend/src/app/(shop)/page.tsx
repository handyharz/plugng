'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { productApi, Product } from '@/lib/api';
import { CartProduct } from '@/context/CartContext';
import ProductSection from '@/components/ProductSection';
import TrustBanner from '@/components/TrustBanner';
import PaymentHighlight from '@/components/PaymentHighlight';
import DeliveryInfo from '@/components/DeliveryInfo';
import ShopByBrand from '@/components/ShopByBrand';
import WhyChooseUs from '@/components/WhyChooseUs';
import WalletPromotion from '@/components/WalletPromotion';
import Newsletter from '@/components/Newsletter';
import WhatsAppSupport from '@/components/WhatsAppSupport';
import { Flame, Star, TrendingUp, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { SearchBar } from '@/components/SearchBar';

export default function Home() {
  const [onSaleProducts, setOnSaleProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllSections = async () => {
      setIsLoading(true);
      try {
        // Always fetch newest products first (guaranteed to have results)
        const newest = await productApi.getAll({ sort: 'newest', limit: 12 });
        setNewProducts(newest.products);

        // Try to fetch filtered sections (these might be empty)
        const [onSale, featured, trending] = await Promise.all([
          productApi.getAll({ onSale: true, limit: 8 }).catch(() => ({ products: [], total: 0, page: 1, pages: 0 })),
          productApi.getAll({ featured: true, limit: 8 }).catch(() => ({ products: [], total: 0, page: 1, pages: 0 })),
          productApi.getAll({ trending: true, limit: 8 }).catch(() => ({ products: [], total: 0, page: 1, pages: 0 }))
        ]);

        setOnSaleProducts(onSale.products);
        setFeaturedProducts(featured.products);
        setTrendingProducts(trending.products);
      } catch (error) {
        console.error('Error fetching homepage sections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSections();
  }, []);

  // Map products to CartProduct format
  const mapProducts = (products: Product[]): CartProduct[] => {
    return products.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.variants && p.variants.length > 0 ? p.variants[0].sellingPrice : 0,
      compareAtPrice: p.variants && p.variants.length > 0 ? p.variants[0].compareAtPrice : undefined,
      image: p.images && p.images.length > 0
        ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url)
        : '/placeholder.jpg',
      category: typeof p.category === 'object' ? (p.category as any).name : 'Product'
    }));
  };

  const mappedOnSale = useMemo(() => mapProducts(onSaleProducts), [onSaleProducts]);
  const mappedFeatured = useMemo(() => mapProducts(featuredProducts), [featuredProducts]);
  const mappedTrending = useMemo(() => mapProducts(trendingProducts), [trendingProducts]);
  const mappedNew = useMemo(() => mapProducts(newProducts), [newProducts]);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 200], [1, 0.9]);
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <div className="space-y-0 relative">
      {/* 1. Hero Section (Search + Value Props) */}
      <section className="px-6 max-w-7xl mx-auto pt-10 pb-3 relative z-20">
        <motion.div
          layout
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="relative glass-card rounded-[3rem] p-12 overflow-hidden border-white/10 group bg-grid-white/[0.02] text-center"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 space-y-8 max-w-3xl mx-auto flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Your Plug</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
              Find Your
              <span className="text-transparent pl-4 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Upgrade</span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 font-medium max-w-md leading-relaxed mx-auto">
              Search the entire archive for premium, authentic gear.
            </p>

            {/* Unified Search Bar */}
            <SearchBar variant="hero" className="mt-8" />

            {/* Quick Chips */}
            <div className="flex flex-wrap justify-center gap-3 pt-4 opacity-60">
              {['MagSafe', 'USB-C', 'Audio', 'Protection'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-wider text-slate-400 hover:text-white hover:border-blue-500/50 cursor-pointer transition-all active:scale-95"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Trust Banner (Stats + Badges) */}
      <TrustBanner />

      {/* 3. Payment Method Highlight (Bank Transfer Discount) */}
      <PaymentHighlight />

      {/* 4. On Sale (Carousel) */}
      <div className="px-6 max-w-7xl mx-auto space-y-0" id="on-sale">
        <ProductSection
          title="On Sale"
          icon={<Flame size={32} />}
          products={mappedOnSale}
          isLoading={isLoading}
          ctaText="View All Deals"
          ctaLink="/shop?onSale=true"
          layout="carousel"
          accentColor="#EF4444"
        />
      </div>

      {/* 5. Featured Products (Grid) */}
      <div className="px-6 max-w-7xl mx-auto space-y-0">
        <ProductSection
          title="Featured"
          icon={<Star size={32} />}
          products={mappedFeatured}
          isLoading={isLoading}
          ctaText="Explore Featured"
          ctaLink="/shop?featured=true"
          layout="grid"
          accentColor="#3B82F6"
        />
      </div>

      {/* 6. Delivery Information (Visual Map) */}
      <DeliveryInfo />

      {/* 7. Shop by Brand (Carousel) */}
      <ShopByBrand />

      {/* 8. Trending Now (Carousel) */}
      <div className="px-6 max-w-7xl mx-auto space-y-0">
        <ProductSection
          title="Trending Now"
          icon={<TrendingUp size={32} />}
          products={mappedTrending}
          isLoading={isLoading}
          ctaText="See What's Hot"
          ctaLink="/shop?trending=true"
          layout="carousel"
          accentColor="#A855F7"
        />
      </div>

      {/* 9. New Arrivals (Grid) */}
      <div className="px-6 max-w-7xl mx-auto space-y-0">
        <ProductSection
          title="New Arrivals"
          icon={<Sparkles size={32} />}
          products={mappedNew}
          isLoading={isLoading}
          ctaText="Browse New Gear"
          ctaLink="/shop?sort=newest"
          layout="grid"
          accentColor="#22C55E"
        />
      </div>

      {/* 10. Why Choose Us (4-column grid) */}
      <WhyChooseUs />

      {/* 11. Category Showcase "The Archive" */}
      <section className="px-6 max-w-7xl mx-auto py-16 border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
              The <span className="text-blue-500">Archive</span>
            </h2>
            <p className="text-slate-500 max-w-md">
              Discover curated tech collections across our most popular ecosystems.
            </p>
          </div>
          <Link href="/categories" className="text-xs font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors group flex items-center gap-2 text-right">
            Explore All <TrendingUp size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Cases & Covers', slug: 'cases', emoji: '📱', color: 'from-blue-500/20' },
            { name: 'Power & Charging', slug: 'chargers', emoji: '🔌', color: 'from-purple-500/20' },
            { name: 'Protection', slug: 'screen-protectors', emoji: '🛡️', color: 'from-emerald-500/20' },
            { name: 'Audio Gear', slug: 'headphones', emoji: '🎧', color: 'from-rose-500/20' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden glass-card hover:bg-white/10 border border-white/10 rounded-3xl p-8 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <div className="text-4xl mb-4 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">{cat.emoji}</div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-tight">
                  {cat.name}
                </h3>
                <div className="mt-2 text-[10px] font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">
                  View Collection →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 12. Wallet Promotion Banner */}
      <WalletPromotion />

      {/* 13. Newsletter Signup */}
      <Newsletter />

      {/* 14. WhatsApp Support (Floating) */}
      <WhatsAppSupport />
    </div>
  );
}
