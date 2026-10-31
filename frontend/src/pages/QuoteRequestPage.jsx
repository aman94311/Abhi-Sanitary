import React, { useState } from 'react';
import { Send, FileText, CheckCircle2, ShieldCheck, Phone, MapPin } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import api from '../services/api';

const QuoteRequestPage = () => {
  const { shopSettings } = useShop();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerType: 'Contractor',
    projectLocation: '',
    requirementsNotes: '',
    estimatedBucketsOrPipes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/quotations', formData);
      if (res.data?.success) setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
          Contractors & Trade Specialists
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Request a Bulk Trade Quotation
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Are you a contractor, professional painter, plumber, or building an entire commercial property? Submit your bill of materials for custom factory-direct wholesale pricing.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Quotation Request Received!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Thank you, {formData.customerName}. Our store estimation manager will review your materials list and send a discounted price quotation within 3 hours.
          </p>
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            Urgent project requirement? Call directly at <span className="font-bold text-slate-900">{shopSettings.phone}</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name / Firm Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Construction / Sunil Sharma"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.customerPhone}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.customerEmail}
                  onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  I am a: *
                </label>
                <select
                  value={formData.customerType}
                  onChange={e => setFormData({ ...formData, customerType: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="Contractor">Civil / Building Contractor</option>
                  <option value="Painter">Professional Painter / Applicator</option>
                  <option value="Plumber">Plumbing Specialist</option>
                  <option value="Builder / Developer">Builder / Architect / Interior Designer</option>
                  <option value="Individual">Individual Homeowner (Bulk Renovation)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Site / Delivery Location *
              </label>
              <input
                type="text"
                required
                placeholder="City, Area, Site address for delivery vehicle estimation"
                value={formData.projectLocation}
                onChange={e => setFormData({ ...formData, projectLocation: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                List Required Products & Quantities *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Example: 
- 10 buckets of Asian Paints Royale Luxury 20L
- 40 bags of Birla White Putty 40kg
- 50 pcs Astral CPVC 3/4 inch SDR 11 Pipes (10ft)
- 4 pcs Jaquar Continental Basin Mixers"
                value={formData.requirementsNotes}
                onChange={e => setFormData({ ...formData, requirementsNotes: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-mono"
              ></textarea>
            </div>

            {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Quotation Request'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default QuoteRequestPage;