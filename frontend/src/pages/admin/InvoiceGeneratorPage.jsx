import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Download,
  Eye,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { buildInvoicePdf, calcTotals, formatINR } from '../../utils/generateInvoicePdf';
import {
  loadShopDetails,
  saveShopDetails,
  getSuggestedInvoiceNo,
  markInvoiceDownloaded,
} from '../../utils/invoiceShopDetails';

const inputCls =
  'w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500';

const Field = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{label}</label>
    {children}
  </div>
);

const SHOP_FIELDS = [
  ['name', 'Shop Name'],
  ['gstin', 'GSTIN'],
  ['pan', 'PAN'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['stateName', 'State Name'],
  ['stateCode', 'State Code'],
  ['placeOfSupply', 'Place of Supply'],
  ['invoicePrefix', 'Invoice Prefix'],
];

const GST_OPTIONS = [0, 5, 12, 18, 28];

const blankItem = () => ({ description: '', hsn: '', qty: 1, rate: '' });
const today = () => new Date().toISOString().slice(0, 10);

const newInvoice = () => ({
  invoiceNo: getSuggestedInvoiceNo(),
  date: today(),
  customer: { name: '', phone: '', address: '', gstin: '' },
  items: [blankItem()],
  gst: 18,
  inclusive: false,
});

const InvoiceGeneratorPage = () => {
  const [shop, setShop] = useState(loadShopDetails);
  const [showShop, setShowShop] = useState(false);
  const [message, setMessage] = useState('');
  const [invoice, setInvoice] = useState(newInvoice);

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const setShopField = (field, value) => setShop({ ...shop, [field]: value });
  const setCustomer = (field, value) =>
    setInvoice({ ...invoice, customer: { ...invoice.customer, [field]: value } });

  const updateItem = (index, field, value) => {
    const items = invoice.items.map((it, i) => (i === index ? { ...it, [field]: value } : it));
    setInvoice({ ...invoice, items });
  };
  const addItem = () => setInvoice({ ...invoice, items: [...invoice.items, blankItem()] });
  const removeItem = (index) => {
    if (invoice.items.length === 1) return;
    setInvoice({ ...invoice, items: invoice.items.filter((_, i) => i !== index) });
  };

  const handleSaveShop = () => {
    saveShopDetails(shop);
    flash('Shop details saved');
  };

  const handleReset = () => setInvoice(newInvoice());

  // GST dono (CGST + SGST) me barabar bantta hai. Inclusive ho to rate me se GST nikaal dete hain.
  const half = invoice.gst / 2;
  const validItems = invoice.items.filter((it) => it.description.trim());
  const pdfItems = validItems.map((it) => {
    const rate = Number(it.rate) || 0;
    return {
      ...it,
      rate: invoice.inclusive ? rate / (1 + invoice.gst / 100) : rate,
    };
  });
  const totals = calcTotals(pdfItems, half, half);

  const buildDoc = () => {
    if (!invoice.customer.name.trim()) {
      alert('Customer ka naam daalo');
      return null;
    }
    if (validItems.length === 0) {
      alert('Kam se kam ek product daalo');
      return null;
    }
    return buildInvoicePdf({
      shop,
      invoice: {
        invoiceNo: invoice.invoiceNo,
        date: invoice.date,
        client: {
          ...invoice.customer,
          stateName: shop.stateName,
          stateCode: shop.stateCode,
        },
        items: pdfItems,
        cgstRate: half,
        sgstRate: half,
      },
    });
  };

  const handlePreview = () => {
    const doc = buildDoc();
    if (doc) window.open(doc.output('bloburl'), '_blank');
  };

  const handleDownload = () => {
    const doc = buildDoc();
    if (!doc) return;
    doc.save(`Invoice-${invoice.invoiceNo || 'draft'}.pdf`);
    markInvoiceDownloaded(invoice.invoiceNo);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Invoice Generator</h1>
        <p className="text-xs text-slate-400">
          Customer aur product bharo, PDF download karo. Invoice ka data save nahi hota.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Customer */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
        <h2 className="text-sm font-bold text-white">Customer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Customer Name *">
            <input className={inputCls} value={invoice.customer.name} onChange={(e) => setCustomer('name', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputCls} value={invoice.customer.phone} onChange={(e) => setCustomer('phone', e.target.value)} />
          </Field>
          <Field label="Customer GSTIN (agar ho)">
            <input className={inputCls} value={invoice.customer.gstin} onChange={(e) => setCustomer('gstin', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Invoice No.">
            <input className={inputCls} value={invoice.invoiceNo} onChange={(e) => setInvoice({ ...invoice, invoiceNo: e.target.value })} />
          </Field>
          <Field label="Date">
            <input type="date" className={inputCls} value={invoice.date} onChange={(e) => setInvoice({ ...invoice, date: e.target.value })} />
          </Field>
        </div>
        <Field label="Address">
          <textarea rows={2} className={inputCls} value={invoice.customer.address} onChange={(e) => setCustomer('address', e.target.value)} />
        </Field>
      </div>

      {/* Items */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Products</h2>
          <button type="button" onClick={addItem} className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:underline">
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>

        <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-500">
          <span className="col-span-5">Product</span>
          <span className="col-span-2">HSN (optional)</span>
          <span className="col-span-1">Qty</span>
          <span className="col-span-3">Price (per piece)</span>
        </div>

        {invoice.items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input
              className={`${inputCls} col-span-12 sm:col-span-5`}
              placeholder="Product name"
              value={it.description}
              onChange={(e) => updateItem(i, 'description', e.target.value)}
            />
            <input
              className={`${inputCls} col-span-4 sm:col-span-2`}
              placeholder="HSN"
              value={it.hsn}
              onChange={(e) => updateItem(i, 'hsn', e.target.value)}
            />
            <input
              type="number"
              min="0"
              className={`${inputCls} col-span-3 sm:col-span-1`}
              placeholder="Qty"
              value={it.qty}
              onChange={(e) => updateItem(i, 'qty', e.target.value)}
            />
            <input
              type="number"
              min="0"
              className={`${inputCls} col-span-4 sm:col-span-3`}
              placeholder="Price"
              value={it.rate}
              onChange={(e) => updateItem(i, 'rate', e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="col-span-1 p-1.5 text-slate-400 hover:text-rose-400"
              title="Remove product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="flex flex-wrap items-end gap-4 pt-3 border-t border-slate-800">
          <Field label="GST %" className="w-32">
            <select
              className={inputCls}
              value={invoice.gst}
              onChange={(e) => setInvoice({ ...invoice, gst: Number(e.target.value) })}
            >
              {GST_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g === 0 ? 'No GST' : `${g}%`}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-xs text-slate-300 pb-2.5">
            <input
              type="checkbox"
              checked={invoice.inclusive}
              onChange={(e) => setInvoice({ ...invoice, inclusive: e.target.checked })}
            />
            Price me GST pehle se shamil hai
          </label>
        </div>

        <div className="text-xs text-slate-300 space-y-1 text-right pt-2">
          <div>Total Value: <span className="text-white font-bold">{formatINR(totals.subtotal)}</span></div>
          {invoice.gst > 0 && (
            <>
              <div>CGST {half}%: <span className="text-white font-bold">{formatINR(totals.cgst)}</span></div>
              <div>SGST {half}%: <span className="text-white font-bold">{formatINR(totals.sgst)}</span></div>
            </>
          )}
          <div className="text-sm">Grand Total: <span className="text-amber-400 font-black">{formatINR(totals.grand)}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button
          type="button"
          onClick={handlePreview}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Shop details */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setShowShop(!showShop)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="text-sm font-bold text-white">Shop Details (ek baar bharo, har invoice me aayengi)</span>
          {showShop ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showShop && (
          <div className="p-4 pt-0 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHOP_FIELDS.map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    className={inputCls}
                    value={shop[key] || ''}
                    onChange={(e) =>
                      setShopField(
                        key,
                        key === 'gstin' || key === 'pan' ? e.target.value.toUpperCase() : e.target.value
                      )
                    }
                  />
                </Field>
              ))}
            </div>
            <Field label="Address">
              <textarea rows={2} className={inputCls} value={shop.address} onChange={(e) => setShopField('address', e.target.value)} />
            </Field>
            <Field label="Bank Details (optional)">
              <textarea rows={3} className={inputCls} value={shop.bankDetails} onChange={(e) => setShopField('bankDetails', e.target.value)} placeholder="Bank name, A/C no, IFSC, UPI..." />
            </Field>
            <Field label="Terms & Conditions (optional)">
              <textarea rows={3} className={inputCls} value={shop.terms} onChange={(e) => setShopField('terms', e.target.value)} />
            </Field>
            <button
              type="button"
              onClick={handleSaveShop}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Shop Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceGeneratorPage;