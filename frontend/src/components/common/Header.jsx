import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Phone,
  Clock,
  Truck,
  Paintbrush,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Header = () => {
  const { cartCount, wishlistCount, shopSettings } = useShop();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSuggestions(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await api.get(`/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
          if (res.data?.success) {
            setSuggestions(res.data.suggestions);
            setShowSuggestions(true);
          }
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">
      
      {/* 1. Exact Mockup Top Bar */}
      <div className="bg-navy-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-brandOrange-500" />
            <span className="font-medium text-[11px] sm:text-xs">
              Local delivery available in our service area
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-brandOrange-500" />
              {'+91 6299739653'}
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-brandOrange-500" />
              Mon-Sun, 9 AM - 8 PM
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Header / Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 sm:gap-6">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-navy-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Shop Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brandOrange-500 to-amber-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Paintbrush className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-navy-900 leading-tight">
                  {shopSettings.shopName?.split(' ')[0] || 'Abhi'}{' '}
                  <span className="text-brandOrange-500 font-extrabold">Paints</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  & Sanitary
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link
              to="/"
              className={`hover:text-brandOrange-500 transition-colors ${
                location.pathname === '/' ? 'text-brandOrange-500' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/category/paints"
              className={`hover:text-brandOrange-500 transition-colors ${
                location.pathname.startsWith('/category/paints') ? 'text-brandOrange-500' : ''
              }`}
            >
              Paints
            </Link>
            <Link
              to="/category/sanitary"
              className={`hover:text-brandOrange-500 transition-colors ${
                location.pathname.startsWith('/category/sanitary') ? 'text-brandOrange-500' : ''
              }`}
            >
              Sanitary
            </Link>
          </nav>

          {/* Search Bar with Attached "Search" Button (Mockup Exact Design) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md lg:max-w-lg relative mx-2">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search paints, basins, taps, brands or SKU..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 border-r-0 rounded-l-full text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-navy-900 transition-all placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-r-full text-xs font-bold tracking-wide transition-colors"
              >
                Search
              </button>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Product Suggestions
                </div>
                {suggestions.map(item => (
                  <Link
                    key={item._id}
                    to={`/product/${item.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                  >
                    <img
                      src={item.images?.[0]?.url || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-brandOrange-500 font-bold uppercase">{item.brand}</p>
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.subcategory}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">
                        ₹{(item.discountPrice || item.regularPrice).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-2 text-xs font-bold text-navy-900 hover:bg-slate-50 bg-slate-100"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Right Action Icons: Wishlist, Cart, Login/Signup */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-700 hover:text-navy-900 rounded-full hover:bg-slate-100 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-brandOrange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-navy-900 rounded-full hover:bg-slate-100 transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-brandOrange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login / Signup OR User Account Menu */}
            {isAuthenticated ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-full text-xs font-bold text-slate-800 hover:border-navy-900 hover:bg-slate-50 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-brandOrange-500 text-white flex items-center justify-center text-[11px] font-extrabold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                    <div className="p-2 border-b border-slate-100">
                      <p className="font-bold text-xs text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold uppercase tracking-wider">
                          Administrator
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>My Cart ({cartCount})</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>My Wishlist ({wishlistCount})</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg mt-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 border border-slate-300 rounded-full text-xs font-bold text-slate-800 hover:border-navy-900 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Login / Signup</span>
              </Link>
            )}

          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              placeholder="Search paints, basins, taps..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 border-r-0 rounded-l-full text-xs text-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-navy-900 text-white px-4 py-2 rounded-r-full text-xs font-bold"
            >
              Search
            </button>
          </form>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-extrabold text-navy-900 text-sm">Abhi Paints & Sanitary</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {isAuthenticated && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500">{user?.email}</p>
                </div>
              )}

              <Link to="/" className="block py-2 text-sm font-semibold text-slate-800 border-b border-slate-100">
                Home
              </Link>
              <Link to="/category/paints" className="block py-2 text-sm font-semibold text-slate-800 border-b border-slate-100">
                Paints
              </Link>
              <Link to="/category/sanitary" className="block py-2 text-sm font-semibold text-slate-800 border-b border-slate-100">
                Sanitary
              </Link>
              <Link to="/quote" className="block py-2 text-sm font-bold text-brandOrange-500 border-b border-slate-100">
                Request a Bulk Quote
              </Link>
              <Link to="/wishlist" className="flex items-center justify-between py-2 text-sm font-semibold text-slate-800 border-b border-slate-100">
                <span>My Wishlist</span>
                <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {wishlistCount}
                </span>
              </Link>
              <Link to="/cart" className="flex items-center justify-between py-2 text-sm font-semibold text-slate-800 border-b border-slate-100">
                <span>My Shopping Cart</span>
                <span className="text-xs bg-brandOrange-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
              </Link>

              {isAdmin && (
                <Link to="/admin/dashboard" className="block py-2 text-sm font-bold text-amber-700 bg-amber-50 px-3 rounded-xl">
                  Admin Dashboard
                </Link>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-center text-xs font-bold block"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-2.5 bg-navy-900 text-white rounded-xl text-center text-xs font-bold block"
                >
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
