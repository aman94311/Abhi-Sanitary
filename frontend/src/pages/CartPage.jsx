import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

const CartPage = () => {
  const { cart, cartCount, cartSubtotal, removeFromCart, updateCartQuantity, shopSettings } = useShop();

  const freeDeliveryThreshold =   999;
  const isFreeDelivery = cartSubtotal >= freeDeliveryThreshold;
  const deliveryCharge = isFreeDelivery ? 0 : (shopSettings.deliveryCharge || 99);
  const finalTotal = cartSubtotal + (cart.length > 0 ? deliveryCharge : 0);
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {cartCount} items in your order
          </p>
        </div>
        <Link
          to="/category/all"
          className="text-xs sm:text-sm font-semibold text-brand-600 hover:underline"
        >
          Add More Items &rarr;
        </Link>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Free Delivery Progress Bar */}
            <div className="bg-brand-50 border border-brand-200/80 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between font-semibold text-brand-900 mb-2">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-600" />
                  {isFreeDelivery
                    ? 'Congratulations! You unlocked FREE Store Delivery!'
                    : `Add ₹${amountNeededForFreeDelivery.toLocaleString('en-IN')} more to get FREE Local Delivery!`}
                </span>
                <span>Threshold: ₹{freeDeliveryThreshold.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-brand-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {cart.map(item => {
                const primaryImage =
                  item.product.images?.find(img => img.isPrimary)?.url ||
                  item.product.images?.[0]?.url ||
                  'https://via.placeholder.com/100';

                return (
                  <div key={`${item.product._id}-${item.variantId || 'base'}`} className="p-4 sm:p-6 flex gap-4 items-center">
                    <img
                      src={primaryImage}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                            {item.product.brand}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-1">
                            {item.product.name}
                          </h3>
                          {item.selectedVariantName && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                              Variant: {item.selectedVariantName}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product._id, item.variantId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-1">
                        <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product._id, item.variantId, item.quantity - 1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product._id, item.variantId, item.quantity + 1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            (₹{item.price.toLocaleString('en-IN')} each)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs sticky top-28">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-semibold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Local Delivery</span>
                <span className="font-semibold text-slate-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 uppercase font-bold">FREE</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Tax Breakdown</span>
                <span>GST Included</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-base font-extrabold text-slate-900">Total Amount</span>
                <p className="text-[11px] text-slate-400">Final price on checkout</p>
              </div>
              <span className="text-2xl font-black text-slate-900">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <Link
              to="/checkout"
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 pt-2 text-[11px] text-slate-500 text-center">
              <p className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                100% Secure Payment with Razorpay
              </p>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your cart is currently empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add products from our paints and sanitary departments to place an order.
            </p>
          </div>
          <Link
            to="/category/all"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-500 transition"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
