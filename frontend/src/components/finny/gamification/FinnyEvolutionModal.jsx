import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Crown, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Award,
  Layers,
  Star
} from 'lucide-react';
import FinnyMascot from '../FinnyMascot';

const EVOLUTION_TIERS = [
  {
    tier: 1,
    level_req: 1,
    name: "Apprentice Finny",
    title: "Novice Saver",
    description: "Energetic baby companion learning the basics of tracking transactions and avoiding small leaks.",
    aura: "border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.3)]",
    bg: "from-sky-950/40 via-[#071329] to-[#040814]",
    perk: "+5% bonus XP on daily check-ins",
    mascotState: "happy"
  },
  {
    tier: 2,
    level_req: 2,
    name: "Smart Scout Finny",
    title: "Disciplined Buyer",
    description: "Equipped with golden goggles to detect unnecessary impulsive outlays across daily receipts.",
    aura: "border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.4)]",
    bg: "from-cyan-950/40 via-[#071329] to-[#040814]",
    perk: "Unlocks daily expense detective radar",
    mascotState: "thinking"
  },
  {
    tier: 3,
    level_req: 3,
    name: "Budget Ranger Finny",
    title: "Category Scout",
    description: "Wields a holographic category barrier, defending your monthly limits against budget breaches.",
    aura: "border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.4)]",
    bg: "from-emerald-950/40 via-[#071329] to-[#040814]",
    perk: "+10% XP on weekly budget quests",
    mascotState: "proud"
  },
  {
    tier: 4,
    level_req: 4,
    name: "Star Alchemist Finny",
    title: "Wealth Builder",
    description: "Transmutes impulsive desires into guaranteed long-term emergency fund compounding.",
    aura: "border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.5)]",
    bg: "from-amber-950/40 via-[#071329] to-[#040814]",
    perk: "Unlocks Mystery Treasure Box XP boost",
    mascotState: "star_eyes"
  },
  {
    tier: 5,
    level_req: 5,
    name: "Shadow Ninja Finny",
    title: "Ledger Master",
    description: "Silently slices through hidden subscription traps, recurring bank charges, and inflation.",
    aura: "border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.5)]",
    bg: "from-purple-950/40 via-[#071329] to-[#040814]",
    perk: "+15% damage bonus in monthly Boss Battles",
    mascotState: "cool"
  },
  {
    tier: 6,
    level_req: 6,
    name: "Cyber Master Finny",
    title: "Capital Commander",
    description: "A high-tech neural advisor with quantum mathematical insight and zero arithmetic hallucination.",
    aura: "border-fuchsia-400/60 shadow-[0_0_35px_rgba(217,70,239,0.5)]",
    bg: "from-fuchsia-950/40 via-[#071329] to-[#040814]",
    perk: "Double spin rewards on weekends",
    mascotState: "celebrating"
  },
  {
    tier: 7,
    level_req: 7,
    name: "Neon Warlord Finny",
    title: "Financial Strategist",
    description: "Armed with dual balance blades, commanding multiple cashflows and banishing debt.",
    aura: "border-rose-400/70 shadow-[0_0_40px_rgba(244,63,94,0.6)]",
    bg: "from-rose-950/40 via-[#071329] to-[#040814]",
    perk: "Grants 1 streak freeze protection per month",
    mascotState: "love"
  },
  {
    tier: 8,
    level_req: 8,
    name: "Ascended Financial Legend",
    title: "Ascended Sovereign",
    description: "The ultimate financial deity. Complete autonomy, peace of mind, and generational prosperity.",
    aura: "border-yellow-400/90 shadow-[0_0_50px_rgba(250,204,21,0.8)]",
    bg: "from-yellow-950/50 via-[#08152e] to-[#040814]",
    perk: "Permanent 2x multiplier on all challenge rewards",
    mascotState: "party"
  }
];

export default function FinnyEvolutionModal({ 
  isOpen, 
  onClose, 
  currentLevel = 1,
  currentXP = 0 
}) {
  if (!isOpen) return null;

  const currentTier = EVOLUTION_TIERS[Math.min(EVOLUTION_TIERS.length - 1, Math.max(0, currentLevel - 1))];

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#071329]/95 rounded-3xl max-w-4xl w-full border border-cyan-500/35 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden relative hud-corner font-mono flex flex-col max-h-[90vh]"
      >
        {/* Accent Top Bar */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 shadow-[0_0_20px_#a855f7]"></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-cyan-500/15 flex items-center justify-between bg-[#050c1b]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-400/40 text-purple-300 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg tracking-tight font-sans">
                  Finny Mascot Evolution Matrix
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  TIER {currentTier.tier} / 8
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Level up your financial discipline to evolve Finny's appearance, aura & superpowers!
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

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 pr-3">
          {/* Active Evolution Hero Showcase */}
          <div className={`p-6 sm:p-8 rounded-3xl border bg-gradient-to-br ${currentTier.bg} ${currentTier.aura} relative overflow-hidden flex flex-col md:flex-row items-center gap-6 text-center md:text-left`}>
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-black/40 border border-white/20 flex items-center justify-center relative shadow-2xl">
                <div className="scale-125">
                  <FinnyMascot state={currentTier.mascotState} size="lg" interactive={true} />
                </div>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-md">
                CURRENT
              </span>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-cyan-300 border border-white/15">
                  Level {currentLevel} Requirement Met
                </span>
                <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {currentTier.title}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white font-sans tracking-tight">
                {currentTier.name}
              </h2>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {currentTier.description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300 font-bold">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlocked Superpower: {currentTier.perk}</span>
              </div>
            </div>
          </div>

          {/* Evolution Progression Ladder (8 Tiers) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Evolution Tree (Levels 1 - 8)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EVOLUTION_TIERS.map((tier) => {
                const isCurrent = tier.tier === currentTier.tier;
                const isUnlocked = currentLevel >= tier.level_req;

                return (
                  <div
                    key={tier.tier}
                    className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/30'
                        : isUnlocked
                        ? 'bg-[#050c18] border-emerald-500/30'
                        : 'bg-[#030712] border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          Tier {tier.tier}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isCurrent 
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' 
                            : isUnlocked 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isCurrent ? 'ACTIVE' : isUnlocked ? 'UNLOCKED' : `REQ. LV.${tier.level_req}`}
                        </span>
                      </div>

                      <h5 className="font-bold text-white text-xs mb-1 font-sans">{tier.name}</h5>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-2 mb-2">
                        {tier.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{tier.perk}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#050c1b] border-t border-cyan-500/15 flex items-center justify-between text-xs text-slate-400 px-6 shrink-0">
          <span>Current Progress: <strong>{currentXP} XP</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            Back to Adventure
          </button>
        </div>
      </motion.div>
    </div>
  );
}
