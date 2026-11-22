import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  RotateCw, 
  Sparkles, 
  Zap, 
  Award, 
  CheckCircle2, 
  Clock,
  Compass
} from 'lucide-react';

const WHEEL_SECTORS = [
  { label: "Quick Save ₹100", xp: 30, color: "from-sky-500 to-blue-600", icon: "🪙" },
  { label: "Audit Subscriptions", xp: 45, color: "from-purple-500 to-indigo-600", icon: "🔍" },
  { label: "Cook at Home Today", xp: 50, color: "from-emerald-500 to-teal-600", icon: "🍳" },
  { label: "Jackpot: Mystery Chest", xp: 100, color: "from-amber-400 to-yellow-600", icon: "🎁" },
  { label: "Track Daily Balance", xp: 25, color: "from-cyan-400 to-sky-600", icon: "📊" },
  { label: "Dining Cap Review", xp: 35, color: "from-rose-500 to-pink-600", icon: "🥗" },
  { label: "Finny Hug & Streak", xp: 40, color: "from-fuchsia-500 to-purple-600", icon: "💜" },
  { label: "Double XP Surge", xp: 75, color: "from-teal-400 to-emerald-600", icon: "⚡" }
];

export default function DailySpinModal({ 
  isOpen, 
  onClose, 
  isReady = true, 
  onSpin 
}) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState(null);

  if (!isOpen) return null;

  const handleSpinClick = async () => {
    if (!isReady || spinning) return;
    setSpinning(true);

    try {
      const res = await onSpin();
      // Animate rotation (at least 5 full rotations + random angle)
      const randomExtra = Math.floor(Math.random() * 360);
      const totalDegrees = 1800 + randomExtra;
      setRotation(prev => prev + totalDegrees);

      setTimeout(() => {
        setSpinning(false);
        setSpinResult(res);
      }, 3500);
    } catch {
      setSpinning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-panel-glow hud-corner rounded-3xl max-w-md w-full border border-cyan-500/40 p-6 sm:p-7 space-y-6 bg-gradient-to-b from-[#081730] via-[#050f24] to-[#040814] text-center font-mono relative overflow-hidden shadow-2xl"
      >
        {/* Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              DAILY WHEEL OF DISCIPLINE
            </span>
          </div>
          <h3 className="text-xl font-black text-white font-sans tracking-tight">
            Daily Spin Mission
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Spin once every 24 hours to receive Finny's daily mini mission & bonus XP!
          </p>
        </div>

        {/* Visual Cyber Roulette Wheel */}
        <div className="relative py-2 flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute top-0 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_0_8px_#fbbf24]"></div>

          {/* Rotating Disc */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3.5, ease: [0.15, 0.9, 0.3, 1] }}
            className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.4)] relative overflow-hidden bg-[#040814] flex items-center justify-center"
          >
            {WHEEL_SECTORS.map((sector, index) => {
              const angle = (360 / WHEEL_SECTORS.length) * index;
              return (
                <div
                  key={index}
                  style={{ transform: `rotate(${angle}deg)` }}
                  className="absolute inset-0 origin-center flex justify-center pt-2"
                >
                  <div className="text-center space-y-0.5">
                    <span className="text-xl block">{sector.icon}</span>
                    <span className="text-[9px] font-black text-cyan-200 block tracking-tight uppercase max-w-[50px] leading-tight">
                      +{sector.xp} XP
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Center Finny Hub */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-white text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-2xl relative z-10">
              <Sparkles className="w-5 h-5 fill-slate-950" />
              <span className="text-[8px] uppercase">SPIN</span>
            </div>
          </motion.div>
        </div>

        {/* Spin Outcome Showcase */}
        <AnimatePresence>
          {spinResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/50 space-y-2"
            >
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
                <span>{spinResult.outcome?.icon}</span>
                <span>{spinResult.outcome?.label}</span>
                <span className="text-cyan-300">+{spinResult.bonus_xp} XP!</span>
              </div>
              <p className="text-xs text-slate-200 font-sans">
                {spinResult.outcome?.tip}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <div>
          {isReady && !spinResult ? (
            <button
              disabled={spinning}
              onClick={handleSpinClick}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:opacity-95 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
              <span>{spinning ? 'Calibrating Destiny...' : 'Spin the Wheel of Discipline!'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 border border-cyan-500/30 hover:bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {spinResult ? 'Claim & Continue Journey' : 'Come Back Tomorrow for Next Spin'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
