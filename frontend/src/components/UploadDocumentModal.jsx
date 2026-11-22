import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Trash2, 
  ArrowRight, 
  SlidersHorizontal,
  Info,
  Calendar,
  Layers,
  Camera,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Income',
  'Miscellaneous'
];

export default function UploadDocumentModal({ isOpen, onClose, onSuccess }) {
  // Stages: 'upload' -> 'processing' -> 'review' -> 'success'
  const [stage, setStage] = useState('upload');
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extracted data state
  const [extractedData, setExtractedData] = useState(null);
  const [extractedTransactions, setExtractedTransactions] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStage('upload');
    setStagedFiles([]);
    setExtractedData(null);
    setExtractedTransactions([]);
    setSelectedIndices(new Set());
    setError(null);
    setLoading(false);
    onClose();
  };

  const getFormatIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'bmp', 'tiff', 'tif'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-sky-400" />;
    }
    if (['csv', 'xls', 'xlsx', 'xlsm', 'ods'].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return <FileText className="w-5 h-5 text-cyan-400" />;
    }
    if (['json', 'xml'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-amber-400" />;
    }
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addFiles = (files) => {
    setError(null);
    const newFiles = Array.from(files);
    
    // Validate size (< 25MB each)
    for (let f of newFiles) {
      if (f.size > 25 * 1024 * 1024) {
        setError(`File '${f.name}' exceeds the 25MB size limit.`);
        return;
      }
    }

    setStagedFiles(prev => {
      const existingNames = new Set(prev.map(p => p.name));
      const filtered = newFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  };

  const removeFile = (idx) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // STEP 1: Process and Extract Documents with Backend AI & Parsers
  const handleProcessDocuments = async () => {
    if (stagedFiles.length === 0) {
      setError('Please select at least one financial document or spreadsheet to upload.');
      return;
    }

    setLoading(true);
    setStage('processing');
    setError(null);

    try {
      const res = await api.parseFinancialDocuments(stagedFiles);
      setExtractedData(res);
      const txs = res.transactions || [];
      setExtractedTransactions(txs);
      
      // Auto-select all non-duplicate transactions by default
      const initialSelected = new Set();
      txs.forEach((t, i) => {
        if (!t.is_duplicate) initialSelected.add(i);
      });
      // If all are flagged as duplicates, select all anyway so user can override
      if (initialSelected.size === 0 && txs.length > 0) {
        txs.forEach((_, i) => initialSelected.add(i));
      }
      setSelectedIndices(initialSelected);
      setStage('review');
    } catch (err) {
      setError(err.message || 'Failed to extract transactions from the provided documents.');
      setStage('upload');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection
  const toggleSelect = (idx) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === extractedTransactions.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(extractedTransactions.map((_, i) => i)));
    }
  };

  // Inline editing of extracted rows
  const handleUpdateTx = (idx, field, value) => {
    setExtractedTransactions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleDeleteRow = (idx) => {
    setExtractedTransactions(prev => prev.filter((_, i) => i !== idx));
    const next = new Set();
    selectedIndices.forEach(i => {
      if (i < idx) next.add(i);
      else if (i > idx) next.add(i - 1);
    });
    setSelectedIndices(next);
  };

  const handleAddManualRow = () => {
    const newTx = {
      date: new Date().toISOString().split('T')[0],
      description: 'Transaction',
      category: 'Miscellaneous',
      type: 'expense',
      amount: 100,
      is_duplicate: false
    };
    setExtractedTransactions(prev => {
      const nextList = [...prev, newTx];
      setSelectedIndices(sel => new Set([...sel, nextList.length - 1]));
      return nextList;
    });
  };

  const handleLoadSampleStatement = () => {
    const today = new Date().toISOString().split('T')[0];
    const samples = [
      { date: today, description: 'Monthly Salary Direct Credit', category: 'Income', type: 'income', amount: 75000, is_duplicate: false },
      { date: today, description: 'Swiggy Delivery Order', category: 'Food & Dining', type: 'expense', amount: 480, is_duplicate: false },
      { date: today, description: 'Uber Ride Bangalore', category: 'Transportation', type: 'expense', amount: 320, is_duplicate: false },
      { date: today, description: 'Rent Payment to Landlord', category: 'Bills & Utilities', type: 'expense', amount: 20000, is_duplicate: false }
    ];
    setExtractedTransactions(samples);
    setSelectedIndices(new Set(samples.map((_, i) => i)));
  };

  // STEP 2: Confirm and Import Verified Transactions into Ledger
  const handleConfirmImport = async () => {
    const toImport = extractedTransactions.filter((_, i) => selectedIndices.has(i));
    if (toImport.length === 0) {
      setError('Please select at least one transaction to import.');
      return;
    }

    setLoading(true);
    try {
      await api.confirmImportTransactions(toImport);
      setStage('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to import verified transactions.');
    } finally {
      setLoading(false);
    }
  };

  // Summary calculation for selected items
  const safeExtracted = Array.isArray(extractedTransactions) ? extractedTransactions : [];
  const selectedTxs = safeExtracted.filter((_, i) => selectedIndices.has(i));
  const selectedInflow = selectedTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const selectedOutflow = selectedTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div className={`bg-[#071329]/95 rounded-3xl w-full border border-cyan-500/35 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden relative hud-corner transition-all duration-300 ${
        stage === 'review' ? 'max-w-5xl' : 'max-w-2xl'
      }`}>
        {/* Top Glow Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 shadow-[0_0_15px_#38bdf8]"></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-cyan-500/15 flex items-center justify-between bg-[#050c1b]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  Upload Financial Documents
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  AI OCR & PARSER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Bank statements, receipts, invoices, spreadsheets, Word documents, & structured exports
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* ================= STAGE 1: UPLOAD & STAGE ================= */}
        {stage === 'upload' && (
          <div className="p-6 space-y-5">
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all relative overflow-hidden group ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]' 
                  : 'border-cyan-500/30 bg-[#040916]/80 hover:border-cyan-400/60 hover:bg-[#050f24]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.xlsm,.ods,.csv,.rtf,.txt,.json,.xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                }}
              />

              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base">
                    Drag and drop your financial files here, or <span className="text-cyan-400 underline decoration-cyan-400/50">Browse Files</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Upload multiple files simultaneously · Photos from mobile supported
                  </p>
                </div>
              </div>
            </div>

            {/* Supported Formats Pill Grid */}
            <div className="p-4 rounded-2xl bg-[#040916]/60 border border-cyan-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supported Multi-Format Financial Inputs:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-cyan-500/15">
                  <span className="text-sky-400 font-bold block">Images & Photos</span>
                  <span className="text-slate-400 text-[10px]">JPG, PNG, WEBP, HEIC, BMP, TIFF</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-cyan-500/15">
                  <span className="text-cyan-400 font-bold block">Documents</span>
                  <span className="text-slate-400 text-[10px]">PDF, DOCX, DOC, TXT, RTF</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-cyan-500/15">
                  <span className="text-emerald-400 font-bold block">Spreadsheets</span>
                  <span className="text-slate-400 text-[10px]">CSV, XLSX, XLS, XLSM, ODS</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-cyan-500/15">
                  <span className="text-amber-400 font-bold block">Structured Data</span>
                  <span className="text-slate-400 text-[10px]">JSON, OFX/QFX, XML</span>
                </div>
              </div>
            </div>

            {/* Staged File List */}
            {stagedFiles.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span>Selected Documents ({stagedFiles.length}):</span>
                  <button 
                    onClick={() => setStagedFiles([])}
                    className="text-rose-400 hover:underline text-[11px]"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stagedFiles.map((file, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-[#040916] border border-cyan-500/20 flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getFormatIcon(file.name)}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{file.name}</p>
                          <span className="text-[10px] text-slate-400">
                            {formatFileSize(file.size)} · {file.name.split('.').pop().toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={stagedFiles.length === 0 || loading}
                onClick={handleProcessDocuments}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:opacity-95 disabled:opacity-50 text-black font-extrabold text-xs font-mono rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze & Extract Transactions</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: PROCESSING / SCANNING ================= */}
        {stage === 'processing' && (
          <div className="p-16 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
              <div className="absolute inset-0 rounded-full blur-lg bg-cyan-500/25"></div>
            </div>
            <div className="space-y-1.5 font-mono">
              <h4 className="text-base font-extrabold text-white glow-text-cyan">
                AI Financial Document Processing in Progress...
              </h4>
              <p className="text-xs text-slate-400">
                Parsing document tables, running PyMuPDF OCR & extracting transactions
              </p>
              <p className="text-[11px] text-cyan-400/80">
                Vectorizing merchant names & auto-categorizing with Scikit-Learn
              </p>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: REVIEW & TWO-STEP VERIFICATION ================= */}
        {stage === 'review' && (
          <div className="p-6 space-y-5">
            {/* Extraction Telemetry Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-[#040916] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Detected</span>
                <span className="text-xl font-black text-white glow-text-cyan">
                  {extractedTransactions.length} <span className="text-xs font-normal text-slate-400">records</span>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#040916] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Selected Inflow</span>
                <span className="text-xl font-black text-emerald-400 glow-text-cyan">
                  +₹{Number(selectedInflow || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#040916] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-rose-400 block">Selected Outflow</span>
                <span className="text-xl font-black text-rose-400">
                  -₹{Number(selectedOutflow || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#040916] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-cyan-300 block">Net Balance Shift</span>
                <span className={`text-xl font-black ${(Number(selectedInflow || 0) >= Number(selectedOutflow || 0)) ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(Number(selectedInflow || 0) >= Number(selectedOutflow || 0)) ? '+' : '-'}₹{Math.abs(Number(selectedInflow || 0) - Number(selectedOutflow || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Empty State Banner when 0 records found */}
            {extractedTransactions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#040916]/90 border border-cyan-500/25 text-center space-y-4 font-mono shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-xl mx-auto">
                  <h4 className="text-white font-extrabold text-base">
                    0 Financial Transactions Detected in Document
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The uploaded document does not contain structured financial records (date + transaction amount). If this is a general document, webpage printout, login screen, or unformatted text, our AI parser safely found 0 ledger rows.
                  </p>
                  <p className="text-[11px] text-cyan-400">
                    You can add transaction rows manually, test with our verified sample statement, or upload a bank statement PDF/CSV.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleAddManualRow}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-sky-500 hover:opacity-95 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Transaction Row</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleStatement}
                    className="px-5 py-2.5 bg-[#051126] hover:bg-[#07193b] text-cyan-300 border border-cyan-500/40 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Load Sample Statement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('upload')}
                    className="px-4 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all"
                  >
                    ← Upload Different File
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Verification Notice */}
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/25 flex flex-wrap items-center justify-between gap-2 text-xs text-cyan-300 font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Review extracted data. You can edit dates, descriptions, categories, or deselect duplicates before importing.</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={handleAddManualRow}
                      className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Add Row</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-[11px] font-bold text-cyan-400 hover:underline shrink-0"
                    >
                      {selectedIndices.size === extractedTransactions.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                {/* Extracted Transactions Review Table */}
                <div className="border border-cyan-500/20 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#040916] text-slate-400 uppercase text-[10px] tracking-wider border-b border-cyan-500/20 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-10">
                          <input 
                            type="checkbox" 
                            checked={selectedIndices.size === extractedTransactions.length && extractedTransactions.length > 0}
                            onChange={toggleSelectAll}
                            className="w-3.5 h-3.5 rounded border-cyan-500/40 bg-[#040a16] text-cyan-400 cursor-pointer accent-cyan-400"
                          />
                        </th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Merchant / Description</th>
                        <th className="py-2.5 px-3">Category (ML)</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                        <th className="py-2.5 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-500/10 bg-[#071329]/60">
                      {extractedTransactions.map((tx, idx) => {
                        const isSelected = selectedIndices.has(idx);
                        return (
                          <tr 
                            key={idx}
                            className={`transition-colors ${isSelected ? 'hover:bg-cyan-500/10' : 'opacity-40 hover:opacity-60 bg-black/20'}`}
                          >
                            <td className="py-2.5 px-3">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => toggleSelect(idx)}
                                className="w-3.5 h-3.5 rounded border-cyan-500/40 bg-[#040a16] text-cyan-400 cursor-pointer accent-cyan-400"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="date"
                                value={tx.date}
                                onChange={(e) => handleUpdateTx(idx, 'date', e.target.value)}
                                className="bg-transparent border border-cyan-500/20 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={tx.description}
                                onChange={(e) => handleUpdateTx(idx, 'description', e.target.value)}
                                className="w-full bg-transparent border border-cyan-500/20 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                              />
                              {tx.is_duplicate && (
                                <span className="text-[10px] text-amber-300 block mt-0.5" title={tx.duplicate_reason}>
                                  ⚠️ {tx.duplicate_reason || 'Potential duplicate'}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <select
                                value={tx.category}
                                onChange={(e) => handleUpdateTx(idx, 'category', e.target.value)}
                                className="bg-[#040a16] border border-cyan-500/20 rounded px-2 py-0.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                              >
                                {CATEGORIES.map(c => (
                                  <option key={c} value={c} className="bg-[#040a16] text-white">{c}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={() => handleUpdateTx(idx, 'type', tx.type === 'income' ? 'expense' : 'income')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                  tx.type === 'income' 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {tx.type}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={tx.amount}
                                onChange={(e) => handleUpdateTx(idx, 'amount', parseFloat(e.target.value) || 0)}
                                className="w-24 bg-transparent border border-cyan-500/20 rounded px-1.5 py-0.5 text-xs text-right font-bold text-white focus:outline-none focus:border-cyan-400"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(idx)}
                                className="text-slate-500 hover:text-rose-400 transition-colors"
                                title="Remove transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Review Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 font-mono">
              <button
                type="button"
                onClick={() => setStage('upload')}
                className="text-xs text-cyan-400 hover:underline"
              >
                ← Upload additional files
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                {extractedTransactions.length > 0 && (
                  <button
                    type="button"
                    disabled={selectedIndices.size === 0 || loading}
                    onClick={handleConfirmImport}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:opacity-95 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Confirm & Import ({selectedIndices.size} Verified)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 4: SUCCESS ================= */}
        {stage === 'success' && (
          <div className="p-16 text-center space-y-3 font-mono">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.35)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Financial Documents Successfully Imported!</h4>
            <p className="text-xs text-slate-400">
              Your ledger, balances, budgets, charts, and AI insights have been dynamically recalculated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
