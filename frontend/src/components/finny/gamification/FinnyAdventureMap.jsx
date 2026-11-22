import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  X, 
  Award,
  Zap,
  Layers,
  Crown
} from 'lucide-react';
import FinnyMascot from '../FinnyMascot';

export default function FinnyAdventureMap({ 
  mapNodes = [], 
  currentLevel = 1, 
  currentNodeIndex = 0,
  onNodeSelect 
}) {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="glass-panel-glow hud-corner p-6 sm:p-7 rounded-3xl border border-cyan-500/30 space-y-6 bg-gradient-to-br from-[#060e1d] to-[#040814] relative overflow-hidden shadow-2xl">
      {/* Background Top Aura */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/15 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Compass className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-lg tracking-tight">
                Finny's Financial Adventure Map
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
                WORLD QUEST
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Conquer financial challenges to advance Finny from the Savings Shore to the Financial Freedom Sanctuary!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#050c18] px-3.5 py-2 rounded-2xl border border-cyan-500/20">
          <span className="text-slate-400">Current Station:</span>
          <strong className="text-cyan-300 font-bold">
            {mapNodes[Math.min(mapNodes.length - 1, currentLevel - 1)]?.name || 'Savings Shore'}
          </strong>
        </div>
      </div>

      {/* Visual Adventure Map Path */}
      <div className="relative py-8 px-4 sm:px-8 bg-[#040813]/90 rounded-3xl border border-cyan-500/20 shadow-inner overflow-x-auto">
        {/* Connecting Neon Path Line */}
        <div className="absolute top-1/2 left-10 right-10 h-1.5 -translate-y-1/2 bg-slate-800 rounded-full hidden md:block">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, ((currentLevel - 1) / (mapNodes.length - 1)) * 100)}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-500 rounded-full shadow-[0_0_15px_#22d3ee]"
          />
        </div>

        {/* 8 Adventure Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-3 relative z-10 min-w-[700px] lg:min-w-0">
          {mapNodes.map((node, index) => {
            const isUnlocked = currentLevel >= node.level_req;
            const isCurrent = (currentLevel - 1) === index;
            const isCompleted = currentLevel > node.level_req;

            return (
              <motion.div
                key={node.id}
                whileHover={{ scale: 1.05, y: -4 }}
                onClick={() => setSelectedNode(node)}
                className={`flex flex-col items-center text-center cursor-pointer group transition-all relative ${
                  isCurrent 
                    ? 'scale-105' 
                    : !isUnlocked 
                    ? 'opacity-50 hover:opacity-80' 
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                {/* Active Finny Mascot Marker */}
                {isCurrent && (
                  <div className="absolute -top-12 z-20 flex flex-col items-center animate-bounce">
                    <div className="w-9 h-9 rounded-full bg-purple-500/30 border border-purple-400 flex items-center justify-center shadow-[0_0_15px_#a855f7]">
                      <FinnyMascot state="happy" size="xs" interactive={false} />
                    </div>
                    <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-purple-400"></div>
                  </div>
                )}

                {/* Node Orb */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative shadow-lg ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-cyan-300 text-white shadow-[0_0_25px_rgba(6,182,212,0.8)] ring-4 ring-cyan-500/20'
                    : isCompleted
                    ? 'bg-[#091833] border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : isUnlocked
                    ? 'bg-[#09152b] border border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : isCurrent ? (
                    <Sparkles className="w-6 h-6 text-white" />
                  ) : isUnlocked ? (
                    <span className="font-mono font-black text-sm">{index + 1}</span>
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500" />
                  )}

                  {/* Level requirement badge */}
                  <span className="absolute -bottom-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-[#040814] border border-cyan-500/30 text-cyan-300">
                    Lv.{node.level_req}
                  </span>
                </div>

                {/* Node Label */}
                <div className="mt-3.5 space-y-0.5">
                  <h5 className={`text-xs font-bold truncate max-w-[100px] ${
                    isCurrent ? 'text-cyan-300' : isUnlocked ? 'text-white' : 'text-slate-400'
                  }`}>
                    {node.name}
                  </h5>
                  <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[100px]">
                    {node.region}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl bg-[#050c18] border border-cyan-500/30 relative overflow-hidden space-y-3 font-mono text-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-white text-sm">
                      {selectedNode.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentLevel >= selectedNode.level_req 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {currentLevel >= selectedNode.level_req ? 'UNLOCKED' : `LOCKED (Req. Lv.${selectedNode.level_req})`}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">Region: {selectedNode.region} · Landmark: {selectedNode.landmark}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              {selectedNode.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-cyan-500/15 text-[11px]">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Regional Lore & Mastery Checkpoint
              </span>
              <span className="text-slate-400">
                {currentLevel >= selectedNode.level_req 
                  ? '✓ Discovered & explored on your ledger voyage' 
                  : `Earn ${Math.max(0, (selectedNode.level_req * 100) - 50)} more XP to reach this zone.`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
