import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import api from '../../services/api';

const AdminBulkUploadPage = () => {
  const [csvText, setCsvText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample CSV template content
  const sampleCsvContent = `name,sku,categorySlug,subcategory,brand,regularPrice,discountPrice,stockQuantity,imageUrl,description
Asian Paints Tractor Emulsion 4L,AP-TRAC-4L,paints,Interior Paints,Asian Paints,850,780,30,https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800,Economy interior emulsion with high coverage
Jaquar Pillar Tap Chrome,JAQ-PIL-001,sanitary,Bathroom Taps,Jaquar,950,850,25,https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800,Solid brass chrome plated pillar tap
Berger Walmasta Exterior 10L,BRG-WAL-10L,paints,Exterior Paints,Berger,2600,2350,15,https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800,100% acrylic water-based exterior paint
Cera Half Pedestal Basin,CERA-PED-002,sanitary,Wash Basins,Cera,2400,2100,8,https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800,Vitreous ceramic space saving basin`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target.result);
    };
    reader.readAsText(file);
  };

  const parseAndSubmitCSV = async () => {
    setErrorMsg('');
    setResult(null);

    if (!csvText.trim()) {
      setErrorMsg('Please paste or upload CSV text first.');
      return;
    }

    try {
      const lines = csvText.trim().split(/\r\n|\n/);
      if (lines.length < 2) {
        setErrorMsg('CSV must have a header row and at least one product row.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const products = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        products.push(rowObj);
      }

      setUploading(true);
      const res = await api.post('/admin/products/bulk-upload', { products });
      setUploading(false);

      if (res.data?.success) {
        setResult(res.data.summary);
      }
    } catch (err) {
      setUploading(false);
      setErrorMsg(err.response?.data?.message || err.message || 'Bulk upload failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Bulk CSV Product Import</h1>
          <p className="text-xs text-slate-400">Import thousands of paint tins and plumbing SKUs at once from Excel/CSV.</p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/20 border border-rose-500 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Summary */}
      {result && (
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Import Completed: {result.importedCount} Products Added to Inventory!</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Rows</span>
              <span className="font-extrabold text-white text-base">{result.totalRows}</span>
            </div>
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-emerald-300">
              <span className="block text-[10px] uppercase font-bold">Imported</span>
              <span className="font-extrabold text-base">{result.importedCount}</span>
            </div>
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300">
              <span className="block text-[10px] uppercase font-bold">Failed</span>
              <span className="font-extrabold text-base">{result.failedRows.length}</span>
            </div>
          </div>

          {result.failedRows.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Failed Rows Audit Log:</span>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {result.failedRows.map((f, i) => (
                  <div key={i} className="p-2 bg-slate-900 rounded-lg text-[11px] text-slate-300 flex justify-between">
                    <span>Row #{f.row} [SKU: {f.sku}]</span>
                    <span className="text-rose-400">{f.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Upload Box */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Upload File Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Upload CSV File from Computer
          </label>
          <input
            type="file"
            accept=".csv, text/csv"
            onChange={handleFileUpload}
            className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
          />
        </div>

        {/* Or Paste CSV Direct */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Or Paste CSV Data Directly
            </label>
            <button
              type="button"
              onClick={() => setCsvText(sampleCsvContent)}
              className="text-[11px] font-bold text-amber-400 hover:underline"
            >
              Paste Demo Sample Data
            </button>
          </div>
          <textarea
            rows={10}
            placeholder="name,sku,categorySlug,subcategory,brand,regularPrice,discountPrice,stockQuantity,imageUrl,description"
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
          ></textarea>
        </div>

        <button
          onClick={parseAndSubmitCSV}
          disabled={uploading}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] disabled:opacity-50"
        >
          {uploading ? (
            <span>Validating & Importing Rows...</span>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Validate & Import CSV Products</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};

export default AdminBulkUploadPage;
