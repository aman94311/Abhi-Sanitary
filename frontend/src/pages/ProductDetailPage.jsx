import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/LoadingSkeleton';
import api from '../services/api';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, isInWishlist, shopSettings } = useShop();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        if (res.data?.success) {
          setProduct(res.data.data);
          setRelated(res.data.related || []);
          setActiveImageIndex(0);
          setQuantity(1);
          if (res.data.data.hasVariants && res.data.data.variants?.length > 0) {
            setSelectedVariant(res.data.data.variants[0]);
          } else {
            setSelectedVariant(null);
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-200 rounded-3xl animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-24 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: 'https://via.placeholder.com/600' }];

  const regularPrice = selectedVariant ? selectedVariant.regularPrice : product.regularPrice;
  const discountPrice = selectedVariant ? selectedVariant.discountPrice : product.discountPrice;
  const currentPrice = discountPrice > 0 ? discountPrice : regularPrice;
  const hasDiscount = discountPrice > 0 && discountPrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1500);
  };

  const whatsappInquiryUrl = `https://wa.me/${
    import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'
  }?text=${encodeURIComponent(
    `Hello Abhi Paints & Sanitary! I am interested in "${product.name}" (SKU: ${
      selectedVariant ? selectedVariant.sku : product.sku
    }). Is it in stock for immediate delivery?`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/category/${product.categorySlug}`} className="capitalize hover:text-brand-600">
          {product.categorySlug}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.subcategory}</span>
      </nav>

      {/* 2. Product Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Images Gallery Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={images[activeImageIndex]?.url}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                isFavorited ? 'bg-rose-50 text-rose-600 shadow-md' : 'bg-white/80 text-slate-700 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx ? 'border-brand-600 scale-95' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions Column */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
              <span className="text-xs font-mono text-slate-400">
                SKU: {selectedVariant ? selectedVariant.sku : product.sku}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings (Only shown if reviews exist) */}
            {product.ratingsCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-bold text-slate-900 text-sm">{product.ratingsAverage.toFixed(1)}</span>
                <span className="text-slate-400 text-xs">({product.ratingsCount} verified customer ratings)</span>
              </div>
            )}
          </div>

          {/* Price display */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-slate-400 line-through">
                  ₹{regularPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  Save ₹{(regularPrice - currentPrice).toLocaleString('en-IN')}
                </span>
              </>
            )}
            <span className="text-[11px] text-slate-400 block ml-auto">Inclusive of all taxes</span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variants selector (if present) */}
          {product.hasVariants && product.variants?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Choose Pack / Size / Finish:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.sku}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?.sku === v.sku
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="ml-2 opacity-75 font-normal">
                      ₹{(v.discountPrice || v.regularPrice).toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Availability:</span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-bold">Out of Stock at physical store</span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> In Stock ({currentStock} available in showroom)
              </span>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/25 active:scale-[0.98]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{addedSuccess ? 'Item Added to Cart!' : 'Add to Shopping Cart'}</span>
              </button>
            </div>

            {/* WhatsApp Inquiry Direct Button */}
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 border border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask Shop Availability on WhatsApp</span>
            </a>
          </div>

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Product Specifications</span>
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex">
                    <span className="w-1/3 bg-slate-50 p-2.5 font-semibold text-slate-600">{spec.key}</span>
                    <span className="w-2/3 p-2.5 text-slate-800 bg-white">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>100% Genuine</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>Site Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-brand-600" />
              <span>Direct Store Warranty</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Related Products Carousel / Grid */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Related Products in {product.categorySlug}</h2>
            <Link to={`/category/${product.categorySlug}`} className="text-xs font-semibold text-brand-600 hover:underline">
              View More &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(rel => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailPage;
