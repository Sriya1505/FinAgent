import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  PiggyBank, 
  Receipt, 
  Layers, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { FinnyMascot } from './finny';

/**
 * Balance Breakdown & History Modal
 */
export function BalanceHistoryModal({ data, onClose, onNavigate }) {
  if (!data) return null;
  const balance = data.current_balance || 0;
  const income = data.monthly_income || 0;
  const expense = data.monthly_expense || 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 border border-cyan-500/35 space-y-5 bg-[#091325]/95 shadow-2xl relative max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Current Balance Telemetry</h3>
              <p className="text-xs text-slate-400 font-mono">Python-verified lifetime net funds</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#040814] border border-cyan-500/25 space-y-2 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Verified Liquid Balance
          </span>
          <div className="text-4xl font-black bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent font-mono glow-text-cyan">
            ₹{Number(balance || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-400 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Deterministic Python Calculation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase block font-semibold">Monthly Inflow</span>
            <span className="text-lg font-extrabold text-emerald-400">+₹{Number(income || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase block font-semibold">Monthly Outflow</span>
            <span className="text-lg font-extrabold text-rose-400">-₹{Number(expense || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-3">
          <FinnyMascot state={balance >= 0 ? 'happy' : 'concerned'} size="xs" interactive={true} />
          <p className="text-xs text-purple-200 leading-snug">
            {balance >= 0 
              ? "Your net cash position is positive! Keeping positive lifetime equity builds compound wealth."
              : "Warning: Your recorded expenses currently exceed income. Let's adjust monthly budgets to restore surplus!"}
          </p>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('transactions');
            }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs rounded-xl font-mono cursor-pointer"
          >
            Inspect Ledger History →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Monthly Inflow / Income Transactions Modal
 */
export function InflowDetailsModal({ transactions = [], onClose, onNavigate }) {
  const safeTxs = Array.isArray(transactions) ? transactions : (transactions?.transactions || []);
  const incomeTxs = safeTxs.filter(t => t.type === 'income');
  const totalIncome = incomeTxs.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 border border-emerald-500/35 space-y-4 bg-[#091325]/95 shadow-2xl relative max-h-[92dvh] sm:max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Inflow Breakdown</h3>
              <p className="text-xs text-slate-400 font-mono">
                Total Credited: <strong className="text-emerald-400">+₹{Number(totalIncome || 0).toLocaleString('en-IN')}</strong> ({incomeTxs.length} items)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {incomeTxs.length > 0 ? (
            incomeTxs.map((tx) => (
              <div 
                key={tx.transaction_id || tx.id}
                className="p-3.5 rounded-2xl bg-[#040814] border border-emerald-500/20 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <p className="font-bold text-white text-[13px]">{tx.description}</p>
                  <span className="text-[10px] text-slate-400">{tx.date} · {tx.category}</span>
                </div>
                <span className="text-sm font-black text-emerald-400">
                  +₹{(tx.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-xs text-slate-400 font-mono space-y-2">
              <p>No income records logged for this period.</p>
              <p className="text-[11px] text-slate-500">Log salary or deposits with "+ Add Transaction".</p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center shrink-0">
          <span className="text-[11px] font-mono text-slate-400">Income Stream Intelligence</span>
          <button
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('transactions');
            }}
            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-xl text-xs font-mono font-bold"
          >
            Manage Transactions →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Monthly Outflow / Expenses Details Modal
 */
export function OutflowDetailsModal({ transactions = [], categories = [], onClose, onNavigate }) {
  const safeTxs = Array.isArray(transactions) ? transactions : (transactions?.transactions || []);
  const expenseTxs = safeTxs.filter(t => t.type === 'expense');
  const totalExpense = expenseTxs.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 border border-rose-500/35 space-y-4 bg-[#091325]/95 shadow-2xl relative max-h-[92dvh] sm:max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Outflow Breakdown</h3>
              <p className="text-xs text-slate-400 font-mono">
                Total Expenses: <strong className="text-rose-400">-₹{Number(totalExpense || 0).toLocaleString('en-IN')}</strong> ({expenseTxs.length} items)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {expenseTxs.length > 0 ? (
            expenseTxs.map((tx) => (
              <div 
                key={tx.transaction_id || tx.id}
                className="p-3.5 rounded-2xl bg-[#040814] border border-rose-500/20 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <p className="font-bold text-white text-[13px]">{tx.description}</p>
                  <span className="text-[10px] text-slate-400">{tx.date} · {tx.category}</span>
                </div>
                <span className="text-sm font-black text-rose-400">
                  -₹{(tx.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-xs text-slate-400 font-mono space-y-2">
              <p>No expenses recorded yet.</p>
              <p className="text-[11px] text-slate-500">Expenses logged will automatically populate category ratios.</p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-rose-500/20 flex justify-between items-center shrink-0">
          <span className="text-[11px] font-mono text-slate-400">Categorized via ML NLP Classifier</span>
          <button
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('budgets');
            }}
            className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:text-white rounded-xl text-xs font-mono font-bold"
          >
            Review Category Budgets →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Monthly Savings & Feasibility Breakdown Modal
 */
export function SavingsBreakdownModal({ data, onClose, onNavigate }) {
  if (!data) return null;
  const savings = data.monthly_savings || 0;
  const rate = data.savings_rate_pct || 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 border border-blue-500/35 space-y-5 bg-[#091325]/95 shadow-2xl relative max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Savings Trajectory</h3>
              <p className="text-xs text-slate-400 font-mono">Net surplus retained from income</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#040814] border border-blue-500/25 space-y-2 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Current Month Net Savings
          </span>
          <div className="text-4xl font-black text-blue-400 font-mono">
            ₹{Number(savings || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-bold border border-blue-500/30">
              {rate}% Savings Rate
            </span>
            <span className="text-slate-400">Benchmark: 20%+</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-3">
          <FinnyMascot state={rate >= 20 ? 'celebrating' : rate > 0 ? 'happy' : 'concerned'} size="xs" interactive={true} />
          <p className="text-xs text-purple-200 leading-snug">
            {rate >= 20 
              ? "Incredible work! You are exceeding the recommended 20% savings threshold."
              : rate > 0 
              ? "You have a positive savings cushion! Trimming non-essential discretionary categories will boost your rate above 20%."
              : "No net savings this month yet. Check your Budgets and What-If simulator in AI Insights to plan your surplus."}
          </p>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('savings');
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl font-mono cursor-pointer"
          >
            Manage Savings Goals →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Monthly Cashflow Bar Inspector Modal (When clicking a month in the Cashflow chart)
 */
export function MonthCashflowDetailsModal({ monthData, onClose }) {
  if (!monthData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 border border-cyan-500/35 space-y-4 bg-[#091325]/95 shadow-2xl relative max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Month {monthData.month} Deep Dive</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex justify-between items-center">
            <span className="text-slate-400">Total Inflow (Income):</span>
            <span className="font-bold text-emerald-400">+₹{(monthData.income || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30 flex justify-between items-center">
            <span className="text-slate-400">Total Outflow (Expense):</span>
            <span className="font-bold text-rose-400">-₹{(monthData.expense || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#040814] border border-cyan-500/30 flex justify-between items-center">
            <span className="text-slate-300 font-bold">Net Monthly Savings:</span>
            <span className={`text-sm font-black ${monthData.savings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{(monthData.savings || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono font-bold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Interactive Single Transaction Details & Live Edit Modal
 */
export function TransactionDetailModal({ 
  transaction, 
  onClose, 
  onUpdated, 
  onDeleted,
  apiInstance 
}) {
  if (!transaction) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    description: transaction.description || '',
    amount: transaction.amount || 0,
    category: transaction.category || 'Miscellaneous',
    date: transaction.date || '',
    type: transaction.type || 'expense'
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (apiInstance && apiInstance.updateTransaction) {
        await apiInstance.updateTransaction(transaction.transaction_id, {
          description: form.description.trim(),
          amount: parseFloat(form.amount),
          category: form.category,
          date: form.date,
          type: form.type
        });
      }
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this transaction from your private ledger?')) {
      setLoading(true);
      try {
        if (apiInstance && apiInstance.deleteTransaction) {
          await apiInstance.deleteTransaction(transaction.transaction_id);
        }
        if (onDeleted) onDeleted();
        onClose();
      } catch (err) {
        alert(err.message || 'Failed to delete transaction');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 border border-cyan-500/35 space-y-4 bg-[#091325]/95 shadow-2xl relative max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Edit Transaction' : 'Transaction Details'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Date Logged:</span>
                <span className="text-slate-200">{transaction.date}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Type:</span>
                <span className={`uppercase font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {transaction.type}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Category:</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {transaction.category}
                </span>
              </div>
              <div className="pt-2 border-t border-cyan-500/15 flex justify-between items-center font-mono">
                <span className="text-xs text-slate-400">Amount:</span>
                <span className={`text-xl font-black ${transaction.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{(transaction.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                Description / Merchant
              </span>
              <p className="text-white font-medium">{transaction.description}</p>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/25 flex items-center gap-3">
              <FinnyMascot state="happy" size="xs" interactive={true} />
              <p className="text-xs text-purple-200">
                Finny categorized this transaction into <strong>{transaction.category}</strong> using the supervised TF-IDF engine.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Description / Merchant</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#040814] border border-cyan-500/30 text-white outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#040814] border border-cyan-500/30 text-white outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#040814] border border-cyan-500/30 text-white outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#040814] border border-cyan-500/30 text-white outline-none focus:border-cyan-400"
                >
                  {[
                    'Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities', 
                    'Entertainment', 'Healthcare', 'Education', 'Travel', 'Income', 'Miscellaneous'
                  ].map(c => <option key={c} value={c} className="bg-[#040814] text-white">{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#040814] border border-cyan-500/30 text-white outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="expense" className="bg-[#040814] text-white">Expense</option>
                  <option value="income" className="bg-[#040814] text-white">Income</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold font-mono"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
