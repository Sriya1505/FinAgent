import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  HelpCircle, 
  Target, 
  Trophy, 
  RotateCw, 
  Gift, 
  Flame, 
  Compass, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Swords, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Layers,
  BookOpen
} from 'lucide-react';
import FinnyMascot from '../FinnyMascot';

const GUIDE_TABS = [
  { id: 'overview', label: '🎮 Overview & Lore', icon: BookOpen },
  { id: 'quests', label: '🎯 Quests & XP', icon: Target },
  { id: 'boss', label: '👾 Boss Battles', icon: Swords },
  { id: 'spin_chest', label: '🎡 Spin & Chests', icon: RotateCw },
  { id: 'map_levels', label: '🗺️ Map & Evolutions', icon: Crown },
  { id: 'leaderboard', label: '🏆 Leaderboard', icon: Trophy }
];

export default function HowToPlayModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#071329]/95 rounded-3xl max-w-4xl w-full border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden relative hud-corner font-mono flex flex-col max-h-[90vh]"
      >
        {/* Accent Glow Top Bar */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 shadow-[0_0_20px_#22d3ee]"></div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-cyan-500/15 flex items-center justify-between bg-[#050c1b]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <HelpCircle className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg sm:text-xl tracking-tight font-sans">
                  How to Play: Financial Adventure 2.0
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  OFFICIAL GAME GUIDE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Turn your real-world budgeting and savings discipline into an epic RPG journey with Finny.
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-cyan-500/10 overflow-x-auto bg-[#040916] shrink-0">
          {GUIDE_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 pr-3 text-xs leading-relaxed text-slate-300">
          {/* TAB 1: OVERVIEW & LORE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-black/40 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <FinnyMascot state="happy" size="sm" interactive={false} />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white font-sans">
                    Welcome to Finny's Financial Adventure!
                  </h4>
                  <p className="text-slate-300">
                    Unlike standard budgeting apps that show boring numbers, FinAgent transforms your daily money decisions into an RPG. Every disciplined purchase, verified savings deposit, and categorized receipt earns you XP, powers up Finny through 8 evolutionary forms, and unlocks rare badges!
                  </p>
                </div>
              </div>

              {/* 3 Core Rules */}
              <div>
                <h4 className="text-sm font-bold text-white font-sans mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  The 3 Golden Rules of Play
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h5 className="font-bold text-white text-xs">Take on Quests</h5>
                    <p className="text-[11px] text-slate-400">
                      Enroll in Daily Sprints, Weekly Budgets, or Monthly Savings missions tailored to your goals.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h5 className="font-bold text-white text-xs">Spend With Discipline</h5>
                    <p className="text-[11px] text-slate-400">
                      Log your purchases and stay under category caps. Progress is calculated from your actual transactions!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h5 className="font-bold text-white text-xs">Claim Rewards & Evolve</h5>
                    <p className="text-[11px] text-slate-400">
                      Claim XP to level up Finny (Lv. 1 to 8), defeat the Inflation Titan, and collect rare collectible badges!
                    </p>
                  </div>
                </div>
              </div>

              {/* What Makes It Special */}
              <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-2">
                <h5 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  100% Real Math · Zero Cheating or Gimmicks
                </h5>
                <p className="text-slate-400 text-xs">
                  Your quest progression, damage dealt to the Boss, and leaderboard rank are connected directly to your ledger records. When you save ₹13,600 in real life, your game immediately reflects that achievement!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: QUESTS & XP */}
          {activeTab === 'quests' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white font-sans mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  How Quests & Missions Work
                </h4>
                <p className="text-slate-300 text-xs">
                  Quests are financial challenges that reward you with XP (Experience Points) and badges. Each quest has a specific financial requirement verified automatically from your ledger.
                </p>
              </div>

              {/* Quest Types */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#040814] border border-sky-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    DAILY SPRINTS (24H)
                  </span>
                  <h5 className="text-xs font-bold text-white">Micro-Discipline</h5>
                  <p className="text-[11px] text-slate-400">
                    E.g. No-Spend Sprint (₹0 shopping/dining today), Expense Detective (audit 3 receipts). Rewards 40–60 XP.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#040814] border border-purple-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    WEEKLY MISSIONS (7D)
                  </span>
                  <h5 className="text-xs font-bold text-white">Mid-Term Habit Building</h5>
                  <p className="text-[11px] text-slate-400">
                    E.g. Grocery Genius (keep Food & Dining under weekly budget), 7-Day Consistency Master. Rewards 100–150 XP.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#040814] border border-amber-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    MONTHLY RAIDS (30D)
                  </span>
                  <h5 className="text-xs font-bold text-white">Strategic Wealth Milestones</h5>
                  <p className="text-[11px] text-slate-400">
                    E.g. 20% Savings Rate Challenge, Budget Guardian (0 breaches all month). Rewards 260–420 XP + Epic Badges.
                  </p>
                </div>
              </div>

              {/* Step by Step Quest Flow */}
              <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-3">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  How to Complete a Quest Step-by-Step:
                </h5>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>1. Enroll:</strong> Click any quest card to view requirements, then click <strong>"Enroll / Start Quest"</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>2. Live Progress:</strong> The progress bar automatically updates as you record transactions or maintain your budget.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>3. Claim Reward:</strong> When the progress bar hits 100%, click <strong>"Claim Reward"</strong> to bank your XP and unlock your badge!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>4. Custom Quests:</strong> Use the <strong>"+ Create Custom Quest"</strong> button to design your own personalized spending cap or savings sprint!</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: BOSS BATTLES */}
          {activeTab === 'boss' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-purple-950/30 border border-rose-500/30 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center shrink-0">
                  <Swords className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">
                    Monthly Raid Boss: Inflation Titan (1,000 HP)
                  </h4>
                  <p className="text-slate-300 text-xs">
                    Inflation is constantly threatening your hard-earned purchasing power. In this monthly boss battle, your net savings surplus is converted directly into strike damage!
                  </p>
                </div>
              </div>

              {/* Combat Mechanics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#040814] border border-rose-500/20 space-y-2">
                  <h5 className="font-bold text-white text-xs flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-400" />
                    How to Deal Damage
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>• <strong>Net Monthly Surplus:</strong> Every ₹10 of unspent monthly income deals 1 HP of critical strike damage to the Titan.</li>
                    <li>• <strong>Budget Discipline:</strong> Keeping all budget categories under 100% utilization grants a <strong>1.5x DPS Multiplier</strong>.</li>
                    <li>• <strong>Zero Overspending:</strong> If a budget is breached, the Titan counters by regenerating 100 HP!</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#040814] border border-amber-500/20 space-y-2">
                  <h5 className="font-bold text-white text-xs flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Victory Rewards
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>• <strong>Massive XP:</strong> Defeating the Titan awards <strong>+420 XP</strong> instantly!</li>
                    <li>• <strong>Legendary Badge:</strong> Unlocks the ultra-rare <strong>Legendary Money Master</strong> trophy.</li>
                    <li>• <strong>Finny Aura:</strong> Finny gains the special Midnight Purple boss victor aura.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DAILY SPIN & CHESTS */}
          {activeTab === 'spin_chest' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Daily Spin */}
                <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/25 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
                      <RotateCw className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-sans">Daily Wheel of Fortune</h4>
                      <span className="text-[10px] text-cyan-300">Spins reset every 24 hours</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Visit once each day to spin Finny's wheel! Rewards include instant XP (+25 to +100 XP), Double XP Surge buffs, quick micro-challenges, and streak multipliers.
                  </p>
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-300">
                    💡 Tip: Daily spins count toward your unbroken check-in streak!
                  </div>
                </div>

                {/* Mystery Chest */}
                <div className="p-4 rounded-2xl bg-[#040814] border border-purple-500/25 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-sans">Finny's Mystery Chest</h4>
                      <span className="text-[10px] text-purple-300">Unlocks every 3 quests completed</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Every 3 completed quests award you 1 Mystery Treasure Box. Opening a chest grants burst XP rewards (100–300 XP), rare badge shards, or permanent Finny evolution boosts!
                  </p>
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-300">
                    🎁 Ready Chests: Look for the glowing badge counter on the Mystery Chest button!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MAP & EVOLUTIONS */}
          {activeTab === 'map_levels' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white font-sans mb-1 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Finny's 8 Evolution Tiers & The Adventure Map
                </h4>
                <p className="text-slate-300 text-xs">
                  As you accumulate XP, Finny evolves through 8 distinct developmental tiers, unlocking powerful passive perks and advancing across 8 realms on the Adventure Map.
                </p>
              </div>

              {/* Evolution Tiers Table */}
              <div className="border border-cyan-500/20 rounded-2xl overflow-hidden bg-[#040814]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#050c1b] border-b border-cyan-500/20 text-cyan-300 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">Lv.</th>
                      <th className="p-2.5">Form Name</th>
                      <th className="p-2.5">Realm Unlocked</th>
                      <th className="p-2.5">Passive Perk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/10 text-slate-300 text-[11px]">
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">1</td>
                      <td className="p-2.5 font-bold text-white">Apprentice Finny 🐣</td>
                      <td className="p-2.5 text-slate-400">Savings Shore</td>
                      <td className="p-2.5 text-cyan-300">+5% bonus XP on daily check-ins</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">2</td>
                      <td className="p-2.5 font-bold text-white">Smart Scout Finny 🧭</td>
                      <td className="p-2.5 text-slate-400">Budget Bastion</td>
                      <td className="p-2.5 text-cyan-300">Unlocks expense detective radar</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">3</td>
                      <td className="p-2.5 font-bold text-white">Budget Ranger Finny 🛡️</td>
                      <td className="p-2.5 text-slate-400">Frugal Forest</td>
                      <td className="p-2.5 text-cyan-300">+10% XP on weekly budget quests</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">4</td>
                      <td className="p-2.5 font-bold text-white">Star Alchemist Finny ✨</td>
                      <td className="p-2.5 text-slate-400">Investment Island</td>
                      <td className="p-2.5 text-cyan-300">Unlocks Mystery Chest boost</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">5</td>
                      <td className="p-2.5 font-bold text-white">Shadow Ninja Finny 🥷</td>
                      <td className="p-2.5 text-slate-400">Compound Citadel</td>
                      <td className="p-2.5 text-cyan-300">+15% damage bonus in Boss Battles</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">6</td>
                      <td className="p-2.5 font-bold text-white">Cyber Master Finny 🔮</td>
                      <td className="p-2.5 text-slate-400">Capital Peaks</td>
                      <td className="p-2.5 text-cyan-300">Double spin rewards on weekends</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">7</td>
                      <td className="p-2.5 font-bold text-white">Neon Warlord Finny ⚡</td>
                      <td className="p-2.5 text-slate-400">Quantum Vault</td>
                      <td className="p-2.5 text-cyan-300">Grants 1 streak freeze per month</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-400">8</td>
                      <td className="p-2.5 font-bold text-amber-300">Financial Legend 👑</td>
                      <td className="p-2.5 text-amber-400 font-bold">Financial Freedom Sanctuary</td>
                      <td className="p-2.5 text-amber-300 font-bold">Permanent 2x multiplier on all rewards!</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white font-sans mb-1 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Personal Competition & Privacy-First Leaderboard
                </h4>
                <p className="text-slate-300 text-xs">
                  We believe true wealth building is about outperforming your own past, not comparing yourself to others.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-2">
                  <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Net Surplus Shift
                  </h5>
                  <p className="text-slate-400 text-xs">
                    Compares your net monthly surplus (Income minus Expenses) against the previous month. Right now with ₹20,000 inflow and ₹6,400 outflow, you've generated <strong>+₹13,600</strong> in net surplus!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-2">
                  <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Zero Data Leaked
                  </h5>
                  <p className="text-slate-400 text-xs">
                    Your personal finances are never published on a public server. All calculations run strictly in your verified private environment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/15 bg-[#050c1b]/80 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ready to embark on your financial adventure?</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 hover:opacity-95 transition-opacity cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Got It, Let's Play!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
