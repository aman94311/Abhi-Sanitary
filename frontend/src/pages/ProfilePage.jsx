import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, ShieldCheck, LogOut, Package, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">You must be logged in to view your profile and order history.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold">
          Sign In Now
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-100 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brandOrange-500 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Address</span>
            <p className="font-semibold text-slate-800">{user.email}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Phone Number</span>
            <p className="font-semibold text-slate-800">{user.phone || 'Not provided'}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/orders"
            className="p-4 rounded-2xl border border-slate-200 hover:border-navy-900 hover:shadow-xs transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-slate-700 group-hover:text-brandOrange-500" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs">My Orders</h4>
                <p className="text-[11px] text-slate-400">Track and view invoices</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">&rarr;</span>
          </Link>

          <Link
            to="/wishlist"
            className="p-4 rounded-2xl border border-slate-200 hover:border-navy-900 hover:shadow-xs transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-slate-700 group-hover:text-rose-500" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs">My Wishlist</h4>
                <p className="text-[11px] text-slate-400">View saved products</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">&rarr;</span>
          </Link>
        </div>

        {isAdmin && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="font-bold text-amber-950 text-xs">Store Administrator Access</h4>
                <p className="text-[11px] text-amber-800">You have full admin privileges to manage inventory, products and orders.</p>
              </div>
            </div>
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap"
            >
              Admin Dashboard
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
