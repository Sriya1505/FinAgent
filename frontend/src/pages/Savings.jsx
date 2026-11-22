import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Calendar, 
  Plus, 
  Trash2, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Coins,
  X,
  Edit3,
  Minus,
  Sparkles,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FinnyMascot, useFinny, AchievementCelebrationModal } from '../components/finny';
import FinancialTooltip from '../components/FinancialTooltip';

export default function Savings() {
  const [goalsData, setGoalsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawModalGoal, setWithdrawModalGoal] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [inspectGoal, setInspectGoal] = useState(null);
  const [celebrationGoal, setCelebrationGoal] = useState(null);

  const { reactToPage } = useFinny();

  useEffect(() => {
    reactToPage('savings');
  }, [reactToPage]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: '0',
    deadline: ''
  });

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await api.getSavingsGoals();
      setGoalsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount || !newGoal.deadline) return;

    try {
      await api.createSavingsGoal({
        title: newGoal.title,
        target_amount: parseFloat(newGoal.target_amount),
        current_amount: parseFloat(newGoal.current_amount || '0'),
        deadline: newGoal.deadline
      });
      setShowAddModal(false);
      setNewGoal({ title: '', target_amount: '', current_amount: '0', deadline: '' });
      loadGoals();
    } catch (err) {
      alert(err.message || 'Failed to create goal');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositModalGoal || !depositAmount || parseFloat(depositAmount) <= 0) return;

    const added = parseFloat(depositAmount);
    const newAmt = depositModalGoal.current_amount + added;
    try {
      await api.updateSavingsGoalProgress(depositModalGoal.goal_id, newAmt);
      if (newAmt >= depositModalGoal.target_amount && depositModalGoal.current_amount < depositModalGoal.target_amount) {
        setCelebrationGoal({ ...depositModalGoal, current_amount: newAmt });
      }
      setDepositModalGoal(null);
      setDepositAmount('');
      loadGoals();
    } catch (err) {
      alert(err.message || 'Failed to deposit savings');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawModalGoal || !withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    const deducted = parseFloat(withdrawAmount);
    const newAmt = Math.max(0, withdrawModalGoal.current_amount - deducted);
    try {
      await api.updateSavingsGoalProgress(withdrawModalGoal.goal_id, newAmt);
      setWithdrawModalGoal(null);
      setWithdrawAmount('');
      loadGoals();
    } catch (err) {
      alert(err.message || 'Failed to withdraw from goal');
    }
  };

  const handleSaveEditGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;

    try {
      await api.updateSavingsGoal(editingGoal.goal_id, {
        title: editingGoal.title.trim(),
        target_amount: parseFloat(editingGoal.target_amount),
        deadline: editingGoal.deadline
      });
      setEditingGoal(null);
      loadGoals();
    } catch (err) {
      alert(err.message || 'Failed to update goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await api.deleteSavingsGoal(id);
        loadGoals();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  if (loading || !goalsData) {
    return (
      <div className="p-16 text-center text-xs text-slate-400 font-mono flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
          <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20"></div>
        </div>
        <span className="text-cyan-400 font-bold uppercase tracking-wider glow-text-cyan">
          Calculating Savings Horizon Telemetry...
        </span>
      </div>
    );
  }

  const { goals, current_monthly_surplus, total_targets, total_saved_so_far } = goalsData;
  const hasCompletedGoal = goals.some(g => g.progress_pct >= 100);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto overflow-x-hidden">
      
      {/* Finny Mascot Savings Companion Banner */}
      <div className="bg-[#081329]/90 border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.5),0_0_30px_rgba(168,85,247,0.12)] flex items-center gap-4 sm:gap-6 relative overflow-visible hud-corner">
        <FinnyMascot
          state={hasCompletedGoal ? 'celebrating' : (goals.length > 0 ? 'happy' : 'welcoming')}
          size="lg"
          interactive={true}
        />
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
              Finny Savings Coach
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              hasCompletedGoal
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
            }`}>
              {hasCompletedGoal ? 'Milestone Achieved! 🎉' : 'Savings Momentum'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
            {hasCompletedGoal
              ? "Woohoo! You reached your savings goal. I'm so proud of you!"
              : (goals.length > 0
                  ? "Every deposit brings you closer to your target! Keep up the great financial momentum."
                  : "Set your first savings goal, and let's conquer it together!")}
          </p>
        </div>
      </div>

      {/* Top Banner (Lunetra Futuristic Glass HUD) */}
      <div className="glass-panel-glow hud-corner p-6 rounded-3xl border border-cyan-500/30 relative overflow-hidden bg-gradient-to-r from-[#071329]/95 via-[#050c1b] to-[#040814]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-cyan-500/15 text-cyan-300 rounded-full border border-cyan-500/30 font-mono uppercase tracking-wider">
                SAVINGS HORIZON MATRIX
              </span>
              <span className="text-xs text-slate-300 font-mono">Targeting {goals.length} Major Milestones</span>
            </div>
            <h3 className="text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-emerald-400 bg-clip-text text-transparent font-mono glow-text-cyan mt-1.5">
              ₹{total_saved_so_far.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-400">saved of ₹{total_targets.toLocaleString('en-IN')}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              Current Monthly Surplus: <strong className="text-emerald-400 font-mono">₹{current_monthly_surplus.toLocaleString('en-IN')}</strong> available for goal contributions.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.35)] shrink-0 font-mono transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Savings Goal
          </button>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const isComplete = g.progress_pct >= 100;

            return (
              <motion.div 
                key={g.goal_id} 
                whileHover={{ y: -3 }}
                className={`glass-panel hud-corner p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                  isComplete
                    ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-[#050b16]'
                    : 'border-cyan-500/25 hover:border-cyan-400/60 bg-gradient-to-b from-[#091428]/90 to-[#050b16]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div 
                      onClick={() => setInspectGoal(g)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                      title="Click to view detailed milestones"
                    >
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold group-hover:bg-cyan-500/20 transition-colors">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          <span>{g.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Calendar className="w-3 h-3 text-cyan-400" /> Due: {g.deadline} ({g.months_remaining} mo left)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingGoal(g)}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors rounded-lg hover:bg-cyan-500/10 cursor-pointer"
                        title="Edit goal parameters"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(g.goal_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 cursor-pointer"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clickable Progress Section */}
                  <div 
                    onClick={() => setInspectGoal(g)}
                    className="space-y-1.5 mt-4 p-3 rounded-2xl bg-[#040814]/80 border border-cyan-500/15 hover:border-cyan-400/40 transition-all cursor-pointer"
                    title="Click to view contribution history"
                  >
                    <div className="flex justify-between text-xs font-mono font-semibold">
                      <span className="text-slate-300">Saved: <strong className="text-white">₹{g.current_amount.toLocaleString('en-IN')}</strong></span>
                      <span className="text-cyan-400 glow-text-cyan font-bold">{g.progress_pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-[#030611] rounded-full overflow-hidden border border-cyan-500/20 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, g.progress_pct)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]' 
                            : 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono pt-0.5">
                      <span className="text-slate-400">Target Amount:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGoal(g);
                        }}
                        className="text-cyan-300 hover:underline font-bold"
                        title="Click to edit target amount"
                      >
                        ₹{g.target_amount.toLocaleString('en-IN')} ✏️
                      </button>
                    </div>
                  </div>

                  {/* Feasibility Telemetry Box */}
                  <div className="mt-3.5 p-3.5 rounded-2xl bg-[#060d1b] border border-cyan-500/15 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Required Monthly:</span>
                      <span className="font-bold text-white">₹{g.required_monthly_savings.toLocaleString('en-IN')}/mo</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Remaining Gap: ₹{g.remaining_amount.toLocaleString('en-IN')}</span>
                      <span className={`px-2 py-0.5 font-bold rounded-full ${
                        g.is_feasible 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {g.is_feasible ? 'Feasible' : 'Requires Trimming'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deposit & Withdraw Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-cyan-500/15 font-mono">
                  <button
                    onClick={() => setDepositModalGoal(g)}
                    className="flex-1 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Deposit
                  </button>
                  <button
                    onClick={() => setWithdrawModalGoal(g)}
                    className="flex-1 py-2 text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" /> Withdraw
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel hud-corner p-16 rounded-3xl border border-cyan-500/20 text-center space-y-4 bg-[#060c18]/80 font-mono">
          <Target className="w-12 h-12 text-cyan-400/40 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">No Savings Milestones Active</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
              Create targets with assigned deadlines to calculate required monthly deposits and feasibility against your surplus.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl hover:opacity-95 shadow-md shadow-emerald-500/30 cursor-pointer"
          >
            + Create First Goal
          </button>
        </div>
      )}

      {/* ================= MODAL: ADD GOAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 border border-cyan-500/35 space-y-4 shadow-2xl relative bg-[#091325] max-h-[92dvh] sm:max-h-none overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Add Savings Goal
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">GOAL TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund, New Laptop..."
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-cyan-500/30 text-white outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">TARGET AMOUNT (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-cyan-500/30 text-white outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">STARTING DEPOSIT (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newGoal.current_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-cyan-500/30 text-white outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">TARGET DEADLINE</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-cyan-500/30 text-white outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl shadow-md font-mono"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL: DEPOSIT ================= */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 border border-emerald-500/40 space-y-4 shadow-2xl relative bg-[#091325] max-h-[92dvh] sm:max-h-none overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                Deposit to {depositModalGoal.title}
              </h3>
              <button onClick={() => setDepositModalGoal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#040814] border border-emerald-500/20 text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Current Saved:</span>
                  <span className="text-emerald-400 font-bold">₹{depositModalGoal.current_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span>₹{depositModalGoal.target_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">DEPOSIT AMOUNT (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-emerald-500/30 text-white outline-none focus:border-emerald-400 text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="flex-1 py-2.5 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl shadow-md"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL: WITHDRAW ================= */}
      {withdrawModalGoal && (
        <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 border border-rose-500/40 space-y-4 shadow-2xl relative bg-[#091325] max-h-[92dvh] sm:max-h-none overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Minus className="w-4 h-4 text-rose-400" />
                Withdraw from {withdrawModalGoal.title}
              </h3>
              <button onClick={() => setWithdrawModalGoal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#040814] border border-rose-500/20 text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Available Balance:</span>
                  <span className="text-white font-bold">₹{withdrawModalGoal.current_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">WITHDRAW AMOUNT (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-rose-500/30 text-white outline-none focus:border-rose-400 text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawModalGoal(null)}
                  className="flex-1 py-2.5 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
                >
                  Confirm Withdraw
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL: EDIT GOAL ================= */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 border border-cyan-500/40 space-y-4 shadow-2xl relative bg-[#091325] max-h-[92dvh] sm:max-h-none overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                Edit Savings Goal
              </h3>
              <button onClick={() => setEditingGoal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditGoal} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">GOAL TITLE</label>
                <input
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-cyan-500/30 text-white outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">TARGET AMOUNT (₹)</label>
                <input
                  type="number"
                  value={editingGoal.target_amount}
                  onChange={(e) => setEditingGoal({ ...editingGoal, target_amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-cyan-500/30 text-white outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">TARGET DEADLINE</label>
                <input
                  type="date"
                  value={editingGoal.deadline}
                  onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b16] border border-cyan-500/30 text-white outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 py-2.5 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl shadow-md"
                >
                  Update Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL: INSPECT GOAL ROADMAP ================= */}
      {inspectGoal && (
        <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-glow hud-corner rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 border border-cyan-500/40 space-y-4 shadow-2xl relative bg-[#091325] max-h-[92dvh] sm:max-h-none overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  {inspectGoal.title} Roadmap
                </h3>
                <p className="text-xs text-slate-400 font-mono">Contribution telemetry and feasibility</p>
              </div>
              <button onClick={() => setInspectGoal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Saved So Far:</span>
                <span className="text-emerald-400 font-bold">₹{inspectGoal.current_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Target Amount:</span>
                <span className="text-white font-bold">₹{inspectGoal.target_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Deficit:</span>
                <span className="text-amber-400">₹{inspectGoal.remaining_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Months Remaining:</span>
                <span className="text-cyan-300 font-bold">{inspectGoal.months_remaining} months</span>
              </div>
              <div className="pt-2 border-t border-cyan-500/15 flex justify-between">
                <span className="text-slate-300 font-bold">Required Monthly Pace:</span>
                <span className="text-emerald-400 font-black">₹{inspectGoal.required_monthly_savings.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/25 border border-purple-500/30 flex items-center gap-3">
              <FinnyMascot state={inspectGoal.is_feasible ? 'happy' : 'thinking'} size="xs" interactive={true} />
              <p className="text-xs text-purple-200 leading-snug">
                {inspectGoal.is_feasible
                  ? "Your current monthly surplus is sufficient to meet this required pace easily!"
                  : "Your monthly surplus is currently tighter than the required deposit. Consider trimming discretionary categories in Budgets."}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectGoal(null)}
                className="px-5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl font-mono"
              >
                Close Roadmap
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= CELEBRATION MODAL WHEN 100% REACHED ================= */}
      {celebrationGoal && (
        <AchievementCelebrationModal
          badge={{
            title: `Goal Achieved: ${celebrationGoal.title}! 🏆`,
            description: `Congratulations! You reached your savings target of ₹${celebrationGoal.target_amount.toLocaleString('en-IN')}. Finny is celebrating with you!`,
            points: 150
          }}
          onClose={() => setCelebrationGoal(null)}
        />
      )}
    </div>
  );
}
