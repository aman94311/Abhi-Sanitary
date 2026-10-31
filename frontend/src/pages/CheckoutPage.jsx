import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, Banknote } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const inputCls =
  'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2';

const CheckoutPage = () => {
  const { cart, cartSubtotal, cartCount, clearCart, shopSettings } = useShop();
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const placedRef = useRef(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    alternatePhone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Login required
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [loading, isAuthenticated, navigate]);

  // Empty cart -> back to cart (not right after placing an order)
  useEffect(() => {
    if (!loading && isAuthenticated && cart.length === 0 && !placedRef.current) {
      navigate('/cart');
    }
  }, [loading, isAuthenticated, cart.length, navigate]);

  // Prefill from user
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        fullName: f.fullName || user.name || '',
        phone: f.phone || user.phone || '',
      }));
    }
  }, [user]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const freeThreshold = 999;
  const deliveryCharge = cartSubtotal >= freeThreshold ? 0 : shopSettings.deliveryCharge || 99;
  const estimatedTotal = cartSubtotal + deliveryCharge;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { notes, ...shippingAddress } = form;
      const payload = {
        items: cart.map(i => ({
          productId: i.product._id,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
        shippingAddress,
        notes,
      };

      const res = await api.post('/orders', payload);
      if (res.data?.success) {
        placedRef.current = true;
        clearCart();
        navigate(`/order-success/${res.data.data._id}`, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="max-w-3xl mx-auto p-12 text-center text-sm text-slate-500">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Address */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-600" /> Delivery Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input required className={inputCls} value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Mobile Number *</label>
              <input required type="tel" className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Alternate Phone</label>
            <input type="tel" className={inputCls} value={form.alternatePhone} onChange={e => set('alternatePhone', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Address Line 1 *</label>
            <input required className={inputCls} placeholder="House no, street, area" value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Address Line 2</label>
            <input className={inputCls} value={form.addressLine2} onChange={e => set('addressLine2', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Landmark</label>
            <input className={inputCls} value={form.landmark} onChange={e => set('landmark', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>City *</label>
              <input required className={inputCls} value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>State *</label>
              <input required className={inputCls} value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Pincode *</label>
              <input required inputMode="numeric" maxLength={6} className={inputCls} value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Order Notes</label>
            <textarea rows={2} className={inputCls} placeholder="Any delivery instructions" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-5 sticky top-28">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary ({cartCount} items)
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={`${item.product._id}-${item.variantId || 'base'}`} className="flex justify-between gap-3 text-xs sm:text-sm">
                <span className="text-slate-700 line-clamp-2">
                  {item.product.name}
                  {item.selectedVariantName ? ` (${item.selectedVariantName})` : ''} × {item.quantity}
                </span>
                <span className="font-semibold text-slate-900 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-semibold text-slate-900">
                {deliveryCharge === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 text-base font-extrabold text-slate-900">
              <span>Total</span>
              <span>₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
            <Banknote className="w-4 h-4" /> Cash on Delivery (pay when you receive)
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-600/25 transition-all"
          >
            {submitting ? 'Placing order...' : 'Place Order'}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Final amount is confirmed by the store
          </p>
          <Link to="/cart" className="block text-center text-xs font-semibold text-brand-600 hover:underline">
            &larr; Back to cart
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;