import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  MapPin,
  RefreshCw,
  Download,
} from 'lucide-react';
import api from '../../services/api';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateMessage, setUpdateMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDownloadCsv = async () => {
    try {
      const res = await api.get('/admin/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-history-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('CSV download failed');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data?.success) {
        setOrders(orders.map(o => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
        setUpdateMessage(`Order status updated to ${newStatus}`);
        setTimeout(() => setUpdateMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(
    o => statusFilter === 'all' || o.orderStatus === statusFilter
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Orders</span>
          </button>
        </div>

      {updateMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{updateMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'Pending Payment', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              statusFilter === st
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st === 'all' ? 'All Orders' : st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(ord => (
          <div key={ord._id || ord.orderNumber} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-white text-sm">{ord.orderNumber}</span>
                <span className="text-slate-400">
                  {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-slate-400">Payment: <strong className="text-white">{ord.paymentMethod}</strong> ({ord.paymentStatus})</span>
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Update Status:</span>
                <select
                  value={ord.orderStatus}
                  onChange={e => handleStatusChange(ord._id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded-lg text-xs p-1.5 focus:outline-none"
                >
                  <option value="Pending Payment">Pending Payment</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Middle Grid: Items + Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Ordered items */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ordered Items</span>
                {ord.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.variantName || 'Base'} · SKU: {item.sku} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-extrabold text-white">₹{item.total?.toLocaleString('en-IN')}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-white">
                  <span>Grand Total</span>
                  <span className="text-emerald-400 text-sm">₹{ord.finalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Delivery destination */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Shipping Destination</span>
                <p className="font-bold text-white text-sm">{ord.shippingAddress?.fullName || ord.user?.name}</p>
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  {ord.shippingAddress?.phone || ord.user?.phone}
                </p>
                <p className="text-slate-400 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}</span>
                </p>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminOrdersPage;
