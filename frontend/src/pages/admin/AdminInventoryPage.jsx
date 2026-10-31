import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Minus,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Store,
} from 'lucide-react';
import api from '../../services/api';

const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Adjustment form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('subtract'); // 'subtract' (sale/damage) or 'add' (restock)
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Physical Shop Sale');
  const [billNumber, setBillNumber] = useState('');
  const [notes, setNotes] = useState('');

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [prodRes, movRes] = await Promise.allSettled([
        api.get('/admin/products'),
        api.get('/admin/inventory/movements'),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
        setProducts(prodRes.value.data.data);
        if (prodRes.value.data.data.length > 0 && !selectedProductId) {
          setSelectedProductId(prodRes.value.data.data[0]._id);
        }
      }

      if (movRes.status === 'fulfilled' && movRes.value.data?.success) {
        setMovements(movRes.value.data.data);
      }
    } catch (err) {
      console.warn('Failed loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) return;

    const changeQty = adjustmentType === 'subtract' ? -Math.abs(Number(quantity)) : Math.abs(Number(quantity));

    try {
      const res = await api.post('/admin/inventory/adjust-stock', {
        productId: selectedProductId,
        changeQuantity: changeQty,
        reason,
        referenceId: billNumber || 'IN-STORE',
        notes: notes || 'Physical showroom counter transaction',
      });

      if (res.data?.success) {
        setMessage(res.data.message);
        setQuantity(1);
        setBillNumber('');
        setNotes('');
        loadInventoryData();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Stock adjustment failed');
    }
  };

  const selectedProduct = products.find(p => p._id === selectedProductId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Physical Shop vs Online Inventory Synchronization
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record physical in-store counter sales, deduct stock, and maintain an audit log to prevent overselling.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Grid: Adjustment Box (Left) + Current Stock Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form: Record Physical Shop Sale / Restock */}
        <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Record Stock Movement</span>
          </div>

          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Select Product *
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none"
              >
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Stock: {p.stockQuantity}) - [{p.sku}]
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Current On-Shelf Stock</span>
                  <span className="text-lg font-black text-white">{selectedProduct.stockQuantity} units</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedProduct.stockQuantity <= 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {selectedProduct.stockQuantity <= 10 ? 'Low Stock' : 'Good Stock'}
                </span>
              </div>
            )}

            {/* Action Type */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Transaction Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustmentType('subtract');
                    setReason('Physical Shop Sale');
                  }}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                    adjustmentType === 'subtract'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Deduct Stock (Sale)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdjustmentType('add');
                    setReason('Restock / Purchase');
                  }}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                    adjustmentType === 'add'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stock (Restock)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Reason *
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Physical Shop Sale">Physical Shop Sale (Cash/Offline)</option>
                  <option value="Restock / Purchase">Supplier Restock Shipment</option>
                  <option value="Damage / Breakage">Damage / Breakage</option>
                  <option value="Inventory Audit / Adjustment">Inventory Audit Adjustment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                In-Store Bill / Reference ID
              </label>
              <input
                type="text"
                placeholder="e.g. BILL-9821 / CASH"
                value={billNumber}
                onChange={e => setBillNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Sold 3 buckets to painter Anil for cash"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>Record & Synchronize Stock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Audit Trail Log (Right) */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <History className="w-4 h-4 text-amber-500" />
            <span>Stock Movement Audit Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Product / SKU</th>
                  <th className="p-3">Change</th>
                  <th className="p-3">Remaining</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {movements.map(m => (
                  <tr key={m._id} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <p className="font-bold text-white line-clamp-1">{m.productName}</p>
                      <span className="text-[10px] font-mono text-slate-500">{m.sku}</span>
                    </td>
                    <td className="p-3 font-bold font-mono">
                      <span className={m.changeQuantity < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-white">{m.updatedStock}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold text-slate-300 block">{m.reason}</span>
                      {m.referenceId && <span className="text-[10px] text-slate-500 font-mono">{m.referenceId}</span>}
                    </td>
                    <td className="p-3 text-[10px] text-slate-400">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminInventoryPage;
