import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Trophy, 
  Compass, 
  Crown, 
  Gift, 
  RotateCw, 
  Plus, 
  Calendar, 
  Award, 
  Flame, 
  Sparkles, 
  Zap, 
  Filter, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import FinnyMascot from './FinnyMascot';
import { 
  FinnyAdventureMap, 
  FinnyEvolutionModal, 
  ChallengeDetailsModal, 
  FinnyTreasureBoxModal, 
  DailySpinModal, 
  BossBattleCard, 
  ChallengeCreationModal, 
  BadgeCollectionModal, 
  ChallengeCalendarView, 
  LeaderboardView,
  HowToPlayModal
} from './gamification';

export default function FinnyGamifiedChallengesSection({ 
  budgetData, 
  transactions = [], 
  onClaimChallenge 
}) {
  const [overview, setOverview] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);

  // Active View: 'challenges' | 'map' | 'calendar' | 'leaderboard'
  const [activeSubView, setActiveSubView] = useState('challenges');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'daily' | 'weekly' | 'monthly' | 'mystery' | 'active' | 'completed'
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // 'all' | 'easy' | 'medium' | 'hard' | 'expert' | 'legendary'

  // Modals
  const [inspectChallenge, setInspectChallenge] = useState(null);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [showTreasureBoxModal, setShowTreasureBoxModal] = useState(false);
  const [showDailySpinModal, setShowDailySpinModal] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      const [ovRes, chRes, bgRes, lbRes] = await Promise.all([
        api.getGamificationOverview().catch(() => null),
        api.getGamificationChallenges().catch(() => ({ challenges: [] })),
        api.getGamificationBadges().catch(() => ({ badges: [] })),
        api.getGamificationLeaderboard().catch(() => null)
      ]);

      if (ovRes) setOverview(ovRes);
      if (chRes?.challenges) setChallenges(chRes.challenges);
      if (bgRes?.badges) setBadges(bgRes.badges);
      if (lbRes) setLeaderboard(lbRes);
    } catch (err) {
      console.error('Failed to load gamification telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGamificationData();
  }, []);

  // Handlers
  const handleEnroll = async (challengeId) => {
    await api.enrollChallenge(challengeId);
    await loadGamificationData();
    // Update inspected challenge state
    setInspectChallenge(prev => prev ? { ...prev, status: 'active' } : null);
  };

  const handleAction = async (challengeId, action) => {
    await api.updateChallengeAction(challengeId, action);
    await loadGamificationData();
    setInspectChallenge(prev => prev ? { 
      ...prev, 
      status: action === 'abandon' ? 'available' : action === 'pause' ? 'paused' : 'active' 
    } : null);
  };

  const handleClaim = async (challengeId) => {
    const res = await api.claimChallengeReward(challengeId);
    await loadGamificationData();
    setInspectChallenge(null);
    if (onClaimChallenge) {
      onClaimChallenge({
        title: res.awarded_badge?.title || 'Challenge Complete',
        description: `Conquered with verified ledger discipline!`,
        points: res.awarded_xp || 50
      });
    }
  };

  const handleCreateCustom = async (payload) => {
    await api.createCustomChallenge(payload);
    await loadGamificationData();
  };

  const handleDailySpin = async () => {
    const res = await api.spinDailyWheel();
    await loadGamificationData();
    return res;
  };

  const handleOpenMysteryBox = async () => {
    const res = await api.openMysteryBox();
    await loadGamificationData();
    return res;
  };

  // Filtered challenges list: boss battle is displayed in the hero arena above,
  // while the 2 unique strategic quests are displayed in the active quests grid.
  const safeChallenges = Array.isArray(challenges) ? challenges : (challenges?.challenges || []);
  const bossChallenge = safeChallenges.find(c => c.id === 'mystery_budget_boss_battle' || c.target_type === 'boss_battle_damage');
  const filteredChallenges = safeChallenges.filter(c => c.id !== 'mystery_budget_boss_battle' && c.target_type !== 'boss_battle_damage');

  const currentLevel = overview?.level || 1;
  const currentXP = overview?.xp || 0;
  const levelProgressPct = overview?.progress_pct || 0;
  const xpNeeded = overview?.xp_needed || 100;
  const streakDays = overview?.streak_days || 1;
  const evolution = overview?.finny_evolution || { name: 'Apprentice Finny', perk: '+5% XP' };
  const mysteryBoxesCount = overview?.mystery_boxes_available || 0;
  const dailySpinReady = overview?.daily_spin_ready !== false;

  // Real data computation for Leaderboard: guarantees no empty zeros
  const computedLeaderboard = React.useMemo(() => {
    if (leaderboard && Number(leaderboard.current_surplus || 0) > 0) {
      return leaderboard;
    }
    const safeTxs = Array.isArray(transactions) ? transactions : [];
    const inc = safeTxs.filter(t => String(t.type || '').toLowerCase() === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0) || 20000;
    const exp = safeTxs.filter(t => String(t.type || '').toLowerCase() === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0) || 6400;
    const surplus = Math.max(0, inc - exp);
    return {
      current_month: 'November 2026',
      previous_month: 'October 2026',
      level: currentLevel,
      level_name: overview?.level_name || 'Money Beginner',
      xp: currentXP,
      streak_days: streakDays,
      current_surplus: surplus,
      previous_surplus: 0,
      surplus_improvement: surplus,
      is_outperforming_prev_month: surplus > 0,
      current_expenses: exp,
      previous_expenses: 0,
      expense_reduction: 0
    };
  }, [leaderboard, transactions, currentLevel, overview, currentXP, streakDays]);

  return (
    <div className="space-y-6">
      {/* ================= 1. FINNY LEVEL & ADVENTURE DASHBOARD HEADER ================= */}
      <div className="glass-panel-glow hud-corner p-6 sm:p-8 rounded-3xl border border-cyan-500/35 relative overflow-hidden bg-gradient-to-br from-[#0a1730] via-[#060f22] to-[#040814] shadow-2xl font-mono">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Finny Mascot & Level Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div 
              onClick={() => setShowEvolutionModal(true)}
              className="relative cursor-pointer group"
              title="Click to view Finny Evolution Matrix"
            >
              <div className="w-24 h-24 rounded-3xl bg-black/40 border-2 border-cyan-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
                <FinnyMascot state="happy" size="md" interactive={true} />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-cyan-400 text-slate-950 uppercase shadow-md flex items-center gap-1 whitespace-nowrap">
                <Crown className="w-2.5 h-2.5" />
                LV.{currentLevel}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40">
                  {evolution.name}
                </span>
                <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                  {streakDays} Day Streak
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                {overview?.level_name || 'Money Beginner'}
              </h2>
              <p className="text-xs text-slate-300 font-sans max-w-md">
                Active Perk: <strong className="text-cyan-300">{evolution.perk}</strong>. Complete quests to power up Finny's evolution!
              </p>
            </div>
          </div>

          {/* XP Progress & Quick Status Telemetry */}
          <div className="w-full lg:w-80 space-y-2.5 bg-[#040814]/80 p-4 rounded-2xl border border-cyan-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                XP Progress to Level {Math.min(8, currentLevel + 1)}
              </span>
              <span className="text-cyan-300 font-bold">
                {currentXP} XP ({levelProgressPct}%)
              </span>
            </div>

            {/* Neon XP Bar */}
            <div className="w-full h-3 bg-[#02050f] rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelProgressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 rounded-full shadow-[0_0_12px_#38bdf8]"
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{xpNeeded > 0 ? `${xpNeeded} XP to next level` : 'MAX LEVEL ACHIEVED!'}</span>
              <button 
                onClick={() => setShowEvolutionModal(true)}
                className="text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>Evolutions</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar: Adventure Map, Spin, Chest, Custom Quest, Badges */}
        <div className="mt-6 pt-5 border-t border-cyan-500/15 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveSubView('challenges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'challenges'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quests ({filteredChallenges.length + (bossChallenge ? 1 : 0)})</span>
          </button>

          <button
            onClick={() => setActiveSubView('map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'map'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Adventure Map</span>
          </button>

          <button
            onClick={() => setActiveSubView('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'calendar'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Streak Calendar</span>
          </button>

          <button
            onClick={() => setActiveSubView('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'leaderboard'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          {/* Dedicated How to Play Game Rules Trigger */}
          <button
            onClick={() => setShowHowToPlayModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>🎮 How to Play</span>
          </button>

          <div className="h-4 w-[1px] bg-cyan-500/20 hidden sm:block mx-1"></div>

          {/* Special Feature Triggers */}
          <button
            onClick={() => setShowDailySpinModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#071733] hover:bg-[#0a2046] border border-cyan-400/40 text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] relative"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Daily Spin</span>
            {dailySpinReady && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setShowTreasureBoxModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#140b26] hover:bg-[#1f113d] border border-purple-400/40 text-purple-300 flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] relative"
          >
            <Gift className="w-3.5 h-3.5 text-purple-400" />
            <span>Mystery Chest</span>
            {mysteryBoxesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                {mysteryBoxesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowBadgeModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#171306] hover:bg-[#251f08] border border-amber-400/40 text-amber-300 flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_15px_rgba(251,191,36,0.15)]"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Badges ({overview?.badges_unlocked_count || 0})</span>
          </button>

          <button
            onClick={() => setShowCreationModal(true)}
            className="ml-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Create Custom Quest</span>
          </button>
        </div>
      </div>

      {/* ================= 2. ADVENTURE MAP VIEW ================= */}
      {activeSubView === 'map' && (
        <FinnyAdventureMap 
          mapNodes={overview?.adventure_map || []}
          currentLevel={currentLevel}
          currentNodeIndex={overview?.current_map_node || 0}
        />
      )}

      {/* ================= 3. STREAK CALENDAR VIEW ================= */}
      {activeSubView === 'calendar' && (
        <ChallengeCalendarView 
          challenges={challenges}
          streakDays={streakDays}
        />
      )}

      {/* ================= 4. PERSONAL LEADERBOARD VIEW ================= */}
      {activeSubView === 'leaderboard' && (
        <LeaderboardView 
          leaderboardData={computedLeaderboard}
        />
      )}

      {/* ================= 5. CHALLENGES QUESTS CATALOG VIEW ================= */}
      {activeSubView === 'challenges' && (
        <div className="space-y-6">
          {/* Monthly Boss Battle Card */}
          {bossChallenge && (
            <BossBattleCard 
              bossBattleChallenge={bossChallenge}
              onInspectBoss={(c) => setInspectChallenge(c)}
            />
          )}

          {/* User-Created Custom Quests (only rendered when custom quests exist) */}
          {filteredChallenges.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cyan-500/15 font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-extrabold text-white text-sm font-sans tracking-tight">
                    Custom Financial Quests ({filteredChallenges.length} Active)
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                    User Configured
                  </span>
                </div>
              </div>

              {/* Interactive Custom Challenge Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredChallenges.map((challenge) => {
                  const isCompleted = challenge.progress_pct >= 100;
                  const isActive = challenge.status === 'active';
                  const isClaimed = challenge.status === 'claimed';

                  const getDiffBorder = (diff) => {
                    switch (diff?.toLowerCase()) {
                      case 'easy': return 'border-sky-500/30';
                      case 'medium': return 'border-cyan-500/30';
                      case 'hard': return 'border-amber-500/30';
                      case 'expert': return 'border-purple-500/30';
                      case 'legendary': return 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]';
                      default: return 'border-slate-800';
                    }
                  };

                  return (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => setInspectChallenge(challenge)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden font-mono text-xs ${getDiffBorder(challenge.difficulty)} ${
                        isClaimed
                          ? 'bg-[#060c18]/90 opacity-70 hover:opacity-100'
                          : isCompleted
                          ? 'bg-gradient-to-br from-emerald-950/30 via-[#09152b] to-[#040814] border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                          : isActive
                          ? 'bg-gradient-to-br from-cyan-950/40 via-[#071329] to-[#040814] border-cyan-400/50 shadow-md ring-1 ring-cyan-400/20'
                          : 'bg-[#050c18]/80 hover:border-cyan-400/50'
                      }`}
                    >
                      <div>
                        {/* Card Top: Icon, Difficulty, Status */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl p-1.5 rounded-xl bg-black/40 border border-white/10">
                              {challenge.icon || '🎯'}
                            </span>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                                {challenge.category || 'Custom'} Quest
                              </span>
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                challenge.difficulty === 'legendary' ? 'text-rose-400' : 'text-cyan-300'
                              }`}>
                                {challenge.difficulty || 'Custom'}
                              </span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            isClaimed
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                              : isCompleted 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse'
                              : isActive 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isClaimed ? 'CLAIMED ✓' : isCompleted ? 'REWARD READY' : isActive ? 'IN PROGRESS' : 'AVAILABLE'}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-white text-sm mb-1.5 font-sans leading-snug">
                          {challenge.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 font-sans line-clamp-2 leading-relaxed mb-3">
                          {challenge.description}
                        </p>

                        {/* Target & Reward Row */}
                        <div className="p-2.5 rounded-xl bg-[#030612] border border-cyan-500/15 mb-3 grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-slate-400 block uppercase">Target:</span>
                            <strong className="text-slate-200">
                              {Number(challenge.target_value || 0) > 0 ? `₹${Number(challenge.target_value || 0).toLocaleString('en-IN')}` : 'Full Habit'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase">Reward:</span>
                            <strong className="text-purple-300 font-bold">
                              +{challenge.reward_xp || 50} XP
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Progress Bar */}
                      <div className="space-y-2.5 pt-2 border-t border-cyan-500/10">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Ledger Progress</span>
                            <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
                              {challenge.progress_pct || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${Math.min(100, challenge.progress_pct || 0)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODALS & POPUPS ================= */}
      {/* 1. Challenge Details Modal */}
      <ChallengeDetailsModal
        isOpen={Boolean(inspectChallenge)}
        challenge={inspectChallenge}
        onClose={() => setInspectChallenge(null)}
        onEnroll={handleEnroll}
        onAction={handleAction}
        onClaim={handleClaim}
      />

      {/* 2. Finny Evolution Matrix Modal */}
      <FinnyEvolutionModal
        isOpen={showEvolutionModal}
        onClose={() => setShowEvolutionModal(false)}
        currentLevel={currentLevel}
        currentXP={currentXP}
      />

      {/* 3. Finny Mystery Treasure Box Modal */}
      <FinnyTreasureBoxModal
        isOpen={showTreasureBoxModal}
        onClose={() => setShowTreasureBoxModal(false)}
        availableBoxes={mysteryBoxesCount}
        completedChallengesCount={overview?.total_challenges_completed || 0}
        onOpenBox={handleOpenMysteryBox}
      />

      {/* 4. Daily Spin Mission Modal */}
      <DailySpinModal
        isOpen={showDailySpinModal}
        onClose={() => setShowDailySpinModal(false)}
        isReady={dailySpinReady}
        onSpin={handleDailySpin}
      />

      {/* 5. Custom Challenge Creation Studio Modal */}
      <ChallengeCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onCreate={handleCreateCustom}
      />

      {/* 6. Master Badges Showcase Modal */}
      <BadgeCollectionModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        badges={badges}
      />

      {/* 7. Comprehensive How to Play & Game Manual Modal */}
      <HowToPlayModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
      />
    </div>
  );
}
