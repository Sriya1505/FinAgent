import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Layers,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export default function LeaderboardView({ 
  leaderboardData 
}) {
  if (!leaderboardData) return null;

  const {
    current_month = '',
    previous_month = '',
    level = 1,
    level_name = 'Money Beginner',
    xp = 0,
    streak_days = 0,
    current_surplus = 0,
    previous_surplus = 0,
    surplus_improvement = 0,
    is_outperforming_prev_month = false,
    current_expenses = 0,
    previous_expenses = 0,
    expense_reduction = 0
  } = leaderboardData || {};

  return (
    <div className="glass-panel-glow hud-corner p-6 sm:p-7 rounded-3xl border border-cyan-500/30 space-y-6 bg-gradient-to-br from-[#060e1d] to-[#040814] font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base font-sans">
              Personal Competition & Financial Benchmark
            </h3>
            <p className="text-slate-400 text-[11px]">
              Compete against your own historical baseline: {current_month} vs {previous_month}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            PRIVACY FIRST · NO SENSITIVE DATA EXPOSED
          </span>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Surplus Improvement */}
        <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Net Surplus Shift
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black ${is_outperforming_prev_month ? 'text-emerald-400 glow-text-cyan' : 'text-amber-400'}`}>
              ₹{Number(current_surplus || 0).toLocaleString('en-IN')}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${
              is_outperforming_prev_month ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {is_outperforming_prev_month ? '+' : ''}₹{Number(surplus_improvement || 0).toLocaleString('en-IN')} vs Last Mo.
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Previous Month: ₹{Number(previous_surplus || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Expense Discipline */}
        <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Monthly Spend Baseline
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">
              ₹{Number(current_expenses || 0).toLocaleString('en-IN')}
            </span>
            {expense_reduction > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                -₹{Number(expense_reduction || 0).toLocaleString('en-IN')} Saved!
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Previous Month: ₹{Number(previous_expenses || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Adventurer Level & Streak */}
        <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Adventurer Standing
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-purple-400">
              Lv.{level} {level_name}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-2">
            <span>{xp} Total XP</span>
            <span>·</span>
            <span className="text-amber-400 flex items-center gap-0.5">
              <Flame className="w-3 h-3 fill-amber-400" />
              {streak_days}d Streak
            </span>
          </span>
        </div>
      </div>

      {/* Finny Motivational Statement */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <p className="text-slate-300 font-sans text-xs">
          {is_outperforming_prev_month
            ? `Fantastic work! You've generated ₹${Number(surplus_improvement || 0).toLocaleString('en-IN')} more net surplus than last month. Your discipline is outperforming your baseline!`
            : `Keep steady! Focus on reigning in discretionary grocery & shopping outlays over the next week to beat last month's benchmark.`}
        </p>
      </div>
    </div>
  );
}
