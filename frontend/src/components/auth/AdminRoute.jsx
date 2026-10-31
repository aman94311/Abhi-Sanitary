import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AdminRoute = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-brandOrange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Verifying Admin Permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin/dashboard" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-lg">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500">
            You are logged in as <strong>{user?.name}</strong> ({user?.role}). Only authorized store administrators can access the Admin Dashboard.
          </p>
          <div className="pt-2">
            <Navigate to="/profile" />
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
