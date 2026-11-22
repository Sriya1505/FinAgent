import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Trophy } from 'lucide-react';
import { bubbleVariants } from './FinnyAnimations';

/**
 * FinnySpeechBubble.jsx
 * Contextual animated speech bubble for Finny.
 * Supports customizable position (top, bottom, left, right), icons, and quick actions.
 */
export default function FinnySpeechBubble({
  message,
  isVisible = true,
  state = 'idle',
  position = 'top', // 'top' | 'right' | 'left' | 'bottom'
  onClose,
  onActionClick,
  actionLabel,
  className = ''
}) {
  if (!message) return null;

  // Icon badge based on mood
  const getMoodIcon = () => {
    switch (state) {
      case 'celebrating':
        return <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />;
      case 'concerned':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'thinking':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" />;
      case 'excited':
      case 'happy':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>;
    }
  };

  // Position tail classes
  const getTailClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-slate-900 border-l-transparent border-r-transparent border-b-transparent border-t-[6px] border-l-[6px] border-r-[6px] border-b-0';
      case 'right':
        return 'left-[-6px] top-1/2 -translate-y-1/2 border-r-slate-900 border-t-transparent border-b-transparent border-l-transparent border-r-[6px] border-t-[6px] border-b-[6px] border-l-0';
      case 'left':
        return 'right-[-6px] top-1/2 -translate-y-1/2 border-l-slate-900 border-t-transparent border-b-transparent border-r-transparent border-l-[6px] border-t-[6px] border-b-[6px] border-r-0';
      case 'bottom':
      default:
        return 'top-[-6px] left-1/2 -translate-x-1/2 border-b-slate-900 border-l-transparent border-r-transparent border-t-transparent border-b-[6px] border-l-[6px] border-r-[6px] border-t-0';
    }
  };

  // Border glow styling based on mood
  const getGlowBorder = () => {
    switch (state) {
      case 'celebrating':
        return 'border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.25)]';
      case 'concerned':
        return 'border-rose-400/50 shadow-[0_0_25px_rgba(244,63,94,0.25)]';
      case 'thinking':
        return 'border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.25)]';
      default:
        return 'border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.2)]';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`relative z-40 bg-[#091326]/95 backdrop-blur-xl border rounded-2xl p-3 sm:p-3.5 max-w-[280px] sm:max-w-[320px] text-left text-xs ${getGlowBorder()} ${className}`}
        >
          {/* Arrow Tail */}
          <div className={`absolute w-0 h-0 pointer-events-none ${getTailClasses()}`} />

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-cyan-300">
              {getMoodIcon()}
              <span>Finny</span>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                aria-label="Close message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="mt-1 text-slate-100 text-xs sm:text-[13px] leading-relaxed font-sans font-medium">
            {message}
          </p>

          {actionLabel && onActionClick && (
            <button
              type="button"
              onClick={onActionClick}
              className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-cyan-400/30 text-cyan-200 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{actionLabel}</span>
              <span>→</span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
