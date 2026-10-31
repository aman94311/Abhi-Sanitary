import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  MessageSquare,
  MessageCircle,
  Check,
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { useShop } from '../context/ShopContext';
import api from '../services/api';

const HomePage = () => {
  const { categories, shopSettings } = useShop();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchHomepageProducts = async () => {
      try {
        setLoadingProducts(true);
        const [featRes, bestRes, newRes] = await Promise.allSettled([
          api.get('/products/featured'),
          api.get('/products/best-sellers'),
          api.get('/products/new-arrivals'),
        ]);

        if (featRes.status === 'fulfilled' && featRes.value.data?.success) {
          setFeaturedProducts(featRes.value.data.data);
        }
        if (bestRes.status === 'fulfilled' && bestRes.value.data?.success) {
          setBestSellers(bestRes.value.data.data);
        }
        if (newRes.status === 'fulfilled' && newRes.value.data?.success) {
          setNewArrivals(newRes.value.data.data);
        }
      } catch (err) {
        console.error('Error loading products for homepage:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchHomepageProducts();
  }, []);

  const paintsCategory = categories.find(c => c.slug === 'paints');
  const sanitaryCategory = categories.find(c => c.slug === 'sanitary');

  const whatsappNumber =
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    shopSettings.whatsapp?.replace(/[^0-9]/g, '') ||
    '919876543210';

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION (EXACT MOCKUP DESIGN)                     */}
      {/* ======================================================== */}
      <section className="bg-navy-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & CTAs */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-navy-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
              Now: Shop online, pick up or get it delivered
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Colour your home.<br />
              <span className="text-brandOrange-500">Complete</span> your bathroom.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mx-auto lg:mx-0">
              Genuine paints and sanitary products from trusted brands — now just a tap away from our shop. Order online, chat with us anytime.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/category/all"
                className="px-6 py-3 bg-brandOrange-500 hover:bg-brandOrange-600 text-white rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/quote"
                className="px-6 py-3 bg-navy-800 hover:bg-navy-700 text-white border border-slate-600 rounded-lg font-bold text-sm transition-all"
              >
                Request a Quote
              </Link>
            </div>

            {/* Trust Checks */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Genuine brands
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Local delivery
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Bulk pricing
              </span>
            </div>

          </div>

          {/* Right Mockup Hero Illustration Box */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="w-full max-w-md bg-navy-800/40 rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-2xl relative">
              
              {/* Sanitary items row */}
              <div className="flex items-end justify-around mb-6">
                {/* Wash basin illustration */}
                <svg className="w-24 h-16 text-slate-200" viewBox="0 0 100 60" fill="none">
                  <path d="M10 20 C10 45, 90 45, 90 20 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                  <ellipse cx="50" cy="20" rx="40" ry="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                  <ellipse cx="50" cy="20" rx="6" ry="2" fill="#cbd5e1" />
                </svg>

                {/* Mixer tap illustration */}
                <svg className="w-16 h-20 text-slate-300" viewBox="0 0 50 70" fill="none">
                  <path d="M20 70 L20 20 C20 10, 45 10, 45 25 L40 25" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                  <rect x="14" y="65" width="12" height="5" fill="#94a3b8" />
                  <rect x="16" y="15" width="8" height="6" fill="#e2e8f0" />
                </svg>
              </div>

              {/* Paint buckets row */}
              <div className="grid grid-cols-3 gap-3 items-end">
                {/* Bucket 1: Orange */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-2 rounded-t-sm bg-slate-300 border border-slate-400"></div>
                  <div className="w-14 h-14 bg-brandOrange-500 rounded-b-lg border-2 border-slate-300 flex items-center justify-center shadow-md">
                    <div className="w-8 h-5 bg-white/90 rounded-xs"></div>
                  </div>
                </div>

                {/* Bucket 2: Teal/Cyan (Tall) */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-2 rounded-t-sm bg-slate-300 border border-slate-400"></div>
                  <div className="w-18 h-18 bg-teal-500 rounded-b-lg border-2 border-slate-300 flex items-center justify-center shadow-md">
                    <div className="w-10 h-7 bg-white/90 rounded-xs"></div>
                  </div>
                </div>

                {/* Bucket 3: Red */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-2 rounded-t-sm bg-slate-300 border border-slate-400"></div>
                  <div className="w-14 h-13 bg-rose-600 rounded-b-lg border-2 border-slate-300 flex items-center justify-center shadow-md">
                    <div className="w-8 h-4 bg-white/90 rounded-xs"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. SHOP BY CATEGORY (EXACT MOCKUP)                       */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with WhatsApp pill on top right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Everything for your walls and bathrooms, in one place.
            </p>
          </div>

          <a
            href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%20have%20an%20inquiry%20regarding%20products%20at%20Abhi%20Paints%20%26%20Sanitary.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold shadow-xs transition"
          >
            <span>Chat with us on WhatsApp</span>
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
            </div>
          </a>
        </div>

        {/* Two Main Cards: Paints (Peach) & Sanitary (Ice-Cyan) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Paints */}
          <div className="bg-peach-100 border border-peach-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Paints</h3>
                  <p className="text-xs text-slate-600 mt-1">Colour, protection and finish for every surface.</p>
                </div>

                {/* Paint bucket illustration */}
                <div className="shrink-0 pl-2">
                  <div className="w-14 h-14 bg-brandOrange-500 rounded-b-xl border-2 border-slate-400 flex items-center justify-center shadow-xs">
                    <div className="w-8 h-5 bg-white/90 rounded-xs"></div>
                  </div>
                </div>
              </div>

              {/* Subcategories tag pills */}
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  'Interior Paints',
                  'Exterior Paints',
                  'Primers',
                  'Wall Putty',
                  'Waterproofing',
                  'Enamel Paints',
                  'Wood Paints',
                ].map(sub => {
                  const slug = sub.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={sub}
                      to={`/category/paints?sub=${slug}`}
                      className="px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-medium rounded-lg border border-slate-200/80 transition shadow-2xs"
                    >
                      {sub}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-peach-200/60">
              <Link
                to="/category/paints"
                className="text-xs font-bold text-slate-900 hover:text-brandOrange-500 inline-flex items-center gap-1"
              >
                Browse all paints &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2: Sanitary */}
          <div className="bg-brandTeal-100 border border-sky-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Sanitary</h3>
                  <p className="text-xs text-slate-600 mt-1">Modern fittings and fixtures for a better bathroom.</p>
                </div>

                {/* Wash basin illustration */}
                <div className="shrink-0 pl-2">
                  <svg className="w-16 h-10 text-slate-200" viewBox="0 0 100 60" fill="none">
                    <path d="M10 20 C10 45, 90 45, 90 20 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                    <ellipse cx="50" cy="20" rx="40" ry="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Subcategories tag pills */}
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  'Wash Basins',
                  'Bathroom Taps',
                  'Showers',
                  'Toilets',
                  'Bathroom Accessories',
                  'Faucets',
                  'Pipes & Fittings',
                ].map(sub => {
                  const slug = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return (
                    <Link
                      key={sub}
                      to={`/category/sanitary?sub=${slug}`}
                      className="px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-medium rounded-lg border border-slate-200/80 transition shadow-2xs"
                    >
                      {sub}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-sky-200/60">
              <Link
                to="/category/sanitary"
                className="text-xs font-bold text-slate-900 hover:text-brandOrange-500 inline-flex items-center gap-1"
              >
                Browse all sanitary &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FEATURED PRODUCTS (EXACT MOCKUP)                      */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Hand-picked by our shop team.</p>
          </div>
          <Link
            to="/category/all"
            className="text-xs font-bold text-slate-700 hover:text-brandOrange-500"
          >
            View all &rarr;
          </Link>
        </div>

        {loadingProducts ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {featuredProducts.slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} badgeType="Featured" />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 4. MID-PAGE 3-BANNER ROW (EXACT MOCKUP)                   */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Banner 1: Orange Contractor Card */}
          <div className="bg-brandOrange-500 text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="space-y-1.5 z-10">
              <h3 className="text-lg font-extrabold leading-tight">Contractor or bulk buyer?</h3>
              <p className="text-xs text-white/90">Get custom pricing for large paint and sanitary orders.</p>
            </div>
            <div className="pt-6 z-10">
              <Link
                to="/quote"
                className="text-xs font-bold text-white hover:underline inline-flex items-center gap-1"
              >
                Request a Quote &rarr;
              </Link>
            </div>
            <div className="absolute right-4 bottom-2 opacity-25 pointer-events-none">
              <div className="w-16 h-16 bg-white rounded-b-xl border-2 border-white flex items-center justify-center"></div>
            </div>
          </div>

          {/* Banner 2: Navy WhatsApp Card */}
          <div className="bg-navy-900 text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="space-y-1.5 z-10">
              <h3 className="text-lg font-extrabold leading-tight">Check availability on WhatsApp</h3>
              <p className="text-xs text-slate-300">Ask about stock, shades and prices — we reply fast.</p>
            </div>
            <div className="pt-6 z-10">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%20want%20to%20check%20product%20availability%20and%20prices.`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-white hover:underline inline-flex items-center gap-1"
              >
                Chat with us &rarr;
              </a>
            </div>
            <div className="absolute right-4 bottom-2 opacity-25 pointer-events-none">
              <svg className="w-16 h-16 text-white" viewBox="0 0 50 70" fill="none">
                <path d="M20 70 L20 20 C20 10, 45 10, 45 25" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Banner 3: Ice-Cyan Delivery Card */}
          <div className="bg-slate-100 text-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-slate-200 shadow-2xs">
            <div className="space-y-1.5 z-10">
              <h3 className="text-lg font-extrabold leading-tight text-slate-900">Delivery to your door</h3>
              <p className="text-xs text-slate-600">Local delivery within our service area.</p>
            </div>
            <div className="pt-6 z-10">
              <Link
                to="/shipping-policy"
                className="text-xs font-bold text-slate-900 hover:text-brandOrange-500 inline-flex items-center gap-1"
              >
                See delivery details &rarr;
              </Link>
            </div>
            <div className="absolute right-4 bottom-3 opacity-30 text-slate-400 pointer-events-none">
              <Truck className="w-16 h-16" />
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. BEST SELLING PRODUCTS (EXACT MOCKUP)                   */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Best Selling Products
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">What our customers buy the most.</p>
          </div>
          <Link
            to="/category/all"
            className="text-xs font-bold text-slate-700 hover:text-brandOrange-500"
          >
            View all &rarr;
          </Link>
        </div>

        {loadingProducts ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {(bestSellers.length > 0 ? bestSellers : featuredProducts).slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} badgeType="Best Seller" />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 6. NEW ARRIVALS (EXACT MOCKUP)                            */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              New Arrivals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Fresh stock, just in.</p>
          </div>
          <Link
            to="/category/all"
            className="text-xs font-bold text-slate-700 hover:text-brandOrange-500"
          >
            View all &rarr;
          </Link>
        </div>

        {loadingProducts ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {(newArrivals.length > 0 ? newArrivals : featuredProducts).slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} badgeType="New" />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 7. WHY CHOOSE US? (EXACT MOCKUP)                          */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Us?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">A trusted local shop, now online.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brandOrange-500" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Genuine Products</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Authentic products from trusted brands, with proper billing.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
              <Truck className="w-5 h-5 text-brandOrange-500" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Local Delivery</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Doorstep delivery within our service area, charges shown at checkout.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
              <Tag className="w-5 h-5 text-brandOrange-500" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Bulk & Contractor Rates</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Request a quote for bigger projects and get custom pricing.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-brandOrange-500" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Real Human Support</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Talk to our shop team on WhatsApp or visit us in-store.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default HomePage;
