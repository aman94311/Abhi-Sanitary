import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Star,
} from 'lucide-react';
import api from '../../services/api';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800';

const emptyForm = {
  name: '',
  categorySlug: 'paints',
  subcategory: 'Interior Paints',
  subcategorySlug: 'interior-paints',
  brand: 'Asian Paints',
  sku: '',
  regularPrice: '',
  discountPrice: '',
  stockQuantity: 20,
  imageUrl: DEFAULT_IMAGE,
  description: '',
  hasVariants: false,
  variants: [],
};

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState(emptyForm);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products');
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.data?.success) {
        setProducts(products.filter(p => p._id !== id));
        showMessage('Product deleted successfully');
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete product'));
    }
  };

  const handleFeatured = async (id) => {
    try {
      const res = await api.patch(`/admin/products/${id}/featured`);
      if (res.data?.success) {
        const updated = res.data.data;
        setProducts(prev =>
          prev.map(p => (p._id === id ? { ...p, isFeatured: updated.isFeatured } : p))
        );
        showMessage(
          updated.isFeatured
            ? 'Product marked as featured'
            : 'Product removed from featured'
        );
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update featured status'));
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const existingImages = editingProduct?.images || [];
      const images = editingProduct && existingImages.length > 0
        ? [
            { ...existingImages[0], url: formData.imageUrl, isPrimary: true },
            ...existingImages.slice(1),
          ]
        : [{ url: formData.imageUrl, isPrimary: true }];

      const payload = {
        name: formData.name,
        categorySlug: formData.categorySlug,
        subcategory: formData.subcategory,
        subcategorySlug: formData.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: formData.brand,
        sku: formData.sku.toUpperCase(),
        regularPrice: Number(formData.regularPrice),
        discountPrice: Number(formData.discountPrice) || 0,
        stockQuantity: Number(formData.stockQuantity) || 0,
        description: formData.description || `High quality ${formData.name}`,
        images,
        hasVariants: formData.variants.length > 0,
        variants: formData.variants,
        isActive: true,
      };

      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct._id}`, payload);
        if (res.data?.success) {
          showMessage('Product updated successfully!');
        }
      } else {
        const res = await api.post('/admin/products', payload);
        if (res.data?.success) {
          showMessage('New product created successfully!');
        }
      }

      setShowAddModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert(getErrorMessage(err, 'Operation failed'));
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      categorySlug: product.categorySlug || 'paints',
      subcategory: product.subcategory || '',
      subcategorySlug: product.subcategorySlug || '',
      brand: product.brand || '',
      sku: product.sku || '',
      regularPrice: product.regularPrice ?? '',
      discountPrice: product.discountPrice || '',
      stockQuantity: product.stockQuantity ?? 0,
      imageUrl: product.images?.[0]?.url || '',
      description: product.description || '',
      hasVariants: !!product.hasVariants,
      variants: (product.variants || []).map(v => ({ ...v })),
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const addVariantField = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          name: '4 L',
          sku: `${formData.sku || 'SKU'}-4L`,
          regularPrice: Number(formData.regularPrice) || 1000,
          discountPrice: Number(formData.discountPrice) || 0,
          stockQuantity: 10,
        },
      ],
    });
  };

  const updateVariant = (index, field, value) => {
    const copy = formData.variants.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    setFormData({ ...formData, variants: copy });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = categoryFilter === 'all' || p.categorySlug === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Products & Variant Management</h1>
          <p className="text-xs text-slate-400">Add, edit, and organize Paints and Sanitary catalog.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, brand, SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Filter:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-white p-2 focus:outline-none"
          >
            <option value="all">All Divisions</option>
            <option value="paints">Paints Only</option>
            <option value="sanitary">Sanitary Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category / Brand</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              )}

              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              )}

              {filteredProducts.map(p => (
                <tr key={p._id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || 'https://via.placeholder.com/60'}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{p.name}</h4>
                        <span className="text-[10px] text-slate-500">{p.subcategory}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize font-semibold text-slate-200">{p.categorySlug}</span>
                    <span className="block text-[10px] text-amber-400 uppercase font-bold">{p.brand}</span>
                  </td>
                  <td className="p-4 font-mono text-[11px] font-bold text-slate-300">{p.sku}</td>
                  <td className="p-4">
                    <span className="font-extrabold text-white">
                      ₹{(p.discountPrice || p.regularPrice).toLocaleString('en-IN')}
                    </span>
                    {p.discountPrice > 0 && (
                      <span className="block text-[10px] text-slate-500 line-through">
                        ₹{p.regularPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.stockQuantity <= 10
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {p.stockQuantity} in stock
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleFeatured(p._id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                        p.isFeatured
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-amber-500 hover:text-amber-300'
                      }`}
                      title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star
                        className="w-3.5 h-3.5"
                        fill={p.isFeatured ? 'currentColor' : 'none'}
                      />
                      <span>{p.isFeatured ? 'Featured' : 'Feature'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asian Paints Royale Luxury Matt 4L"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Division *</label>
                  <select
                    value={formData.categorySlug}
                    onChange={e => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="paints">Paints</option>
                    <option value="sanitary">Sanitary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subcategory *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Interior Paints"
                    value={formData.subcategory}
                    onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asian Paints / Jaquar"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP-ROY-4L"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.regularPrice}
                    onChange={e => setFormData({ ...formData, regularPrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Stock Count *</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cloudinary Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                ></textarea>
              </div>

              {/* Variants Section */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Add Sizing / Finish Variants</span>
                  <button
                    type="button"
                    onClick={addVariantField}
                    className="text-[11px] text-amber-400 hover:underline font-bold"
                  >
                    + Add Variant (e.g. 1L, 4L, 20L)
                  </button>
                </div>
                {formData.variants.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      placeholder="Variant (10L)"
                      value={v.name}
                      onChange={e => updateVariant(i, 'name', e.target.value)}
                      className="w-1/3 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={v.regularPrice}
                      onChange={e => updateVariant(i, 'regularPrice', Number(e.target.value))}
                      className="w-1/3 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stockQuantity}
                      onChange={e => updateVariant(i, 'stockQuantity', Number(e.target.value))}
                      className="w-1/3 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 shrink-0"
                      title="Remove variant"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 text-slate-950 rounded-xl font-black"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProductsPage;