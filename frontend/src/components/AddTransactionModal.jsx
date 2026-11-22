import React, { useState } from 'react';
import { X, Sparkles, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'Auto (AI Categorized)',
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Bills & Utilities',
  'Savings',
  'Income',
  'Miscellaneous'
];

export default function AddTransactionModal({ isOpen, onClose, onSuccess, initialDate = null }) {
  const [formData, setFormData] = useState({
    amount: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    description: '',
    category: 'Auto (AI Categorized)',
    type: 'expense',
    is_recurring: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (initialDate && isOpen) {
      setFormData(prev => ({ ...prev, date: initialDate }));
    }
  }, [initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a transaction description.');
      return;
    }

    setLoading(true);
    try {
      const catPayload = formData.category.startsWith('Auto') ? 'Auto' : formData.category;
      await api.createTransaction({
        amount: amt,
        date: formData.date,
        description: formData.description,
        category: catPayload,
        type: formData.type,
        is_recurring: formData.is_recurring ? 1 : 0
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-2xl max-w-md w-full border border-cyan-500/30 overflow-hidden shadow-2xl relative max-h-[92dvh] sm:max-h-[85vh] flex flex-col">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-cyan-500/15 flex items-center justify-between bg-[#081224]/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">New Transaction</h3>
              </div>
              <p className="text-xs text-slate-400">Auto-categorized by FinAgent Machine Learning</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(90dvh-120px)]">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#060c18] border border-cyan-500/20 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                formData.type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                formData.type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-cyan-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-sm glass-input rounded-lg"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant / Description</label>
            <input
              type="text"
              placeholder="e.g. Swiggy Biryani, Uber to office, Amazon"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg"
              required
            />
          </div>

          {/* Category */}
          <div>
            <div className="mb-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
            </div>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg bg-[#081224]"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-[#081224] text-slate-100">{cat}</option>
              ))}
            </select>
          </div>

          {/* Date & Recurring */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm glass-input rounded-lg"
                required
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.is_recurring === 1}
                  onChange={e => setFormData({ ...formData, is_recurring: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded text-cyan-500 bg-[#081224] border-cyan-500/40 focus:ring-cyan-500"
                />
                <span>Recurring Monthly</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-xl hover:opacity-95 disabled:opacity-50 shadow-md shadow-cyan-500/20 transition-all font-mono tracking-wide"
            >
              {loading ? 'Processing...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
