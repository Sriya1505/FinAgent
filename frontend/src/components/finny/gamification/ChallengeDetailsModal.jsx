import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Target, 
  Sparkles, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Pause, 
  Play, 
  Trash2, 
  Receipt, 
  ArrowRight,
  Award,
  Zap,
  Info
} from 'lucide-react';
import FinnyMascot from '../FinnyMascot';

export default function ChallengeDetailsModal({ 
  isOpen, 
  challenge, 
  onClose, 
  onEnroll, 
  onAction, 
  onClaim 
}) {
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !challenge) return null;

  const {
    id,
    title,
    category,
    description,
    difficulty,
    status = 'available',
    duration_days = 1,
    target_value = 0,
    current_val = 0,
    remaining_val = 0,
    progress_pct = 0,
    reward_xp = 50,
    reward_badge,
    finny_advice,
    finny_message,
    finny_state = 'happy',
    start_date,
    end_date,
    related_transactions = [],
    icon = '🎯'
  } = challenge;

  const isCompleted = progress_pct >= 100;
  const isActive = status === 'active';
  const isPaused = status === 'paused';
  const isClaimed = status === 'claimed';

  const handleEnrollClick = async () => {
    setLoading(true);
    try {
      await onEnroll(id);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (action) => {
    setLoading(true);
    try {
      await onAction(id, action);
      if (action === 'abandon') {
        setShowAbandonConfirm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = async () => {
    setLoading(true);
    try {
      await onClaim(id);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'bg-sky-500/15 text-sky-300 border-sky-400/40';
      case 'medium': return 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40';
      case 'hard': return 'bg-amber-500/15 text-amber-300 border-amber-400/40';
      case 'expert': return 'bg-purple-500/15 text-purple-300 border-purple-400/40';
      case 'legendary': return 'bg-rose-500/15 text-rose-300 border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#071329]/95 rounded-3xl max-w-2xl w-full border border-cyan-500/35 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden relative hud-corner font-mono flex flex-col max-h-[90vh]"
      >
        {/* Glow Accent Top Bar */}
        <div className={`h-1.5 shadow-[0_0_15px_currentColor] ${
          isCompleted 
            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-emerald-400' 
            : isActive 
            ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-cyan-400' 
            : 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 text-slate-600'
        }`}></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-cyan-500/15 flex items-start justify-between bg-[#050c1b]/80 shrink-0">
          <div className="flex items-start gap-3">
            <div className="text-3xl p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shadow-md">
              {icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {category} QUEST
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isClaimed 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' 
                    : isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                    : isActive 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' 
                    : isPaused 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isClaimed ? 'CLAIMED ✓' : isCompleted ? 'READY TO CLAIM' : isActive ? 'IN PROGRESS' : isPaused ? 'PAUSED' : 'AVAILABLE'}
                </span>
              </div>
              <h3 className="font-extrabold text-white text-lg tracking-tight font-sans">
                {title}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 pr-3">
          {/* Challenge Description */}
          <p className="text-sm text-slate-300 font-sans leading-relaxed">
            {description}
          </p>

          {/* Finny Mascot Reaction Strip */}
          <div className="p-3.5 rounded-2xl bg-[#040814]/90 border border-purple-500/30 flex items-center gap-3.5 relative shadow-inner">
            <div className="shrink-0">
              <FinnyMascot state={finny_state} size="sm" interactive={false} />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1 font-sans">
                  Finny's Advice
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                </span>
                <span className="text-[10px] text-purple-300">Live Reaction</span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-snug">
                {finny_message || finny_advice}
              </p>
            </div>
          </div>

          {/* Target & Dynamic Progress Metrics */}
          <div className="p-4 rounded-2xl bg-[#040916] border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                Ledger Progress
              </span>
              <span className={`font-black text-sm ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {progress_pct}% Completed
              </span>
            </div>

            {/* Glowing Progress Bar */}
            <div className="w-full h-3 bg-[#02050f] rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress_pct)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full transition-all ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]' 
                    : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-cyan-500/10">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Target Horizon</span>
                <span className="text-white font-bold">{Number(target_value || 0) > 0 ? `₹${Number(target_value || 0).toLocaleString('en-IN')}` : 'Full Discipline'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Remaining Requirement</span>
                <span className="text-cyan-300 font-bold">{Number(remaining_val || 0) > 0 ? `₹${Number(remaining_val || 0).toLocaleString('en-IN')}` : '0 (Goal Met!)'}</span>
              </div>
            </div>
          </div>

          {/* Challenge Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#050c18] border border-cyan-500/15">
              <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
              <strong className="text-white flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {duration_days} Day{duration_days > 1 ? 's' : ''}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-[#050c18] border border-cyan-500/15">
              <span className="text-[10px] text-slate-400 block uppercase">Reward XP</span>
              <strong className="text-purple-300 flex items-center gap-1 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                +{reward_xp} XP
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-[#050c18] border border-cyan-500/15">
              <span className="text-[10px] text-slate-400 block uppercase">Start Date</span>
              <strong className="text-slate-200 mt-0.5 block truncate">
                {start_date || 'Today'}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-[#050c18] border border-cyan-500/15">
              <span className="text-[10px] text-slate-400 block uppercase">End Date</span>
              <strong className="text-slate-200 mt-0.5 block truncate">
                {end_date || 'Ongoing'}
              </strong>
            </div>
          </div>

          {/* Related Ledger Transactions Breakdown */}
          {related_transactions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold uppercase flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                  Related Ledger Records ({related_transactions.length})
                </span>
                <span className="text-[10px] text-cyan-400">Verified Python Math</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {related_transactions.map((t, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#040814] border border-cyan-500/15 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white text-xs truncate max-w-[240px] font-sans">
                        {t.description}
                      </p>
                      <span className="text-[10px] text-slate-400">{t.date} · {t.category}</span>
                    </div>
                    <span className={`font-bold ${t.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {t.type === 'expense' ? '-' : '+'}₹{(t.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abandon Confirmation Prompt */}
          <AnimatePresence>
            {showAbandonConfirm && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-2.5"
              >
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Abandon this active challenge?</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  Your current progress will be archived and this quest will return to the available catalog. You can restart anytime.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleActionClick('abandon')}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Yes, Abandon Quest
                  </button>
                  <button
                    onClick={() => setShowAbandonConfirm(false)}
                    className="px-3.5 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-[#050c1b] border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 px-6 shrink-0">
          <div className="flex items-center gap-2">
            {isActive && !isCompleted && (
              <>
                <button
                  onClick={() => handleActionClick('pause')}
                  className="px-3 py-2 bg-slate-900 border border-cyan-500/25 hover:border-cyan-400/50 text-cyan-300 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={() => setShowAbandonConfirm(true)}
                  className="px-3 py-2 bg-rose-950/30 border border-rose-500/30 hover:border-rose-400/50 text-rose-300 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Abandon</span>
                </button>
              </>
            )}

            {isPaused && (
              <button
                onClick={() => handleActionClick('resume')}
                className="px-3.5 py-2 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume Quest</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 text-slate-300 hover:text-white text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            {isCompleted && !isClaimed ? (
              <button
                disabled={loading}
                onClick={handleClaimClick}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Claim Reward (+{reward_xp} XP)</span>
              </button>
            ) : status === 'available' ? (
              <button
                disabled={loading}
                onClick={handleEnrollClick}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Accept Challenge</span>
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
