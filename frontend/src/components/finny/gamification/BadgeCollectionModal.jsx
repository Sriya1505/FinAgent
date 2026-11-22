import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Award, 
  Sparkles, 
  Star, 
  Lock, 
  CheckCircle2, 
  Calendar,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function BadgeCollectionModal({ 
  isOpen, 
  onClose, 
  badges = [] 
}) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  if (!isOpen) return null;

  const safeBadges = Array.isArray(badges) ? badges : (badges?.badges || []);
  const unlockedCount = safeBadges.filter(b => b.is_unlocked).length;

  const getRarityBadge = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'rare': return 'bg-sky-500/20 text-sky-300 border-sky-400/40';
      case 'epic': return 'bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'legendary': return 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#071329]/95 rounded-3xl max-w-4xl w-full border border-amber-500/35 shadow-[0_0_60px_rgba(251,191,36,0.2)] overflow-hidden relative hud-corner font-mono flex flex-col max-h-[90vh]"
      >
        {/* Accent Top Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-purple-500 shadow-[0_0_20px_#fbbf24]"></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-cyan-500/15 flex items-center justify-between bg-[#050c1b]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg tracking-tight font-sans">
                  Finny Badge Showcase
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {unlockedCount} / {safeBadges.length} UNLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Exclusive collectible trophies earned through verified financial discipline.
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 pr-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {safeBadges.map((badge) => {
              const isUnlocked = badge.is_unlocked;
              return (
                <motion.div
                  key={badge.key}
                  whileHover={{ y: -3, scale: 1.02 }}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between text-center overflow-hidden group ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-[#141b34] to-[#070e1e] border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/20'
                      : 'bg-[#040814]/80 border-slate-800/80 opacity-60 hover:opacity-90'
                  }`}
                >
                  {/* Holographic Top Glow if unlocked */}
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-[9px] mb-2 font-bold uppercase">
                      <span className={`px-1.5 py-0.2 rounded border ${getRarityBadge(badge.rarity)}`}>
                        {badge.rarity}
                      </span>
                      {isUnlocked && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    </div>

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
                      {isUnlocked ? badge.icon : '🔒'}
                    </div>

                    <h5 className="font-bold text-white text-xs mb-1 font-sans truncate">
                      {badge.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-sans line-clamp-2 leading-tight">
                      {badge.description}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-cyan-500/10 text-[9px]">
                    <span className={isUnlocked ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                      {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Badge Inspector Panel */}
          {selectedBadge && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#050c18] border border-amber-400/40 relative space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedBadge.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-sm font-sans">{selectedBadge.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getRarityBadge(selectedBadge.rarity)}`}>
                        {selectedBadge.rarity} TIER
                      </span>
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      {selectedBadge.is_unlocked ? `Unlocked on ${selectedBadge.earned_at?.split('T')[0] || 'Ledger Mission'}` : 'Locked Quest Reward'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-200 font-sans text-xs">
                {selectedBadge.description}
              </p>
              <div className="pt-2 border-t border-cyan-500/15 text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Criteria: {selectedBadge.unlock_desc || 'Fulfill challenge conditions in active ledger.'}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#050c1b] border-t border-cyan-500/15 flex items-center justify-between text-xs text-slate-400 px-6 shrink-0">
          <span>Badge Mastery: <strong>{Math.round((unlockedCount / badges.length) * 100)}%</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 border border-amber-400/40 text-amber-300 font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            Close Collection
          </button>
        </div>
      </motion.div>
    </div>
  );
}
