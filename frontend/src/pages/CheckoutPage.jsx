import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, Banknote, CreditCard } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const inputCls =
  'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2';

const loadRazorpayScript = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

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
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'ONLINE'
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

  const finishOrder = orderId => {
    placedRef.current = true;
    clearCart();
    navigate(`/order-success/${orderId}`, { replace: true });
  };

  const placeCOD = async payload => {
    const res = await api.post('/orders', payload);
    if (res.data?.success) finishOrder(res.data.data._id);
  };

  const payOnline = async payload => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Could not load payment gateway. Check your internet and try again.');
    }

    // Step 1: backend order + Razorpay order banata hai
    const res = await api.post('/orders/razorpay/create', payload);
    const { order, razorpayOrderId, amount, currency, keyId } = res.data.data;

    // Step 2: Razorpay popup
    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      order_id: razorpayOrderId,
      name: 'Abhi Sanitary & Paints',
      description: `Order ${order.orderNumber}`,
      prefill: {
        name: form.fullName,
        email: user?.email || '',
        contact: form.phone,
      },
      theme: { color: '#2563eb' },
      handler: async response => {
        // Step 3: payment ho gaya -> backend signature verify karega
        try {
          await api.post('/orders/razorpay/verify', {
            orderId: order._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          finishOrder(order._id);
        } catch (err) {
          setError(
            err.message ||
              'Payment verification failed. If money was deducted, please contact the store.'
          );
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          setError('Payment cancelled. You can try again or choose Cash on Delivery.');
          setSubmitting(false);
        },
      },
    });

    rzp.on('payment.failed', r => {
      setError(r.error?.description || 'Payment failed. Please try again.');
    });

    rzp.open();
  };

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

      if (paymentMethod === 'COD') {
        await placeCOD(payload);
      } else {
        await payOnline(payload);
        // submitting tab tak true rahega jab tak payment/verify/dismiss na ho
        return;
      }
    } catch (err) {
      setError(err.message || 'Could not place order. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="max-w-3xl mx-auto p-12 text-center text-sm text-slate-500">Loading...</div>;
  }

  const optionCls = active =>
    `flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${
      active
        ? 'border-brand-600 bg-brand-50 text-slate-900'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
    }`;

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

          {/* Payment method */}
          <div className="space-y-2">
            <p className={labelCls}>Payment Method</p>
            <label className={optionCls(paymentMethod === 'COD')}>
              <input
                type="radio"
                name="paymentMethod"
                className="accent-brand-600"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>
                Cash on Delivery
                <span className="block text-[11px] font-normal text-slate-500">Pay when you receive</span>
              </span>
            </label>
            <label className={optionCls(paymentMethod === 'ONLINE')}>
              <input
                type="radio"
                name="paymentMethod"
                className="accent-brand-600"
                checked={paymentMethod === 'ONLINE'}
                onChange={() => setPaymentMethod('ONLINE')}
              />
              <CreditCard className="w-4 h-4 text-brand-600" />
              <span>
                Pay Online
                <span className="block text-[11px] font-normal text-slate-500">UPI, Cards, Netbanking, Wallets</span>
              </span>
            </label>
          </div>

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-600/25 transition-all"
          >
            {submitting
              ? paymentMethod === 'COD'
                ? 'Placing order...'
                : 'Processing payment...'
              : paymentMethod === 'COD'
              ? 'Place Order'
              : `Pay ₹${estimatedTotal.toLocaleString('en-IN')}`}
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