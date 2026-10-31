import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  FileSpreadsheet,
  FileText,
  Receipt,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products & Variants', path: '/admin/products', icon: Package },
    { name: 'Shop Inventory & Sync', path: '/admin/inventory', icon: Boxes },
    { name: 'Order Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Bulk CSV Import', path: '/admin/bulk-upload', icon: FileSpreadsheet },
    { name: 'Contractor Quotes', path: '/admin/quotes', icon: FileText },
    { name: 'Invoice Generator', path: '/admin/invoices', icon: Receipt },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      
      {/* 1. Mobile Admin Top Header */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-slate-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm text-white">Abhi Store Admin</span>
        </div>

        <Link
          to="/"
          className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. Admin Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                A
              </div>
              <div>
                <span className="font-black text-white text-sm tracking-tight block">ABHI STORE</span>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Admin Console</span>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Customer Storefront</span>
          </Link>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-slate-300 font-bold truncate max-w-[90px]">{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Admin Workspace Content */}
      <main className="flex-1 bg-slate-900 min-h-screen p-4 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;