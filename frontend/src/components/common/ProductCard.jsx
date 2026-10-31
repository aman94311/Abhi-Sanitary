import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Check, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const ProductCard = ({ product, badgeType = null }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();

  const [selectedVariant, setSelectedVariant] = useState(
    product.hasVariants && product.variants?.length > 0 ? product.variants[0] : null
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product._id);

  const regularPrice = selectedVariant ? selectedVariant.regularPrice : product.regularPrice;
  const discountPrice = selectedVariant ? selectedVariant.discountPrice : product.discountPrice;
  const currentPrice = discountPrice > 0 ? discountPrice : regularPrice;
  const hasDiscount = discountPrice > 0 && discountPrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
  const isOutOfStock = currentStock <= 0;

  const primaryImage =
    product.images?.find(img => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop';

  const handleAddToCart = e => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, selectedVariant, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleWishlistToggle = e => {
    e.preventDefault();
    toggleWishlist(product);
  };

  // Determine badge style
  const effectiveBadge =
    badgeType ||
    (product.isFeatured ? 'Featured' : product.isBestSeller ? 'Best Seller' : product.isNewArrival ? 'New' : null);

  // Variant size / finish text summary
  const variantsSummary =
    product.hasVariants && product.variants?.length > 0
      ? `Available: ${product.variants.map(v => v.name).join(' · ')}`
      : product.specifications?.find(s => s.key.toLowerCase().includes('finish') || s.key.toLowerCase().includes('color'))
      ? `${product.specifications.find(s => s.key.toLowerCase().includes('finish') || s.key.toLowerCase().includes('color')).key}: ${product.specifications.find(s => s.key.toLowerCase().includes('finish') || s.key.toLowerCase().includes('color')).value}`
      : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden p-3 sm:p-4">
      
      {/* Top Media Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center">
        
        {/* Top-Left Badge (Exact Mockup Styling) */}
        {effectiveBadge && (
          <span
            className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10 ${
              effectiveBadge === 'Featured'
                ? 'bg-sky-100 text-sky-800'
                : effectiveBadge === 'Best Seller'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-navy-900 text-white'
            }`}
          >
            {effectiveBadge}
          </span>
        )}

        {/* Top-Right Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full z-10 transition-colors ${
            isFavorited
              ? 'text-rose-500 bg-rose-50'
              : 'text-slate-400 hover:text-rose-500 bg-white/70 hover:bg-white'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
        </button>

        {/* Product Image */}
        <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center p-2">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10">
            <span className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Middle Content */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Brand Name */}
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            {product.brand}
          </span>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug}`}
            className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-brandOrange-500 transition-colors mt-0.5"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Variants / Sizes Line */}
          {variantsSummary && (
            <p className="text-[11px] text-slate-500 truncate mt-1">
              {variantsSummary}
            </p>
          )}

          {/* Ratings (Only shown if reviews exist!) */}
          {product.ratingsCount > 0 ? (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800 text-xs">
                {product.ratingsAverage.toFixed(1)}
              </span>
              <span className="text-slate-400 text-[11px]">
                ({product.ratingsCount} reviews)
              </span>
            </div>
          ) : (
            <div className="h-4"></div>
          )}
        </div>

        {/* Price & Add to Cart (Mockup Exact Design) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  ₹{regularPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold text-emerald-600">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-btnNavy hover:bg-navy-800 active:scale-[0.98] text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProductCard;
