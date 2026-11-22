import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  UploadCloud, 
  ArrowDownRight, 
  ArrowUpRight, 
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FinnyMascot, useFinny } from '../components/finny';
import { TransactionDetailModal } from '../components/DashboardModals';
import FinancialTooltip from '../components/FinancialTooltip';

const CATEGORIES = [
  'All',
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Income',
  'Miscellaneous'
];

export default function Transactions({ onAddTx, onUploadCsv }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All'); // 'All' | 'expense' | 'income'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'month' | 'week' | 'today'
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'name_asc'

  // Selected Transaction for Detail / Edit Modal
  const [selectedTx, setSelectedTx] = useState(null);

  const { reactToPage } = useFinny();

  useEffect(() => {
    reactToPage('transactions');
  }, [reactToPage]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions();
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Safe transactions extraction
  const safeTxs = Array.isArray(transactions) ? transactions : (transactions?.transactions || []);

  // High-performance, real-time multi-field filtering
  const filteredTxs = safeTxs.filter(t => {
    // 1. Search Query filter (checks merchant, description, category, amount, type, date)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const desc = String(t.description || '').toLowerCase();
      const cat = String(t.category || '').toLowerCase();
      const type = String(t.type || '').toLowerCase();
      const amt = String(t.amount || '').toLowerCase();
      const date = String(t.date || '').toLowerCase();
      const matches = desc.includes(q) || cat.includes(q) || type.includes(q) || amt.includes(q) || date.includes(q);
      if (!matches) return false;
    }

    // 2. Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      if (String(t.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // 3. Transaction Type filter ('All' | 'expense' | 'income')
    if (selectedType && selectedType !== 'All') {
      if (String(t.type || '').toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
    }

    // 4. Date filter
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      if (t.date !== today) return false;
    } else if (dateFilter === 'week') {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      if (new Date(t.date) < weekAgo) return false;
    } else if (dateFilter === 'month') {
      const currMonth = new Date().toISOString().slice(0, 7);
      if (!String(t.date || '').startsWith(currMonth)) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedTxs = [...filteredTxs].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount_desc') return (b.amount || 0) - (a.amount || 0);
    if (sortBy === 'amount_asc') return (a.amount || 0) - (b.amount || 0);
    if (sortBy === 'name_asc') return (a.description || '').localeCompare(b.description || '');
    return 0;
  });

  const totalInflow = sortedTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalOutflow = sortedTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const netImpact = totalInflow - totalOutflow;

  return (
    <div className="p-6 sm:p-8 space-y-7 max-w-7xl mx-auto">
      
      {/* ================= TELEMETRY STATS BAR ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div 
          onClick={() => setSelectedType(selectedType === 'income' ? 'All' : 'income')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedType === 'income'
              ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
              : 'bg-[#060c18]/90 border-emerald-500/25 hover:border-emerald-400/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="uppercase text-[10px] font-bold text-emerald-400">Total Filtered Inflow</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            +₹{totalInflow.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">Click to filter only income</span>
        </div>

        <div 
          onClick={() => setSelectedType(selectedType === 'expense' ? 'All' : 'expense')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedType === 'expense'
              ? 'bg-rose-950/40 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              : 'bg-[#060c18]/90 border-rose-500/25 hover:border-rose-400/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="uppercase text-[10px] font-bold text-rose-400">Total Filtered Outflow</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            -₹{totalOutflow.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">Click to filter only expenses</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#060c18]/90 border border-cyan-500/25">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="uppercase text-[10px] font-bold text-cyan-400">Net Ledger Balance</span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-2xl font-black ${netImpact >= 0 ? 'text-cyan-300' : 'text-amber-400'}`}>
            ₹{netImpact.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">{sortedTxs.length} matching transactions</span>
        </div>
      </div>

      {/* ================= CONTROLS & FILTER BAR ================= */}
      <div className="glass-panel-glow hud-corner p-5 sm:p-6 rounded-3xl border border-cyan-500/30 space-y-4 bg-gradient-to-r from-[#071329]/95 via-[#050c1b] to-[#040814]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by merchant, note, amount, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-[#040814] border border-cyan-500/30 focus:border-cyan-400 rounded-2xl text-slate-100 placeholder:text-slate-500 outline-none transition-all font-mono"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 p-0.5 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={onUploadCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:text-white rounded-xl transition-all font-mono cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Upload Documents</span>
            </button>
            <button
              onClick={onAddTx}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all font-mono cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Filter Bar Row: Type / Date Range / Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cyan-500/15 text-xs font-mono">
          
          {/* Type Segmented Controller */}
          <div className="flex items-center gap-1 bg-[#040915] p-1 rounded-xl border border-cyan-500/20">
            {[
              { id: 'All', label: 'All Types' },
              { id: 'expense', label: 'Expenses' },
              { id: 'income', label: 'Incomes' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  selectedType === t.id
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Date Range Presets */}
          <div className="flex items-center gap-1 bg-[#040915] p-1 rounded-xl border border-cyan-500/20">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'month', label: 'This Month' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'today', label: 'Today' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDateFilter(d.id)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  dateFilter === d.id
                    ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-[#040915] border border-cyan-500/30 rounded-xl text-slate-200 outline-none focus:border-cyan-400 font-mono text-xs cursor-pointer"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="name_asc">Description: A to Z</option>
            </select>
          </div>
        </div>

        {/* Clickable Quick Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono pt-1">
          <span className="text-slate-400 text-[11px] uppercase mr-1 hidden sm:inline">Category:</span>
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap cursor-pointer text-[11px] ${
                  isActive
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-xs font-bold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TRANSACTIONS DATA TABLE ================= */}
      <div className="glass-panel hud-corner rounded-3xl border border-cyan-500/25 overflow-hidden bg-[#060e1d]/90 shadow-2xl">
        <div className="px-6 py-4 border-b border-cyan-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#081224]/70">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Financial Ledger Records
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {sortedTxs.length} Entries
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Click any transaction row to inspect details, modify category, or delete
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <FinancialTooltip term="python_verified">Python Math Grounded</FinancialTooltip>
          </span>
        </div>

        {sortedTxs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#040814] text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-cyan-500/15 font-mono">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {sortedTxs.map((tx) => (
                  <tr 
                    key={tx.transaction_id || tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-cyan-500/10 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {tx.description}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase font-mono ${
                        tx.type === 'income' 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-3.5 text-right font-black font-mono ${
                      tx.type === 'income' ? 'text-emerald-400 glow-text-cyan' : 'text-slate-100'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 cursor-pointer"
                        title="Edit transaction"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3 font-mono">
            <Receipt className="w-10 h-10 text-cyan-400/40 mx-auto" />
            <p className="text-white text-base font-bold">No transactions found</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
              No ledger entries match the current filter criteria ({selectedCategory}, {selectedType}, {dateFilter}). Try adjusting your filters or record a new transaction.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedType('All');
                  setDateFilter('all');
                  setSearch('');
                }}
                className="px-3.5 py-2 text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/25 cursor-pointer font-mono"
              >
                Reset Filters
              </button>
              <button
                onClick={onAddTx}
                className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-xl shadow-md cursor-pointer font-mono"
              >
                + Add Transaction
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= INTERACTIVE DETAIL & EDIT MODAL ================= */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onUpdated={loadTransactions}
          onDeleted={loadTransactions}
          apiInstance={api}
        />
      )}
    </div>
  );
}
