import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Download, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function UploadCsvModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadCSV(file);
      setResult(data);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = "Date,Description,Amount,Type,Category\n" +
      "2026-11-01,Monthly Salary Credit,45000,income,Income\n" +
      "2026-11-03,Swiggy Lunch Order,340,expense,Auto\n" +
      "2026-11-05,Uber ride to office,260,expense,Auto\n" +
      "2026-11-08,Electricity Bill BESCOM,2150,expense,Auto\n" +
      "2026-11-12,Amazon headphone purchase,2499,expense,Auto\n" +
      "2026-11-15,Apollo Pharmacy medicines,680,expense,Auto\n";

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "finagent_sample_bank_statement.csv";
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-2xl max-w-lg w-full border border-cyan-500/30 overflow-hidden shadow-2xl relative max-h-[92dvh] sm:max-h-none overflow-y-auto">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/15 flex items-center justify-between bg-[#081224]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Import Bank Statement</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  CSV Parser
                </span>
              </div>
              <p className="text-xs text-slate-400">Auto-cleans, standardizes & categorizes with ML</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <h4 className="font-bold text-sm text-white">CSV Statement Successfully Imported!</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-[#050c18] p-3 rounded-xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Imported</span>
                  <span className="text-lg font-bold text-white">{result.imported_count} records</span>
                </div>
                <div className="bg-[#050c18] p-3 rounded-xl border border-cyan-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">ML Categorized</span>
                  <span className="text-lg font-bold text-cyan-400 glow-text-cyan">{result.auto_categorized_with_ml} records</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-2 py-2.5 text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all font-mono"
              >
                Done & View Transactions
              </button>
            </div>
          ) : (
            <>
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-6 text-center hover:border-cyan-400 transition-colors bg-[#060e1d]/60">
                <FileSpreadsheet className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-cyber-pulse" />
                <p className="text-xs font-semibold text-white mb-1">
                  {file ? file.name : "Select or drag your bank statement CSV"}
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Supported: HDFC, ICICI, SBI, Axis, or generic Date/Desc/Amount CSV
                </p>
                <label className="inline-block px-4 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors">
                  Choose File
                  <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Sample Template Download */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#060c18] border border-cyan-500/20 text-xs text-slate-300">
                <span className="text-[11px]">Need a sample bank statement to test?</span>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="flex items-center gap-1 text-cyan-400 font-bold hover:underline"
                >
                  <Download className="w-3.5 h-3.5" /> Sample CSV
                </button>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="flex-1 py-2.5 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-xl hover:opacity-95 disabled:opacity-50 shadow-md shadow-cyan-500/20 transition-all font-mono tracking-wide"
                >
                  {loading ? 'Categorizing with ML...' : 'Upload & Categorize'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
