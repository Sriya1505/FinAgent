import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Award, 
  Zap, 
  Gift, 
  CheckCircle2, 
  Lock,
  Star,
  ChevronRight
} from 'lucide-react';
import FinnyMascot from '../FinnyMascot';

export default function FinnyTreasureBoxModal({ 
  isOpen, 
  onClose, 
  availableBoxes = 0,
  completedChallengesCount = 0,
  onOpenBox 
}) {
  const [opening, setOpening] = useState(false);
  const [openedResult, setOpenedResult] = useState(null);

  if (!isOpen) return null;

  const handleOpenClick = async () => {
    if (availableBoxes <= 0) return;
    setOpening(true);
    try {
      const res = await onOpenBox();
      setTimeout(() => {
        setOpenedResult(res);
        setOpening(false);
      }, 1200);
    } catch {
      setOpening(false);
    }
  };

  const handleReset = () => {
    setOpenedResult(null);
    onClose();
  };

  const challengesUntilNext = 3 - (completedChallengesCount % 3);

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-panel-glow hud-corner rounded-3xl max-w-md w-full border border-purple-500/40 p-6 sm:p-8 space-y-6 bg-gradient-to-b from-[#110f2e] via-[#091124] to-[#040814] text-center font-mono relative overflow-hidden shadow-2xl"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
              MYSTERY VAULT
            </span>
            <span className="text-[10px] text-amber-400 font-bold">
              ★ {availableBoxes} Chest{availableBoxes === 1 ? '' : 's'} Ready
            </span>
          </div>
          <h3 className="text-xl font-black text-white font-sans tracking-tight">
            Finny's Mystery Treasure Chest
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Complete 3 financial challenges to unlock a mystery chest packed with XP, badges & secret blessings!
          </p>
        </div>

        {/* Mystery Chest Center Stage */}
        <div className="py-4">
          {!openedResult ? (
            <motion.div 
              animate={opening ? { 
                scale: [1, 1.15, 0.95, 1.2, 1],
                rotate: [0, -8, 8, -12, 12, 0]
              } : { 
                y: [0, -6, 0] 
              }}
              transition={{ repeat: opening ? Infinity : Infinity, duration: opening ? 0.4 : 3 }}
              className="relative inline-block cursor-pointer"
              onClick={handleOpenClick}
            >
              <div className={`w-32 h-32 rounded-3xl mx-auto flex items-center justify-center text-6xl shadow-2xl relative transition-all ${
                availableBoxes > 0
                  ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 border-2 border-amber-300 shadow-[0_0_40px_rgba(168,85,247,0.6)]'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-600'
              }`}>
                {opening ? '✨' : availableBoxes > 0 ? '🎁' : '🔒'}
              </div>

              {availableBoxes > 0 && !opening && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase shadow-lg animate-pulse whitespace-nowrap">
                  Click to Open!
                </span>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3"
            >
              <div className="text-5xl animate-bounce">🏆</div>
              <h4 className="text-lg font-black text-white font-sans">
                Chest Opened!
              </h4>
              <div className="p-3 rounded-xl bg-[#040814] border border-cyan-500/20 text-cyan-300 text-xs">
                <span className="text-amber-400 font-bold block text-base mb-1">
                  +{openedResult.mystery_xp} Bonus XP Awarded!
                </span>
                <p className="text-slate-300 font-sans italic text-[11px]">
                  "{openedResult.finny_phrase}"
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Progress Tracker to Next Chest */}
        <div className="p-3.5 rounded-2xl bg-[#050c18] border border-purple-500/20 text-xs space-y-2">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Challenges Completed:</span>
            <strong className="text-white">{completedChallengesCount}</strong>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all"
              style={{ width: `${((completedChallengesCount % 3) / 3) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-purple-300 text-center">
            {challengesUntilNext === 3 
              ? '✨ Chest ready or unlocked at next milestone!' 
              : `Complete ${challengesUntilNext} more challenge${challengesUntilNext > 1 ? 's' : ''} for the next mystery chest.`}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {openedResult ? (
            <button
              onClick={handleReset}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
            >
              Awesome! Return to Adventure
            </button>
          ) : (
            <button
              disabled={availableBoxes <= 0 || opening}
              onClick={handleOpenClick}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{opening ? 'Unlocking Mystery...' : availableBoxes > 0 ? 'Unlock Mystery Chest' : 'Chest Locked'}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
