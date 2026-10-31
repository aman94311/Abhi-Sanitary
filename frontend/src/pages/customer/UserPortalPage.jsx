import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  ShoppingCart,
  FileText,
  LogOut,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import api from '../../services/api';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
  type: 'Home',
};

const UserPortalPage = () => {
  const { user, logout, isAdmin } = useAuth();
  const { wishlistCount, cartCount } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'orders';

  // ---------- Saved addresses (stored in this browser only) ----------
  const addressKey = `abhi_addresses_${user?._id || user?.id || user?.email || 'guest'}`;

  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);

  useEffect(() => {
    if (!user) return;
    try {
      const saved = localStorage.getItem(addressKey);
      setAddresses(saved ? JSON.parse(saved) : []);
    } catch {
      setAddresses([]);
    }
  }, [addressKey, user]);

  const persistAddresses = list => {
    setAddresses(list);
    try {
      localStorage.setItem(addressKey, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  };

  // ---------- Real orders from backend ----------
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const res = await api.get('/orders/my');
      if (res.data?.success) setCustomerOrders(res.data.data);
    } catch (err) {
      setOrdersError(err.message || 'Could not load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">You must be logged in to access your customer panel.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold">
          Sign In Now
        </Link>
      </div>
    );
  }

  const handleAddAddress = e => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.pincode) return;

    persistAddresses([
      ...addresses,
      { id: Date.now(), ...newAddress, isDefault: addresses.length === 0 },
    ]);
    setShowAddressModal(false);
    setNewAddress(emptyAddress);
  };

  const handleDeleteAddress = id => {
    const remaining = addresses.filter(a => a.id !== id);
    if (remaining.length > 0 && !remaining.some(a => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    persistAddresses(remaining);
  };

  const handleSetDefault = id => {
    persistAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabBtn = tab =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
      activeTab === tab ? 'bg-navy-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
    }`;

  const inputCls = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brandOrange-500 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                Customer Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.email} · {user.phone || 'Phone not set'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Switch to Admin Panel</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 space-y-1 shadow-xs">
          <button onClick={() => setSearchParams({ tab: 'orders' })} className={tabBtn('orders')}>
            <Package className="w-4 h-4" />
            <span>My Orders</span>
          </button>
          <button onClick={() => setSearchParams({ tab: 'addresses' })} className={tabBtn('addresses')}>
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses</span>
          </button>
          <button onClick={() => setSearchParams({ tab: 'profile' })} className={tabBtn('profile')}>
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </button>

          <div className="pt-2 border-t border-slate-100 my-1"></div>

          <Link
            to="/wishlist"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Wishlist</span>
            </span>
            <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
              {wishlistCount}
            </span>
          </Link>

          <Link
            to="/cart"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4 text-brandOrange-500" />
              <span>Shopping Cart</span>
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              {cartCount}
            </span>
          </Link>

          <Link
            to="/quote"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Request Bulk Quote</span>
          </Link>
        </div>

        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Order History</h2>
                  <p className="text-xs text-slate-500">Track shipments, verify delivered materials and view receipts.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={fetchOrders} className="text-xs font-bold text-slate-600 hover:underline">
                    Refresh
                  </button>
                  <Link to="/category/all" className="text-xs font-bold text-brandOrange-500 hover:underline">
                    Browse Store &rarr;
                  </Link>
                </div>
              </div>

              {ordersLoading && <p className="text-xs text-slate-500">Loading orders...</p>}
              {ordersError && <p className="text-xs text-rose-600 font-semibold">{ordersError}</p>}

              {!ordersLoading && customerOrders.length > 0 ? (
                <div className="space-y-4">
                  {customerOrders.map(order => {
                    const statusStyle =
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded'
                        ? 'bg-rose-100 text-rose-800'
                        : order.orderStatus === 'Shipped'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800';
                    const a = order.shippingAddress || {};

                    return (
                      <div key={order._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Placed</span>
                              <span className="font-semibold text-slate-800">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Order #</span>
                              <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total</span>
                              <span className="font-black text-slate-900">
                                ₹{order.finalAmount?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${statusStyle}`}
                          >
                            {order.orderStatus === 'Delivered' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {order.orderStatus}
                          </span>
                        </div>

                        <div className="p-4 divide-y divide-slate-100">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                              <div>
                                <h4 className="font-bold text-slate-900">{item.name}</h4>
                                <p className="text-slate-500 text-[11px]">
                                  {item.variantName ? `Variant: ${item.variantName} · ` : ''}Qty: {item.quantity}
                                </p>
                              </div>
                              <span className="font-extrabold text-slate-900">
                                ₹{item.total?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-slate-50/75 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-brandOrange-500" />
                            Delivery to: {a.addressLine1}, {a.city} - {a.pincode}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {order.paymentMethod} ({order.paymentStatus})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                !ordersLoading && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                    <Package className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="font-bold text-slate-800 text-sm">No orders yet</h3>
                    <p className="text-xs text-slate-500">Your online paint and sanitary purchases will appear here.</p>
                    <Link
                      to="/category/all"
                      className="inline-block px-4 py-2 bg-brandOrange-500 text-white rounded-xl text-xs font-bold"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Saved Delivery Addresses</h2>
                  <p className="text-xs text-slate-500">Manage construction site, office and home delivery destinations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">No saved addresses</h3>
                  <p className="text-xs text-slate-500">Add a delivery address to see it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Default Delivery
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{addr.fullName}</h4>
                      <p className="text-xs text-slate-600">{addr.addressLine1}</p>
                      <p className="text-xs text-slate-600">
                        {addr.city}
                        {addr.state ? `, ${addr.state}` : ''} - {addr.pincode}
                      </p>
                      <p className="text-xs text-slate-500 font-mono pt-1">Phone: {addr.phone}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {!addr.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-[11px] font-bold text-brandOrange-500 hover:underline"
                          >
                            Set as default
                          </button>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 text-sm">Add Delivery Address</h3>
                      <button
                        onClick={() => setShowAddressModal(false)}
                        className="text-slate-400 hover:text-slate-700 text-xl leading-none"
                      >
                        &times;
                      </button>
                    </div>

                    <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Recipient Name</label>
                        <input
                          type="text"
                          required
                          value={newAddress.fullName}
                          onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={newAddress.phone}
                          onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Street / Building Address</label>
                        <input
                          type="text"
                          required
                          value={newAddress.addressLine1}
                          onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">State</label>
                          <input
                            type="text"
                            required
                            value={newAddress.state}
                            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          maxLength={6}
                          value={newAddress.pincode}
                          onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Address Type</label>
                        <select
                          value={newAddress.type}
                          onChange={e => setNewAddress({ ...newAddress, type: e.target.value })}
                          className={inputCls}
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Office / Work</option>
                          <option value="Construction Site">Construction Site</option>
                        </select>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(false)}
                          className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="w-1/2 py-2.5 bg-navy-900 text-white rounded-xl font-bold">
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Full Name</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{user.name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{user.email}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Phone</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{user.phone || 'None'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Role</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5 uppercase">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPortalPage;