import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(res => res.data?.success && setOrder(res.data.data))
      .catch(err => setError(err.message || 'Could not load order'));
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h1>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        {order && (
          <div className="text-sm text-slate-600 space-y-1">
            <p>
              Order number: <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
            </p>
            <p>
              Total to pay on delivery:{' '}
              <span className="font-bold text-slate-900">₹{order.finalAmount.toLocaleString('en-IN')}</span>
            </p>
            <p>
              Delivering to: {order.shippingAddress.addressLine1}, {order.shippingAddress.city} -{' '}
              {order.shippingAddress.pincode}
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/orders" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
            View My Orders
          </Link>
          <Link to="/" className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;