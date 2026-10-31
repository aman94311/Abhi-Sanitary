import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';

// Public Storefront Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import QuoteRequestPage from './pages/QuoteRequestPage';
import PolicyPage from './pages/PolicyPage';
import LoginPage from './pages/LoginPage';

// Customer (Normal User) Portal
import UserPortalPage from './pages/customer/UserPortalPage';

// Admin Panel Layout & Pages
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminBulkUploadPage from './pages/admin/AdminBulkUploadPage';
import AdminQuotationsPage from './pages/admin/AdminQuotationsPage';
import InvoiceGeneratorPage from './pages/admin/InvoiceGeneratorPage';

import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <Routes>
            
            {/* ======================================================== */}
            {/* 1. ADMIN DASHBOARD PANEL (Protected by Admin Role)        */}
            {/* ======================================================== */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="bulk-upload" element={<AdminBulkUploadPage />} />
                <Route path="quotes" element={<AdminQuotationsPage />} />
                <Route path="invoices" element={<InvoiceGeneratorPage />} />
              </Route>
            </Route>

            {/* ======================================================== */}
            {/* 2. CUSTOMER STOREFRONT & USER PORTAL                      */}
            {/* ======================================================== */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      {/* Customer Storefront */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/category/:categorySlug" element={<CategoryPage />} />
                      <Route path="/product/:slug" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/quote" element={<QuoteRequestPage />} />
                      <Route path="/login" element={<LoginPage defaultTab="login" />} />
                      <Route path="/signup" element={<LoginPage defaultTab="signup" />} />

                      {/* Customer (Normal User) Dedicated Panel */}
                      <Route path="/profile" element={<UserPortalPage />} />
                      <Route path="/account" element={<UserPortalPage />} />
                      <Route path="/orders" element={<UserPortalPage />} />

                      {/* Store Policies */}
                      <Route path="/return-policy" element={<PolicyPage />} />
                      <Route path="/shipping-policy" element={<PolicyPage />} />
                      <Route path="/privacy-policy" element={<PolicyPage />} />
                      <Route path="/terms-and-conditions" element={<PolicyPage />} />
                    </Routes>
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </div>
              }
            />

          </Routes>
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;