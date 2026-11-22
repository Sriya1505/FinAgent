import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  UploadCloud, 
  Layers, 
  ChevronRight, 
  Calendar,
  ExternalLink,
  Receipt,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FinnyMascot, useFinny, CategoryTransactionsModal } from '../components/finny';
import FinancialTooltip from '../components/FinancialTooltip';
import { 
  BalanceHistoryModal, 
  InflowDetailsModal, 
  OutflowDetailsModal, 
  SavingsBreakdownModal, 
  MonthCashflowDetailsModal, 
  TransactionDetailModal 
} from '../components/DashboardModals';

export default function Dashboard({ onAddTx, onUploadCsv, onNavigate, onOpenCalendar }) {
  const [dataState, setDataState] = useState(() => api.handleOfflineFallback('/dashboard'));
  const data = dataState || api.handleOfflineFallback('/dashboard');
  const setData = setDataState;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Interactive Card Modal states
  const [activeCardModal, setActiveCardModal] = useState(null); // 'balance' | 'inflow' | 'outflow' | 'savings' | null
  const [inspectCategory, setInspectCategory] = useState(null);
  const [inspectMonth, setInspectMonth] = useState(null);
  const [inspectTx, setInspectTx] = useState(null);

  const { reactToFinancials, reactToPage } = useFinny();

  useEffect(() => {
    reactToPage('dashboard');
  }, [reactToPage]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [res, txRes] = await Promise.all([
        api.getDashboard().catch(() => api.handleOfflineFallback('/dashboard')),
        api.getTransactions().catch(() => ({ transactions: [] }))
      ]);
      const safeData = res || api.handleOfflineFallback('/dashboard');
      setData(safeData);
      setTransactions(txRes?.transactions || safeData?.recent_transactions || []);
      setError(null);
      if (safeData) {
        reactToFinancials({
          budgetUtilization: safeData.budget_utilization_pct || 0,
          completedGoalsCount: (safeData.savings_goals || []).filter(g => g.progress_pct >= 100).length,
          hasAnomalies: Boolean(safeData.recent_anomaly),
          transactionsCount: (txRes?.transactions || safeData?.recent_transactions || []).length
        });
      }
    } catch (err) {
      console.warn('Dashboard fetch warning, using local state:', err);
      const fallback = api.handleOfflineFallback('/dashboard');
      setData(fallback);
      setTransactions(fallback.recent_transactions || []);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20"></div>
          </div>
          <div className="text-center font-mono">
            <p className="text-xs font-bold text-cyan-400 glow-text-cyan tracking-wider uppercase">Loading Quantum Ledger...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Deterministic Python Math Syncing</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate highest spend category
  const categories = Object.entries(data.category_breakdown || {});
  const totalCatSpend = categories.reduce((acc, curr) => acc + curr[1], 0);
  const hasTransactions = (transactions && transactions.length > 0) || (data.recent_transactions && data.recent_transactions.length > 0);
  const hasTrends = data.monthly_trends && data.monthly_trends.length > 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto overflow-x-hidden">
      
      {error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Server sync paused. Displaying local quantum ledger telemetry.</span>
          </div>
          <button 
            onClick={fetchDashboard}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-200 transition-colors cursor-pointer min-h-[36px]"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 pb-2 border-b border-cyan-500/15">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 hover:text-white rounded-xl transition-all font-mono cursor-pointer shadow-xs"
              title="Inspect calendar & transactions by date"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calendar</span>
            </button>
          )}
          <button
            onClick={onUploadCsv}
            className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/40 hover:text-white transition-all font-mono cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload</span>
          </button>
          <button
            onClick={onAddTx}
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md shadow-cyan-500/30 transition-all font-mono cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Finny Mascot Real-Time Financial Companion Banner */}
      <div className="bg-[#081329]/90 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.5),0_0_30px_rgba(168,85,247,0.12)] flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative overflow-hidden hud-corner">
        <FinnyMascot
          state={
            (data.savings_goals || []).some(g => g.progress_pct >= 100) 
              ? 'celebrating' 
              : (data.budget_utilization_pct > 100 || data.recent_anomaly)
                ? 'concerned'
                : (hasTransactions ? 'happy' : 'idle')
          }
          size="lg"
          interactive={true}
        />
        <div className="flex-1 space-y-1.5 min-w-0 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
              Finny Financial Telemetry
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              (data.savings_goals || []).some(g => g.progress_pct >= 100)
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                : (data.budget_utilization_pct > 100 || data.recent_anomaly)
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
            }`}>
              {(data.savings_goals || []).some(g => g.progress_pct >= 100)
                ? 'Goal Achieved'
                : (data.budget_utilization_pct > 100)
                  ? 'Budget Warning'
                  : 'Healthy Flow'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
            {(data.savings_goals || []).some(g => g.progress_pct >= 100)
              ? "Woohoo! You reached your savings goal. I'm so proud of you!"
              : (data.budget_utilization_pct > 100)
                ? "Oops! Your spending is getting a little high. Let's review it together."
                : (data.recent_anomaly)
                  ? "I flagged an unusual expense on your ledger. Let's inspect it in AI Insights!"
                  : (hasTransactions 
                      ? "Hey! Let's see how your money is doing today! Everything is running smoothly." 
                      : "Welcome to FinAgent! Upload your bank statements or record an expense to begin.")}
          </p>
        </div>
      </div>

      {/* Anomaly Banner ONLY if an authentic anomaly exists */}
      {data.recent_anomaly && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start justify-between gap-3 shadow-lg shadow-amber-500/5 glass-panel">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <FinancialTooltip term="anomaly">Anomaly Detected</FinancialTooltip> ({data.recent_anomaly.severity} Severity)
                </span>
                <span className="text-xs text-amber-400/70 font-mono">{data.recent_anomaly.date}</span>
              </div>
              <h4 className="font-bold text-white text-sm mt-1">{data.recent_anomaly.description} – ₹{Number(data.recent_anomaly.amount || 0).toLocaleString('en-IN')}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{data.recent_anomaly.reason}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('insights')}
            className="text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-xl hover:bg-amber-500/30 transition-all shrink-0 font-mono cursor-pointer"
          >
            Review in AI Insights →
          </button>
        </div>
      )}

      {/* ================= 4 CORE FINANCIAL METRIC CARDS (FULLY EXPANDABLE & INTERACTIVE) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Balance Card */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveCardModal('balance')}
          className="glass-panel-glow hud-corner p-5 rounded-2xl relative overflow-hidden group border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1">
              <FinancialTooltip term="current_balance">Current Balance</FinancialTooltip>
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent glow-text-cyan relative z-10 font-mono">
            ₹{(data.current_balance || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-300 font-semibold relative z-10 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Balance</span>
            </span>
            <span className="text-slate-400 group-hover:text-cyan-300 flex items-center gap-0.5 text-[10px]">
              Inspect <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* Monthly Inflow Card */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveCardModal('inflow')}
          className="glass-panel-glow hud-corner p-5 rounded-2xl relative overflow-hidden group border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1">
              <FinancialTooltip term="inflow">Monthly Inflow</FinancialTooltip>
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 relative z-10 font-mono">
            +₹{(data.monthly_income || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium relative z-10 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Salary & Active Credits
            </span>
            <span className="text-slate-400 group-hover:text-emerald-300 flex items-center gap-0.5 text-[10px]">
              View All <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* Monthly Outflow Card */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveCardModal('outflow')}
          className="glass-panel-glow hud-corner p-5 rounded-2xl relative overflow-hidden group border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1">
              <FinancialTooltip term="outflow">Monthly Outflow</FinancialTooltip>
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 relative z-10 font-mono">
            -₹{(data.monthly_expense || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium relative z-10 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5 text-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {categories.length} Active Categories
            </span>
            <span className="text-slate-400 group-hover:text-rose-300 flex items-center gap-0.5 text-[10px]">
              Inspect <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* Monthly Savings Card */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveCardModal('savings')}
          className="glass-panel-glow hud-corner p-5 rounded-2xl relative overflow-hidden group border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center gap-1">
              <FinancialTooltip term="savings_rate">Monthly Savings</FinancialTooltip>
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white relative z-10 font-mono">
            ₹{(data.monthly_savings || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] relative z-10 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded font-bold bg-blue-500/20 border border-blue-500/30 text-cyan-300">
                {data.savings_rate_pct || 0}% Rate
              </span>
            </div>
            <span className="text-slate-400 group-hover:text-blue-300 flex items-center gap-0.5 text-[10px]">
              Goals <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* ================= BUDGET RUNWAY INTERACTIVE TELEMETRY ================= */}
      <div 
        onClick={() => onNavigate('budgets')}
        className="glass-panel-glow hud-corner p-6 rounded-3xl relative overflow-hidden border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer group bg-gradient-to-r from-[#071329]/90 to-[#040814]"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-cyan-500/15 text-cyan-300 rounded-full border border-cyan-500/30 font-mono uppercase tracking-wider">
                SMART RUNWAY TELEMETRY
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Days Remaining: <strong className="text-cyan-400">{data.days_left_in_month} days</strong>
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
              <span>Monthly Budget Utilization:</span>
              <span className="text-cyan-400 font-mono font-black">{data.budget_utilization_pct || 0}%</span>
              <span className="text-xs text-cyan-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                (Click to Manage Budgets →)
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              {data.total_budget > 0 ? (
                <>Safe spending pace: <strong className="text-emerald-400">₹{(data.safe_daily_allowance || 0).toLocaleString('en-IN')}/day</strong> for the rest of this month.</>
              ) : (
                <span className="text-slate-400">No monthly budgets created yet. Click here to assign category limits!</span>
              )}
            </p>
          </div>

          <div className="w-full md:w-80">
            <div className="flex justify-between text-xs font-mono font-semibold mb-1.5">
              <span className="text-slate-400">Spent: ₹{(data.monthly_expense || 0).toLocaleString('en-IN')}</span>
              <span className="text-cyan-300">Cap: ₹{(data.total_budget || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full h-3.5 bg-[#050b16] rounded-full overflow-hidden border border-cyan-500/30 p-0.5 shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                  (data.budget_utilization_pct || 0) > 100 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-rose-500/50' 
                    : (data.budget_utilization_pct || 0) > 80 
                    ? 'bg-gradient-to-r from-cyan-400 to-amber-400 shadow-amber-500/50' 
                    : 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-cyan-500/50'
                }`}
                style={{ width: `${Math.min(100, data.budget_utilization_pct || 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= INTERACTIVE CHARTS GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income vs Expenses Bar Chart with Clickable Months */}
        <div className="lg:col-span-2 glass-panel hud-corner p-6 rounded-3xl border border-cyan-500/25 flex flex-col justify-between bg-[#060e1d]/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Monthly Cashflow Trend</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  Click Column to Inspect
                </span>
              </div>
              <p className="text-xs text-slate-400">Income vs Expense Distribution</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-400 shadow-xs shadow-emerald-400/50"></span>
                <span className="text-slate-300 font-mono">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-400 shadow-xs shadow-rose-400/50"></span>
                <span className="text-slate-300 font-mono">Expenses</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart with Click Handlers */}
          {hasTrends ? (
            <div className="h-56 flex items-end gap-6 pt-6 pb-2 border-b border-cyan-500/15 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-cyan-500/20 w-full"></div>
                <div className="border-b border-cyan-500/20 w-full"></div>
                <div className="border-b border-cyan-500/20 w-full"></div>
              </div>

              {data.monthly_trends.map((item, idx) => {
                const maxVal = Math.max(...data.monthly_trends.flatMap(m => [m.income, m.expense]), 50000);
                const incHeight = Math.max(12, (item.income / maxVal) * 160);
                const expHeight = Math.max(12, (item.expense / maxVal) * 160);

                return (
                  <div 
                    key={idx} 
                    onClick={() => setInspectMonth(item)}
                    className="flex-1 flex flex-col items-center gap-2 group z-10 cursor-pointer"
                    title={`Click to inspect ${item.month} details`}
                  >
                    <div className="w-full flex items-end justify-center gap-2 h-44">
                      <div 
                        className="w-5 sm:w-6 bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 rounded-t-lg transition-all shadow-md shadow-emerald-500/20 group-hover:scale-105"
                        style={{ height: `${incHeight}px` }}
                      />
                      <div 
                        className="w-5 sm:w-6 bg-gradient-to-t from-rose-600 to-rose-400 hover:from-rose-500 hover:to-rose-300 rounded-t-lg transition-all shadow-md shadow-rose-500/20 group-hover:scale-105"
                        style={{ height: `${expHeight}px` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center border border-dashed border-cyan-500/20 rounded-2xl bg-[#060e1d]/40 p-6 text-center space-y-2">
              <TrendingUp className="w-8 h-8 text-cyan-400/50 mx-auto" />
              <p className="text-sm font-semibold text-white">No historical cashflow data yet</p>
              <p className="text-xs text-slate-400 max-w-sm">Add income or expenses to visualize monthly distributions and savings trends.</p>
              <button
                onClick={onAddTx}
                className="mt-2 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/25 transition-all font-mono cursor-pointer"
              >
                + Add Transaction
              </button>
            </div>
          )}

          <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400">
            <span>Average Monthly Savings: <strong className="text-white font-mono">₹{hasTrends ? Math.round(data.monthly_trends.reduce((acc, curr) => acc + curr.savings, 0) / data.monthly_trends.length).toLocaleString('en-IN') : '0'}</strong></span>
          </div>
        </div>

        {/* Category Breakdown with Clickable Category Slices */}
        <div className="glass-panel hud-corner p-6 rounded-3xl border border-cyan-500/25 flex flex-col bg-[#060e1d]/90">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Spending by Category
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Click to Filter
              </span>
            </h3>
            <p className="text-xs text-slate-400">Click any category bar to inspect transactions</p>
          </div>

          {categories.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {categories.slice(0, 6).map(([cat, amt], idx) => {
                const pct = totalCatSpend > 0 ? Math.round((amt / totalCatSpend) * 100) : 0;
                const gradients = [
                  'bg-gradient-to-r from-cyan-500 to-blue-500',
                  'bg-gradient-to-r from-blue-500 to-indigo-500',
                  'bg-gradient-to-r from-emerald-500 to-teal-400',
                  'bg-gradient-to-r from-amber-400 to-orange-500',
                  'bg-gradient-to-r from-rose-500 to-pink-500',
                  'bg-gradient-to-r from-purple-500 to-pink-500'
                ];
                const grad = gradients[idx % gradients.length];

                return (
                  <div 
                    key={cat} 
                    onClick={() => setInspectCategory(cat)}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer group"
                    title={`Click to inspect all ${cat} transactions`}
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                        <span>{cat}</span>
                        <ChevronRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="font-bold text-white font-mono">
                        ₹{Number(amt || 0).toLocaleString('en-IN')} <span className="text-cyan-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#050c18] rounded-full overflow-hidden border border-cyan-500/20">
                      <div className={`h-full rounded-full ${grad}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-2">
              <Layers className="w-8 h-8 text-cyan-400/40" />
              <p className="font-medium text-slate-300">No category spending recorded yet</p>
              <p className="text-[11px] text-slate-500">Categorized expenses will appear here automatically.</p>
            </div>
          )}

          <button
            onClick={() => onNavigate('budgets')}
            className="w-full mt-4 py-2.5 text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 rounded-xl hover:bg-cyan-500/20 transition-all font-mono cursor-pointer"
          >
            Manage Category Budgets →
          </button>
        </div>
      </div>

      {/* ================= RECENT TRANSACTIONS TABLE (CLICK ROW TO VIEW/EDIT) ================= */}
      <div className="glass-panel hud-corner rounded-3xl border border-cyan-500/25 overflow-hidden bg-[#060e1d]/90">
        <div className="p-6 border-b border-cyan-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#081224]/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Recent Transactions</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                Click Row to Edit / Inspect
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer flex items-center gap-1"
          >
            <span>View All ({transactions.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {hasTransactions ? (
          <div>
            {/* Mobile Stacked Cards View (< 640px) */}
            <div className="block sm:hidden divide-y divide-cyan-500/10">
              {(transactions.length > 0 ? transactions.slice(0, 6) : (data.recent_transactions || [])).map((tx) => (
                <div 
                  key={tx.transaction_id || tx.id} 
                  onClick={() => setInspectTx(tx)}
                  className="p-4 hover:bg-cyan-500/10 active:bg-cyan-500/20 transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-100 text-sm truncate">{tx.description}</span>
                    <span className={`font-bold font-mono text-sm shrink-0 ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-[11px]">
                      {tx.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        tx.type === 'income' 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        {tx.type}
                      </span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Full Table View (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#050c18] text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-cyan-500/15 font-mono">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {(transactions.length > 0 ? transactions.slice(0, 6) : (data.recent_transactions || [])).map((tx) => (
                    <tr 
                      key={tx.transaction_id || tx.id} 
                      onClick={() => setInspectTx(tx)}
                      className="hover:bg-cyan-500/10 transition-colors cursor-pointer group"
                      title="Click to view details or edit transaction"
                    >
                      <td className="px-6 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">{tx.date}</td>
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
                      <td className={`px-6 py-3.5 text-right font-bold font-mono ${
                        tx.type === 'income' ? 'text-emerald-400 glow-text-cyan' : 'text-slate-100'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <p className="text-white text-sm font-semibold">No transactions yet. Add your first transaction.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Record a purchase or upload your financial documents (PDF, Excel, Images, CSV) to populate your dashboard metrics and AI insights.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={onAddTx}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-xl hover:opacity-95 shadow-md shadow-cyan-500/20 font-mono cursor-pointer"
              >
                + Add First Transaction
              </button>
              <button
                onClick={onUploadCsv}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:text-white hover:border-cyan-500/30 transition-all font-mono cursor-pointer"
              >
                Upload Financial Documents
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS & EXPANDABLE PANELS ================= */}

      {/* 1. Current Balance Telemetry Modal */}
      {activeCardModal === 'balance' && (
        <BalanceHistoryModal
          data={data}
          onClose={() => setActiveCardModal(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* 2. Monthly Inflow Details Modal */}
      {activeCardModal === 'inflow' && (
        <InflowDetailsModal
          transactions={transactions}
          onClose={() => setActiveCardModal(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* 3. Monthly Outflow Details Modal */}
      {activeCardModal === 'outflow' && (
        <OutflowDetailsModal
          transactions={transactions}
          categories={categories}
          onClose={() => setActiveCardModal(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* 4. Monthly Savings & Feasibility Modal */}
      {activeCardModal === 'savings' && (
        <SavingsBreakdownModal
          data={data}
          onClose={() => setActiveCardModal(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* 5. Category Transactions Deep Dive Modal */}
      {inspectCategory && (
        <CategoryTransactionsModal
          category={inspectCategory}
          transactions={transactions}
          onClose={() => setInspectCategory(null)}
        />
      )}

      {/* 6. Month Cashflow Inspector Modal */}
      {inspectMonth && (
        <MonthCashflowDetailsModal
          monthData={inspectMonth}
          onClose={() => setInspectMonth(null)}
        />
      )}

      {/* 7. Single Transaction Detail & Live Edit Modal */}
      {inspectTx && (
        <TransactionDetailModal
          transaction={inspectTx}
          onClose={() => setInspectTx(null)}
          onUpdated={fetchDashboard}
          onDeleted={fetchDashboard}
          apiInstance={api}
        />
      )}
    </div>
  );
}
