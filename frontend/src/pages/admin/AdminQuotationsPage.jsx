import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, CheckCircle2, Send } from 'lucide-react';
import api from '../../services/api';

const AdminQuotationsPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/quotations');
      if (res.data?.success) {
        setQuotes(res.data.data);
        const initial = {};
        res.data.data.forEach(q => {
          initial[q._id] = q.totalQuotedPrice ? String(q.totalQuotedPrice) : '';
        });
        setPrices(initial);
      }
    } catch (err) {
      console.warn('Failed to fetch quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleSavePrice = async q => {
    try {
      const res = await api.put(`/admin/quotations/${q._id}`, {
        totalQuotedPrice: prices[q._id],
      });
      if (res.data?.success) {
        setQuotes(quotes.map(x => (x._id === q._id ? res.data.data : x)));
        setMessage('Quoted price saved!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to save price');
    }
  };

  const waLink = q => {
    let phone = (q.customerPhone || '').replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = '91' + phone;
    const price = prices[q._id] || q.totalQuotedPrice || 'negotiable';
    return `https://wa.me/${phone}?text=${encodeURIComponent(
      `Hello ${q.customerName}, regarding quotation ${q.quoteNumber} for ${q.projectLocation}: Our best wholesale trade price is ₹${price}.`
    )}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-200">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Contractor & Trade Quotations</h1>
        <p className="text-xs text-slate-400">
          Review bulk requirement lists from painters, builders and plumbers, and submit custom wholesale rates.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {loading && <p className="text-xs text-slate-400">Loading...</p>}
      {!loading && quotes.length === 0 && (
        <p className="text-xs text-slate-400">Abhi koi quotation request nahi aayi.</p>
      )}

      <div className="space-y-4">
        {quotes.map(q => (
          <div key={q._id} className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-white text-sm">{q.quoteNumber}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {q.customerType}
                </span>
                <span className="text-slate-400">
                  {new Date(q.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  q.status === 'Quoted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'
                }`}
              >
                Status: {q.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <h3 className="font-bold text-white text-sm">{q.customerName}</h3>
                <p className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <a href={`tel:${q.customerPhone}`} className="hover:underline">{q.customerPhone}</a>
                </p>
                <p className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{q.customerEmail}</span>
                </p>
                <p className="flex items-start gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Site: {q.projectLocation}</span>
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Required Material List
                </span>
                <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {q.requirementsNotes}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Wholesale Quoted Price: ₹</span>
                <input
                  type="text"
                  placeholder="e.g. 145000"
                  value={prices[q._id] ?? ''}
                  onChange={e => setPrices({ ...prices, [q._id]: e.target.value })}
                  className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-black text-sm w-40"
                />
                <button
                  onClick={() => handleSavePrice(q)}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Save Price
                </button>
              </div>

              <a
                href={waLink(q)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Quotation to WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQuotationsPage;