import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Trash2,
  TrendingUp,
  ShieldCheck,
  X,
  Target,
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  FinnyMascot, 
  useFinny,
  DailyCheckInBanner,
  FinnyHealthScoreCard,
  FinnyBudgetCard,
  FinnyChallengesSection,
  FinnyGamifiedChallengesSection,
  CategoryTransactionsModal,
  AchievementCelebrationModal,
  calculateHealthScore
} from '../components/finny';

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Other Expenses'
];

export default function Budgets() {
  const [budgetData, setBudgetData] = useState(() => api.handleOfflineFallback('/budgets'));
  const [dashboardData, setDashboardData] = useState(() => api.handleOfflineFallback('/dashboard'));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Section Navigation: 'all' | 'budgets' | 'rewards' | 'challenges'
  const [activeTab, setActiveTab] = useState('all');

  // Modals & Popups
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState('Food & Dining');
  const [newLimit, setNewLimit] = useState('');
  const [inspectCategory, setInspectCategory] = useState(null);
  const [celebratingBadge, setCelebratingBadge] = useState(null);

  const { reactToPage, reactToFinancials } = useFinny();

  useEffect(() => {
    reactToPage('budgets');
  }, [reactToPage]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [bData, dData, txRes] = await Promise.all([
        api.getBudgets().catch(() => api.handleOfflineFallback('/budgets')),
        api.getDashboard().catch(() => api.handleOfflineFallback('/dashboard')),
        api.getTransactions().catch(() => ({ transactions: [] }))
      ]);
      const safeBData = bData || api.handleOfflineFallback('/budgets');
      const safeDData = dData || api.handleOfflineFallback('/dashboard');
      const safeTxs = Array.isArray(txRes) ? txRes : (txRes?.transactions || []);

      setBudgetData(safeBData);
      setDashboardData(safeDData);
      setTransactions(safeTxs);

      if (safeBData) {
        reactToFinancials({
          budgetUtilization: safeBData.total_budget > 0 ? (safeBData.total_spent / safeBData.total_budget) * 100 : 0,
          completedGoalsCount: (safeDData?.savings_goals || []).filter(g => (g.progress_pct || 0) >= 100).length,
          hasAnomalies: (safeBData.budgets || []).some(b => b.utilization_pct > 100),
          transactionsCount: safeTxs.length
        });
      }
    } catch (err) {
      console.error('Failed to load budget telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!newLimit || parseFloat(newLimit) <= 0) return;
    try {
      await api.setBudget({
        category: newCat,
        spending_limit: parseFloat(newLimit)
      });
      setShowAddModal(false);
      setNewLimit('');
      loadAllData();
    } catch (err) {
      alert(err.message || 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Delete this budget limit?')) {
      try {
        await api.deleteBudget(id);
        loadAllData();
      } catch (err) {
        alert(err.message || 'Failed to delete budget limit');
      }
    }
  };

  if (loading || !budgetData) {
    return (
      <div className="p-16 text-center text-xs text-slate-400 font-mono flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
          <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20"></div>
        </div>
        <span className="text-cyan-400 font-bold uppercase tracking-wider glow-text-cyan">
          Calculating Interactive Budget Telemetry...
        </span>
        <span className="text-slate-500 text-[11px]">
          Synchronizing verified Python limits and Finny reactions
        </span>
      </div>
    );
  }

  const { 
    total_budget = 0, 
    total_spent = 0, 
    total_remaining = 0, 
    days_left = 10, 
    safe_daily_allowance = 0, 
    budgets = [] 
  } = budgetData || {};
  const overallUtil = Number(total_budget || 0) > 0 ? Math.round((Number(total_spent || 0) / Number(total_budget || 1)) * 100) : 0;
  const healthScore = calculateHealthScore(budgetData, dashboardData, transactions.length);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto overflow-x-hidden">
      
      {/* ================= SECTION E: DAILY BUDGET CHECK-IN BANNER ================= */}
      <DailyCheckInBanner
        budgetData={budgetData}
        transactions={transactions}
        onAddTx={() => setShowAddModal(true)}
      />

      {/* ================= SPECIAL IDEA: FINNY'S FINANCIAL HEALTH SCORE ================= */}
      <FinnyHealthScoreCard
        healthScore={healthScore}
        totalRemaining={Number(total_remaining || 0)}
        daysLeft={days_left}
        safeDaily={Number(safe_daily_allowance || 0)}
      />

      {/* ================= MONTHLY BUDGET HUD SUMMARY STRIP ================= */}
      <div className="glass-panel-glow hud-corner p-6 rounded-3xl border border-cyan-500/30 relative overflow-hidden bg-gradient-to-r from-[#071329]/90 via-[#050c1b]/95 to-[#040814]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-cyan-500/15 text-cyan-300 rounded-full border border-cyan-500/30 font-mono uppercase tracking-wider">
                MONTHLY BUDGET SUMMARY
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> {days_left} Days Remaining in Month
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent font-mono glow-text-cyan">
              Total Budget: ₹{Number(total_budget || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-300 font-mono">
              Total Spent: ₹{Number(total_spent || 0).toLocaleString('en-IN')} ({overallUtil}%) · Remaining Cushion: <strong className="text-emerald-400">₹{Number(total_remaining || 0).toLocaleString('en-IN')}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#050c18] p-4 rounded-2xl border border-cyan-500/25">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Safe Daily Allowance</span>
              <span className="text-2xl font-black text-emerald-400 font-mono glow-text-cyan">
                ₹{Number(safe_daily_allowance || 0).toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/day</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                Remaining (₹{Number(total_remaining || 0).toLocaleString('en-IN')}) / {days_left} Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TAB CONTROLLER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/15 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          {[
            { id: 'all', label: 'All Features', icon: Layers },
            { id: 'budgets', label: `Category Budgets (${budgets.length})`, icon: PiggyBank },
            { id: 'challenges', label: 'Financial Adventure 2.0', icon: Compass }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-bold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] font-mono cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* ================= SECTION A, B, D: INDIVIDUAL BUDGET PROGRESS CARDS ================= */}
      {(activeTab === 'all' || activeTab === 'budgets') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Category Budgets & Finny Reactions
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {budgets.length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Finny monitors every individual category with dynamic expressions and personalized advice.
              </p>
            </div>
          </div>

          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {budgets.map((b) => (
                <FinnyBudgetCard
                  key={b.budget_id}
                  budget={b}
                  onDelete={handleDeleteBudget}
                  onInspectCategory={(cat) => setInspectCategory(cat)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel hud-corner p-12 rounded-3xl border border-cyan-500/20 text-center space-y-4 bg-[#060c18]/80">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center">
                <PiggyBank className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">No Category Budgets Configured</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Assign monthly spending caps for Food & Dining, Shopping, or Travel to enable Finny's individual budget companion reactions!
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-xl hover:opacity-95 shadow-md shadow-cyan-500/30 font-mono cursor-pointer"
              >
                + Set First Category Budget
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION F: GAMIFIED FINANCIAL CHALLENGES 2.0 ================= */}
      {(activeTab === 'all' || activeTab === 'challenges') && (
        <FinnyGamifiedChallengesSection
          budgetData={budgetData}
          transactions={transactions}
          onClaimChallenge={(reward) => setCelebratingBadge({
            title: reward.title,
            description: reward.description,
            points: reward.points || 50
          })}
        />
      )}

      {/* ================= CATEGORY TRANSACTIONS INSPECTOR MODAL ================= */}
      {inspectCategory && (
        <CategoryTransactionsModal
          category={inspectCategory}
          transactions={transactions}
          onClose={() => setInspectCategory(null)}
        />
      )}

      {/* ================= ACHIEVEMENT CELEBRATION MODAL ================= */}
      {celebratingBadge && (
        <AchievementCelebrationModal
          badge={celebratingBadge}
          onClose={() => setCelebratingBadge(null)}
        />
      )}

      {/* ================= SET CATEGORY BUDGET MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 border border-cyan-500/35 space-y-4 shadow-2xl relative bg-[#091325] max-h-[92dvh] sm:max-h-none overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Set Category Budget</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  CATEGORY
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#050b16] border border-cyan-500/30 text-slate-100 outline-none focus:border-cyan-400 font-sans"
                >
                  {DEFAULT_CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-[#050b16] text-slate-100">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  MONTHLY SPENDING LIMIT (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 8000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#050b16] border border-cyan-500/30 text-slate-100 outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-xl hover:opacity-95 shadow-md shadow-cyan-500/30 font-mono cursor-pointer"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
