import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Paintbrush,
  Droplets,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { useShop } from '../context/ShopContext';
import api from '../services/api';

const CategoryPage = () => {
  const { categorySlug } = useParams(); // 'paints' | 'sanitary' | 'all'
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useShop();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state from URL query or defaults
  const activeSubcategory = searchParams.get('sub') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeInStock = searchParams.get('inStock') === 'true';
  const searchQuery = searchParams.get('search') || '';

  const currentCategory = categories.find(
    c => c.slug === categorySlug?.toLowerCase()
  );

  // Subcategories list for current category
  const subcategoriesList =
    currentCategory?.subcategories ||
    (categorySlug === 'paints'
      ? [
          { name: 'Interior Paints', slug: 'interior-paints' },
          { name: 'Exterior Paints', slug: 'exterior-paints' },
          { name: 'Primers', slug: 'primers' },
          { name: 'Wall Putty', slug: 'wall-putty' },
          { name: 'Waterproofing', slug: 'waterproofing' },
          { name: 'Enamel Paints', slug: 'enamel-paints' },
          { name: 'Wood Paints', slug: 'wood-paints' },
        ]
      : categorySlug === 'sanitary'
      ? [
          { name: 'Wash Basins', slug: 'wash-basins' },
          { name: 'Bathroom Taps', slug: 'bathroom-taps' },
          { name: 'Showers', slug: 'showers' },
          { name: 'Toilets', slug: 'toilets' },
          { name: 'Bathroom Accessories', slug: 'bathroom-accessories' },
          { name: 'Faucets', slug: 'faucets' },
          { name: 'Pipes and Fittings', slug: 'pipes-and-fittings' },
        ]
      : []);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (categorySlug && categorySlug !== 'all') {
          params.set('category', categorySlug);
        }
        if (activeSubcategory) {
          params.set('subcategory', activeSubcategory);
        }
        if (activeSort) {
          params.set('sort', activeSort);
        }
        if (activeMinPrice) {
          params.set('minPrice', activeMinPrice);
        }
        if (activeMaxPrice) {
          params.set('maxPrice', activeMaxPrice);
        }
        if (activeInStock) {
          params.set('inStock', 'true');
        }
        if (searchQuery) {
          params.set('search', searchQuery);
        }

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data?.success) {
          setProducts(res.data.data);
          setTotalProducts(res.data.total || res.data.count || 0);
        }
      } catch (err) {
        console.error('Error loading category products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categorySlug, activeSubcategory, activeSort, activeMinPrice, activeMaxPrice, activeInStock, searchQuery]);

  // Update query params helper
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSubcategoryClick = slug => {
    if (activeSubcategory === slug) {
      updateFilter('sub', '');
    } else {
      updateFilter('sub', slug);
    }
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const pageTitle =
    categorySlug === 'paints'
      ? 'Paints & Wall Coatings'
      : categorySlug === 'sanitary'
      ? 'Sanitaryware & Bath Fittings'
      : searchQuery
      ? `Search results for "${searchQuery}"`
      : 'All Store Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* 1. Header & Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-400">
            {categorySlug === 'paints' ? (
              <span className="flex items-center gap-1.5"><Paintbrush className="w-4 h-4" /> Paints Division</span>
            ) : categorySlug === 'sanitary' ? (
              <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4" /> Sanitary Division</span>
            ) : (
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> All Departments</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{pageTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentCategory?.description ||
              'Browse genuine construction, paint, and bathroom plumbing inventory directly sourced from authentic manufacturers.'}
          </p>
        </div>
      </div>

      {/* 2. Subcategory Pills Bar (Horizontally scrollable on mobile) */}
      {subcategoriesList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Filter By Subcategory</span>
            {activeSubcategory && (
              <button
                onClick={() => updateFilter('sub', '')}
                className="text-brand-600 hover:underline lowercase font-normal"
              >
                Clear subcategory
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => updateFilter('sub', '')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                !activeSubcategory
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Subcategories
            </button>
            {subcategoriesList.map(sub => (
              <button
                key={sub.slug}
                onClick={() => handleSubcategoryClick(sub.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubcategory === sub.slug
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Body: Left Sidebar (Desktop) + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-200 space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-400 hover:text-brand-600 font-medium"
            >
              Reset all
            </button>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={activeInStock}
                onChange={e => updateFilter('inStock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Price Range (₹)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={activeMinPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
                className="w-1/2 p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={activeMaxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
                className="w-1/2 p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Quick Category Switcher */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Switch Division
            </span>
            <div className="space-y-1">
              <Link
                to="/category/paints"
                className={`block text-xs py-1.5 px-2.5 rounded-lg font-medium transition ${
                  categorySlug === 'paints' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Paints & Coatings
              </Link>
              <Link
                to="/category/sanitary"
                className={`block text-xs py-1.5 px-2.5 rounded-lg font-medium transition ${
                  categorySlug === 'sanitary' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Sanitaryware & Pipes
              </Link>
              <Link
                to="/category/all"
                className={`block text-xs py-1.5 px-2.5 rounded-lg font-medium transition ${
                  categorySlug === 'all' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Inventory
              </Link>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Top Sort & Count Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{products.length}</span> of {totalProducts} items
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={activeSort}
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 p-2 focus:outline-none focus:border-brand-500"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Ratings</option>
                  <option value="name-asc">Product Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Items Grid */}
          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  We could not find any products matching your specific filters or search keywords.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 z-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Filter Products</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* In Stock toggle */}
              <div>
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeInStock}
                    onChange={e => updateFilter('inStock', e.target.checked ? 'true' : '')}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Min / Max Price */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Price (₹)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={activeMinPrice}
                    onChange={e => updateFilter('minPrice', e.target.value)}
                    className="w-1/2 p-2 text-xs border border-slate-200 rounded-lg"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={activeMaxPrice}
                    onChange={e => updateFilter('maxPrice', e.target.value)}
                    className="w-1/2 p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryPage;
