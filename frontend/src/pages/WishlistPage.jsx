import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/common/ProductCard';

const WishlistPage = () => {
  const { wishlist, wishlistCount } = useShop();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {wishlistCount} {wishlistCount === 1 ? 'product' : 'products'} saved for later
          </p>
        </div>
        <Link
          to="/category/all"
          className="text-xs sm:text-sm font-semibold text-brand-600 hover:underline"
        >
          Continue Shopping &rarr;
        </Link>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore our paints, plumbing supplies, and bathroom fixtures and tap the heart icon to save products.
            </p>
          </div>
          <Link
            to="/category/all"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-500 transition"
          >
            <span>Start Browsing Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
