import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Target, 
  Clock, 
  Zap, 
  Check, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';

const CATEGORIES = [
  'Savings',
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Custom Discipline'
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert', 'Legendary'];

export default function ChallengeCreationModal({ 
  isOpen, 
  onClose, 
  onCreate 
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Savings');
  const [targetAmount, setTargetAmount] = useState('5000');
  const [durationDays, setDurationDays] = useState('15');
  const [difficulty, setDifficulty] = useState('Medium');
  const [rewardXP, setRewardXP] = useState('100');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a challenge title.');
      return;
    }
    const targetVal = parseFloat(targetAmount);
    if (!targetVal || targetVal <= 0) {
      setError('Target amount must be greater than 0.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        category,
        target_amount: targetVal,
        duration_days: parseInt(durationDays) || 15,
        difficulty: difficulty.toLowerCase(),
        reward_xp: parseInt(rewardXP) || 100,
        description: description.trim() || `Save or manage ₹${Number(targetVal || 0).toLocaleString('en-IN')} in ${durationDays} days.`
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create challenge.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-glow hud-corner rounded-3xl max-w-lg w-full border border-cyan-500/35 p-6 sm:p-7 space-y-5 bg-[#091325]/95 shadow-2xl relative font-mono text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
              <Plus className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">
                Challenge Creation Studio
              </h3>
              <p className="text-[11px] text-slate-400">
                Design and launch your personalized financial quest
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block uppercase text-[10px]">
              Challenge Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Save ₹5,000 for Emergency Fund"
              className="w-full bg-[#040814] border border-cyan-500/25 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block uppercase text-[10px]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#040814] border border-cyan-500/25 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-[#040814] text-white">{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block uppercase text-[10px]">
                Difficulty Rating
              </label>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  // auto suggest XP based on difficulty
                  const xpMap = { 'Easy': '40', 'Medium': '80', 'Hard': '150', 'Expert': '250', 'Legendary': '400' };
                  setRewardXP(xpMap[e.target.value] || '100');
                }}
                className="w-full bg-[#040814] border border-cyan-500/25 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d} className="bg-[#040814] text-white">{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Amount & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block uppercase text-[10px]">
                Target Amount (₹)
              </label>
              <input
                type="number"
                step="100"
                min="100"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-[#040814] border border-cyan-500/25 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block uppercase text-[10px]">
                Duration (Days)
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full bg-[#040814] border border-cyan-500/25 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="7">7 Days (1 Week)</option>
                <option value="14">14 Days (2 Weeks)</option>
                <option value="21">21 Days (3 Weeks)</option>
                <option value="30">30 Days (1 Month)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block uppercase text-[10px]">
              Mission Brief (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or motivation for your future self..."
              className="w-full bg-[#040814] border border-cyan-500/25 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyan-500/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{loading ? 'Launching Quest...' : 'Launch Custom Quest'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
