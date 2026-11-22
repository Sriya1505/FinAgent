import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  Trophy, 
  Award, 
  Swords, 
  Flame,
  CheckCircle2,
  HelpCircle,
  X,
  Target,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Play
} from 'lucide-react';
import FinnyMascot from '../FinnyMascot';

export default function BossBattleCard({ 
  bossBattleChallenge, 
  onInspectBoss 
}) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const hp = bossBattleChallenge ? Math.max(0, 1000 - (bossBattleChallenge.current_val || 0)) : 1000;
  const damageDealt = 1000 - hp;
  const hpPct = Math.round((hp / 1000) * 100);
  const isDefeated = hp <= 0;

  return (
    <>
      <div className="glass-panel-glow hud-corner p-6 sm:p-7 rounded-3xl border border-rose-500/35 space-y-5 bg-gradient-to-br from-[#1b0816] via-[#0d091a] to-[#040814] relative overflow-hidden shadow-2xl font-mono">
        {/* Background Boss Aura */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <Swords className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight font-sans">
                  Monthly Boss Battle: Inflation Titan
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse">
                  RAID BOSS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Stay strictly within your monthly category limits to strike down the Titan!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>How to Play</span>
            </button>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-400/40 w-fit">
              Reward: +420 XP · Legendary Badge
            </span>
          </div>
        </div>

        {/* Boss Health Bar & Duel Stage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Left: Finny Combat Stance */}
          <div className="p-4 rounded-2xl bg-[#040814]/80 border border-cyan-500/20 text-center space-y-2">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              <FinnyMascot state="cool" size="sm" interactive={false} />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs font-sans">Finny Champion</h5>
              <span className="text-[10px] text-cyan-300 font-bold">Surplus Defense Stance</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              DPS: +{Math.round(damageDealt)} Dmg Dealt
            </span>
          </div>

          {/* Center: Boss HP Gauge */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Titan HP
              </span>
              <span className={`font-black ${isDefeated ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isDefeated ? 'VANQUISHED! (0 HP)' : `${hp} / 1000 HP`}
              </span>
            </div>

            <div className="w-full h-4 bg-[#030612] rounded-full overflow-hidden p-0.5 border border-rose-500/30">
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: `${hpPct}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full transition-all ${
                  isDefeated
                    ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]'
                    : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 shadow-[0_0_15px_rgba(244,63,94,0.7)]'
                }`}
              />
            </div>

            <p className="text-[11px] text-slate-300 text-center font-sans">
              {isDefeated 
                ? '🎉 Victory! You defeated the Inflation Titan and protected your monthly cashflow!' 
                : 'Every rupee banked in surplus attacks the Titan. Keep your spending disciplined!'}
            </p>
          </div>

          {/* Right: Boss Avatar & Inspect */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-3xl shadow-lg">
              {isDefeated ? '💀' : '👾'}
            </div>
            <div>
              <h5 className="font-bold text-white text-xs font-sans">Inflation Titan</h5>
              <span className="text-[10px] text-rose-400 font-bold">Level 30 Raid Boss</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => setShowHowToPlay(true)}
                className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                Rules
              </button>
              <button
                onClick={() => onInspectBoss && onInspectBoss(bossBattleChallenge)}
                className="px-2.5 py-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-slate-950 font-black rounded-lg text-[10px] transition-all cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.4)]"
              >
                ⚔️ Strike Boss
              </button>
            </div>
          </div>
        </div>

        {/* Live Battle Tip Bar */}
        <div className="p-3 rounded-2xl bg-[#040814]/90 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-sans font-medium text-[11px]">
              {isDefeated
                ? "Titan Defeated! You've protected your monthly wealth and earned the Legendary Badge."
                : "Active Raid: Every ₹1,000 of monthly savings deals 100 direct damage to the Titan."}
            </span>
          </div>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer shrink-0"
          >
            Learn How to Play →
          </button>
        </div>
      </div>

      {/* ================= HOW TO PLAY MODAL ================= */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#071329]/95 rounded-3xl max-w-2xl w-full border border-rose-500/40 shadow-[0_0_60px_rgba(244,63,94,0.3)] overflow-hidden relative hud-corner font-mono text-xs max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-950/60 via-[#0d091a] to-[#040814] border-b border-rose-500/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                    <Swords className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base font-sans flex items-center gap-2">
                      How to Play: Monthly Boss Battle
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-500/25 text-rose-300 border border-rose-500/40">
                        RAID GUIDE
                      </span>
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Conquer the Inflation Titan using real financial discipline
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowHowToPlay(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Guide Content */}
              <div className="p-6 overflow-y-auto space-y-4">
                {/* 1. Objective */}
                <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm font-sans">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>1. The Raid Mission</span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    The <strong>Inflation Titan</strong> has <strong>1,000 HP</strong>. Every month, inflation and undisciplined impulse spending threaten your wealth. Your goal is to help <strong>Finny Champion</strong> strike down the Titan to 0 HP before the monthly calendar closes.
                  </p>
                </div>

                {/* 2. How Damage is Dealt */}
                <div className="p-4 rounded-2xl bg-[#040814] border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm font-sans">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>2. How to Deal Damage (DPS)</span>
                  </div>
                  <ul className="space-y-2 text-slate-300 font-sans text-xs leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold font-mono">►</span>
                      <span><strong>Monthly Surplus Attack:</strong> Every ₹1,000 you retain in net monthly surplus (Total Income minus Total Expenses) deals <strong>100 direct damage</strong> to the Titan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold font-mono">►</span>
                      <span><strong>Safe Daily Allowance Bonus:</strong> Keeping daily expenses under your safe daily allowance increases Finny's critical strike power by <strong>+150 DPS</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold font-mono">►</span>
                      <span><strong>Automated Ledger Math:</strong> Zero manual clicking! Finny automatically computes damage from your verified Python transaction ledger.</span>
                    </li>
                  </ul>
                </div>

                {/* 3. How the Titan Fights Back */}
                <div className="p-4 rounded-2xl bg-[#040814] border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm font-sans">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>3. How the Titan Fights Back</span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    If you exceed 100% of any category budget (Dining, Shopping, or Utilities) or make unplanned large discretionary purchases, the Titan absorbs your cashflow deficit, <strong>recovering health</strong> and weakening Finny's Defense Stance.
                  </p>
                </div>

                {/* 4. Victory & Rewards */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm font-sans">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span>4. Victory & Epic Spoils</span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    Depleting all 1,000 HP of the Titan awards:
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-purple-200">
                      <strong>+420 XP</strong> towards Finny Evolution
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-purple-200">
                      <strong>Legendary Badge</strong> in Trophy Showcase
                    </div>
                  </div>
                </div>

                {/* Finny's Battle Pro Tip */}
                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-400/30 flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0">
                    <FinnyMascot state="winking" size="sm" interactive={false} />
                  </div>
                  <p className="text-[11px] text-cyan-200 font-sans leading-snug">
                    <strong>Finny's Pro-Tip:</strong> "You don't have to change your lifestyle overnight! Just track your purchases and bank a modest monthly surplus. I'll take care of blasting the Titan!" 💜
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#050c1b] border-t border-rose-500/20 flex items-center justify-between px-6 shrink-0">
                <span className="text-slate-400 text-[11px]">
                  Raid Season: November 2026
                </span>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
                >
                  Got It, Let's Fight!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
