import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  ArrowUpRight, 
  X, 
  Receipt, 
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import FinnyMascot from './FinnyMascot';

/**
 * Section A & B: Finny Contextual Reactions for Every Individual Budget
 */
export const getBudgetFinnyReaction = (utilizationPct, category) => {
  let state = 'happy';
  let message = "Great start! You're managing your money wisely! 💚";
  let moodTag = "Healthy Runway";
  let moodColor = "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";

  if (utilizationPct > 100) {
    state = 'concerned';
    message = "We've exceeded this budget. Let's make a better plan next month!";
    moodTag = "Budget Exceeded";
    moodColor = "text-rose-400 bg-rose-500/15 border-rose-500/30";
  } else if (utilizationPct === 100) {
    state = 'concerned';
    message = "Oops! You've reached your budget limit.";
    moodTag = "Limit Reached";
    moodColor = "text-rose-400 bg-rose-500/15 border-rose-500/30";
  } else if (utilizationPct >= 91) {
    state = 'concerned';
    message = "Almost there! Think twice before spending.";
    moodTag = "Critical Zone";
    moodColor = "text-rose-400 bg-rose-500/15 border-rose-500/30";
  } else if (utilizationPct >= 76) {
    state = 'concerned';
    message = "Careful! You're getting close to your budget limit.";
    moodTag = "Caution Zone";
    moodColor = "text-amber-400 bg-amber-500/15 border-amber-500/30";
  } else if (utilizationPct >= 51) {
    state = 'thinking';
    message = "Halfway through your budget! Let's stay on track.";
    moodTag = "Pacing Well";
    moodColor = "text-cyan-400 bg-cyan-500/15 border-cyan-500/30";
  } else if (utilizationPct >= 26) {
    state = 'happy';
    message = "You're doing amazing! Keep it up!";
    moodTag = "Optimal Spend";
    moodColor = "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
  } else {
    state = 'happy';
    message = "Great start! You're managing your money wisely! 💚";
    moodTag = "Great Start";
    moodColor = "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
  }

  // Section B: Category Personalities
  const categoryPersonalities = {
    'Food & Dining': "That meal looks expensive! Let's balance eating out with savings.",
    'Shopping': "Another shopping adventure? Let's check your remaining budget!",
    'Entertainment': "Enjoy yourself, but don't forget your financial goals!",
    'Transportation': "Your travel expenses are increasing. Let's review them.",
    'Education': "Investing in yourself is always valuable!",
    'Healthcare': "Your well-being matters. Keep track of these expenses.",
    'Travel': "Adventure is exciting! Let's save for the next trip.",
    'Bills & Utilities': "Essential overhead! Pay on time to avoid late fees.",
    'Other Expenses': "Let's understand where your money is going."
  };

  const categoryAdvice = categoryPersonalities[category] || "Keep managing this category with discipline!";

  return { state, message, categoryAdvice, moodTag, moodColor };
};

/**
 * Section C: Gamification Badges List
 */
export const BUDGET_ACHIEVEMENTS = [
  {
    id: 'budget_champion',
    title: 'Budget Champion',
    description: 'Stay within all your monthly category budgets without exceeding limits.',
    icon: '🏆',
    points: 100,
    check: (budgetData) => {
      const budgets = budgetData?.budgets || [];
      return budgets.length > 0 && budgets.every(b => (b.utilization_pct || 0) <= 100);
    },
    getProgress: (budgetData) => {
      const budgets = budgetData?.budgets || [];
      if (!budgets.length) return 0;
      const safe = budgets.filter(b => (b.utilization_pct || 0) <= 100).length;
      return Math.round((safe / budgets.length) * 100);
    }
  },
  {
    id: 'smart_saver',
    title: 'Smart Saver',
    description: 'Keep your total monthly expenditure strictly below 80% of total allocated budget.',
    icon: '💎',
    points: 80,
    check: (budgetData) => {
      const totalBudget = budgetData?.total_budget || 0;
      const totalSpent = budgetData?.total_spent || 0;
      return totalBudget > 0 && (totalSpent / totalBudget) <= 0.8;
    },
    getProgress: (budgetData) => {
      const totalBudget = budgetData?.total_budget || 0;
      const totalSpent = budgetData?.total_spent || 0;
      if (!totalBudget) return 0;
      const util = (totalSpent / totalBudget);
      return util <= 0.8 ? 100 : Math.max(0, Math.round((1 - (util - 0.8) / 0.2) * 100));
    }
  },
  {
    id: 'consistency_star',
    title: 'Consistency Star',
    description: 'Maintain and track active spending limits across at least 3 distinct categories.',
    icon: '⭐',
    points: 60,
    check: (budgetData) => (budgetData?.budgets || []).length >= 3,
    getProgress: (budgetData) => {
      const count = (budgetData?.budgets || []).length;
      return Math.min(100, Math.round((count / 3) * 100));
    }
  },
  {
    id: 'savings_hero',
    title: 'Savings Hero',
    description: 'Achieve 100% completion on at least one registered savings target.',
    icon: '🎯',
    points: 120,
    check: (budgetData, dashboardData) => {
      const goals = dashboardData?.savings_goals || [];
      return goals.some(g => (g.progress_pct || 0) >= 100);
    },
    getProgress: (budgetData, dashboardData) => {
      const goals = dashboardData?.savings_goals || [];
      if (!goals.length) return 0;
      const maxProg = Math.max(...goals.map(g => g.progress_pct || 0));
      return Math.min(100, Math.round(maxProg));
    }
  },
  {
    id: 'expense_tracker',
    title: 'Expense Tracker',
    description: 'Consistently log 5 or more financial transactions into your verified ledger.',
    icon: '📝',
    points: 50,
    check: (budgetData, dashboardData, txCount) => (txCount || 0) >= 5,
    getProgress: (budgetData, dashboardData, txCount) => {
      return Math.min(100, Math.round(((txCount || 0) / 5) * 100));
    }
  }
];

/**
 * Section F: Interactive Monthly Challenges
 */
export const BUDGET_CHALLENGES = [
  {
    id: 'no_spend_day',
    title: 'No-Spend Day Challenge',
    category: 'Discipline',
    description: 'Go 24 hours without non-essential spending to build cashflow buffer.',
    reward: 'Zen Saver Badge + 50 Pts',
    icon: '🚫💳',
    target: '0 discretionary transactions today',
    calcProgress: (budgetData, txs) => {
      const safeTxs = Array.isArray(txs) ? txs : (txs?.transactions || []);
      const today = new Date().toISOString().split('T')[0];
      const todayNonEssential = safeTxs.filter(t => t.date === today && t.type === 'expense' && t.category !== 'Bills & Utilities');
      return todayNonEssential.length === 0 ? 100 : 0;
    }
  },
  {
    id: 'save_10_percent',
    title: 'Save 10% Challenge',
    category: 'Optimization',
    description: 'Maintain total monthly spending at least 10% below allocated budget cap.',
    reward: '10% Margin Star + 75 Pts',
    icon: '📉💰',
    target: 'Spend <= 90% of total budget',
    calcProgress: (budgetData) => {
      const totalBudget = budgetData?.total_budget || 0;
      const totalSpent = budgetData?.total_spent || 0;
      if (!totalBudget) return 0;
      const util = (totalSpent / totalBudget) * 100;
      return util <= 90 ? 100 : Math.max(0, Math.round((1 - (util - 90) / 10) * 100));
    }
  },
  {
    id: 'reduce_food_expenses',
    title: 'Food Expenses Control',
    category: 'Food & Dining',
    description: 'Keep Food & Dining spend strictly below 75% of your assigned monthly cap.',
    reward: 'Gourmet Saver Badge + 60 Pts',
    icon: '🥗',
    target: 'Food utilization <= 75%',
    calcProgress: (budgetData) => {
      const food = (budgetData?.budgets || []).find(b => b.category === 'Food & Dining');
      if (!food) return 0;
      const util = food.utilization_pct || 0;
      return util <= 75 ? 100 : Math.max(0, Math.round((1 - (util - 75) / 25) * 100));
    }
  },
  {
    id: 'shopping_control',
    title: 'Shopping Control Challenge',
    category: 'Shopping',
    description: 'Keep your shopping expenditure under 50% of your allocated monthly limit.',
    reward: 'Mindful Buyer Badge + 70 Pts',
    icon: '🛍️',
    target: 'Shopping utilization <= 50%',
    calcProgress: (budgetData) => {
      const shopping = (budgetData?.budgets || []).find(b => b.category === 'Shopping');
      if (!shopping) return 0;
      const util = shopping.utilization_pct || 0;
      return util <= 50 ? 100 : Math.max(0, Math.round((1 - (util - 50) / 50) * 100));
    }
  },
  {
    id: 'seven_day_tracking',
    title: '7-Day Expense Tracking Challenge',
    category: 'Habits',
    description: 'Record financial transactions across at least 4 distinct dates this month.',
    reward: 'Auditor Badge + 80 Pts',
    icon: '📅',
    target: 'Log entries on 4+ dates',
    calcProgress: (budgetData, txs) => {
      const safeTxs = Array.isArray(txs) ? txs : (txs?.transactions || []);
      const dates = new Set(safeTxs.map(t => t.date));
      return Math.min(100, Math.round((dates.size / 4) * 100));
    }
  }
];

/**
 * Monthly Financial Health Score Calculator
 */
export const calculateHealthScore = (budgetData, dashboardData, txCount) => {
  const budgets = budgetData?.budgets || [];
  const totalBudget = budgetData?.total_budget || 0;
  const totalSpent = budgetData?.total_spent || 0;

  // 1. Budget Discipline (0-40 pts)
  let budgetScore = 40;
  if (totalBudget > 0) {
    const overallUtil = (totalSpent / totalBudget) * 100;
    if (overallUtil > 100) {
      budgetScore = Math.max(10, Math.round(40 - (overallUtil - 100) * 1.5));
    } else if (overallUtil > 80) {
      budgetScore = Math.round(40 - (overallUtil - 80) * 0.75);
    }
  } else {
    budgetScore = 25; // neutral if no budgets set yet
  }

  // 2. Savings Momentum (0-30 pts)
  const savingsRate = dashboardData?.savings_rate_pct || 0;
  const completedGoals = (dashboardData?.savings_goals || []).filter(g => (g.progress_pct || 0) >= 100).length;
  let savingsScore = Math.min(30, Math.round((savingsRate / 50) * 20) + (completedGoals > 0 ? 10 : 5));

  // 3. Tracking Consistency (0-30 pts)
  const count = txCount || 0;
  let trackingScore = Math.min(30, Math.round((count / 6) * 30));

  const totalScore = Math.min(100, Math.max(20, budgetScore + savingsScore + trackingScore));

  let grade = 'B';
  let title = 'Healthy Financial Trajectory';
  let color = 'text-cyan-400';
  let mood = 'happy';

  if (totalScore >= 90) {
    grade = 'A+';
    title = 'Exceptional Financial Discipline';
    color = 'text-emerald-400';
    mood = 'celebrating';
  } else if (totalScore >= 80) {
    grade = 'A';
    title = 'Strong Budget Execution';
    color = 'text-emerald-400';
    mood = 'happy';
  } else if (totalScore >= 70) {
    grade = 'B';
    title = 'Stable Cashflow Control';
    color = 'text-cyan-400';
    mood = 'happy';
  } else if (totalScore >= 55) {
    grade = 'C';
    title = 'Moderate Budget Pressure';
    color = 'text-amber-400';
    mood = 'thinking';
  } else {
    grade = 'D';
    title = 'Attention Recommended';
    color = 'text-rose-400';
    mood = 'concerned';
  }

  return {
    score: totalScore,
    grade,
    title,
    color,
    mood,
    breakdown: {
      budget: budgetScore,
      savings: savingsScore,
      tracking: trackingScore
    }
  };
};

/**
 * Section E: Daily Budget Check-in Generator
 */
export const getDailyCheckIn = (budgetData, txs) => {
  const safeTxs = Array.isArray(txs) ? txs : (txs?.transactions || []);
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const budgets = budgetData?.budgets || [];
  const today = new Date().toISOString().split('T')[0];

  const todayTxs = safeTxs.filter(t => t.date === today && t.type === 'expense');
  const foodBudget = budgets.find(b => b.category === 'Food & Dining');
  const criticalBudget = budgets.find(b => (b.utilization_pct || 0) >= 85);
  const exceededBudget = budgets.find(b => (b.utilization_pct || 0) > 100);

  if (exceededBudget) {
    return {
      greeting: `${timeOfDay}!`,
      message: `Heads up! Your ${exceededBudget.category} budget has exceeded its monthly limit by ₹${Math.abs(Number(exceededBudget.remaining || 0)).toLocaleString('en-IN')}. Let's rein in extra spend!`,
      mood: 'concerned',
      chip: 'Action Required'
    };
  }

  if (criticalBudget) {
    return {
      greeting: `${timeOfDay}!`,
      message: `Your ${criticalBudget.category} budget is almost exhausted with only ₹${Number(criticalBudget.remaining || 0).toLocaleString('en-IN')} remaining. Think twice before spending!`,
      mood: 'concerned',
      chip: 'Caution Alert'
    };
  }

  if (foodBudget && foodBudget.remaining > 0) {
    return {
      greeting: `${timeOfDay}!`,
      message: `You have ₹${Number(foodBudget.remaining || 0).toLocaleString('en-IN')} left in your Food & Dining budget. Enjoy your meals while saving smartly!`,
      mood: 'happy',
      chip: 'Daily Food Runway'
    };
  }

  if (todayTxs.length === 0) {
    return {
      greeting: `${timeOfDay}!`,
      message: `You haven't recorded any expenses today yet. Don't forget to track your coffee or daily purchases!`,
      mood: 'thinking',
      chip: 'Tracker Reminder'
    };
  }

  return {
    greeting: `${timeOfDay}!`,
    message: `Amazing discipline today! All your active categories are pacing comfortably within your safe daily allowance.`,
    mood: 'happy',
    chip: 'On Track'
  };
};

/**
 * ================= COMPONENT: FINNY DAILY CHECK-IN BANNER =================
 */
export function DailyCheckInBanner({ budgetData, transactions, onAddTx }) {
  const [checkInIndex, setCheckInIndex] = useState(0);
  const checkIn = getDailyCheckIn(budgetData, transactions);

  const alternateTips = [
    checkIn.message,
    "Pro tip: Small daily coffee or snack cuts compound into massive monthly savings! ☕✨",
    "Remember: Sticking to your safe daily allowance guarantees you will never exceed your monthly budget. 🛡️",
    "Did you know? Reviewing your category breakdown twice a week reduces impulsive spending by over 30%! 📊"
  ];

  const currentMessage = alternateTips[checkInIndex % alternateTips.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-glow hud-corner p-5 sm:p-6 rounded-3xl border border-purple-500/35 relative overflow-hidden bg-gradient-to-r from-[#0c1630]/90 via-[#0a1024]/95 to-[#060b18] shadow-2xl"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500"></div>
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
        <div className="relative group shrink-0">
          <FinnyMascot
            state={checkIn.mood}
            size="md"
            interactive={true}
          />
        </div>

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
              Finny Daily Check-In
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              {checkIn.greeting}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              {checkIn.chip}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-sans max-w-3xl">
            {currentMessage}
          </p>

          <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <button
              onClick={() => setCheckInIndex(prev => prev + 1)}
              className="text-[11px] font-mono font-semibold text-purple-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/30 border border-purple-500/30 hover:bg-purple-900/50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Next Finny Tip</span>
            </button>
            {onAddTx && (
              <button
                onClick={onAddTx}
                className="text-[11px] font-mono font-semibold text-cyan-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-900/30 border border-cyan-500/30 hover:bg-cyan-900/50 transition-all cursor-pointer"
              >
                <span>+ Log Today's Expense</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * ================= COMPONENT: FINNY MONTHLY FINANCIAL HEALTH SCORE =================
 */
export function FinnyHealthScoreCard({ healthScore, totalRemaining, daysLeft, safeDaily }) {
  const { score, grade, title, color, mood, breakdown } = healthScore;

  return (
    <div className="glass-panel hud-corner p-6 rounded-3xl border border-cyan-500/25 relative overflow-hidden bg-[#060e1d]/90">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Score Gauge */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            {/* SVG Radial Meter */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black font-mono tracking-tighter ${color} drop-shadow-[0_0_10px_currentColor]`}>
                {score}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                FINNY HEALTH SCORE
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black bg-cyan-950/80 border border-cyan-400/40 ${color}`}>
                Grade {grade}
              </span>
            </div>
            <h4 className="text-lg font-black text-white tracking-tight">
              {title}
            </h4>
          </div>
        </div>

        {/* Middle: 3 Pillars Breakdown */}
        <div className="grid grid-cols-3 gap-3 min-w-[280px] font-mono">
          <div className="bg-[#040915] p-3 rounded-2xl border border-cyan-500/20">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Discipline</span>
            <span className="text-base font-extrabold text-cyan-300">{breakdown.budget}/40</span>
            <span className="text-[8px] text-slate-500 block">Limits Pacing</span>
          </div>
          <div className="bg-[#040915] p-3 rounded-2xl border border-purple-500/20">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Savings</span>
            <span className="text-base font-extrabold text-purple-300">{breakdown.savings}/30</span>
            <span className="text-[8px] text-slate-500 block">Target Horizon</span>
          </div>
          <div className="bg-[#040915] p-3 rounded-2xl border border-emerald-500/20">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Tracking</span>
            <span className="text-base font-extrabold text-emerald-300">{breakdown.tracking}/30</span>
            <span className="text-[8px] text-slate-500 block">Ledger Recency</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ================= COMPONENT: INDIVIDUAL BUDGET PROGRESS CARD =================
 */
export function FinnyBudgetCard({ 
  budget, 
  onDelete, 
  onInspectCategory 
}) {
  const { category, spending_limit, spent, remaining, utilization_pct, status } = budget;
  const isExceeded = utilization_pct >= 100;
  const isWarning = utilization_pct >= 76 && !isExceeded;
  const reaction = getBudgetFinnyReaction(utilization_pct, category);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3 }}
      className={`glass-panel hud-corner p-5 sm:p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
        isExceeded 
          ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-[#070b16]' 
          : isWarning 
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-[#070b16]' 
          : 'border-cyan-500/25 hover:border-cyan-400/60 bg-gradient-to-b from-[#091428]/90 to-[#050b16]'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
              {category}
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Assigned Cap: <strong className="text-slate-200">₹{Number(spending_limit || 0).toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full font-mono uppercase ${reaction.moodColor}`}>
              {reaction.moodTag}
            </span>
            <button
              onClick={() => onDelete(budget.budget_id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 cursor-pointer"
              title="Delete this budget limit"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Finny Mascot Embedded Reaction Strip */}
        <div className="my-3.5 p-3 rounded-2xl bg-[#040814]/90 border border-purple-500/25 flex items-center gap-3 relative shadow-inner">
          <div className="shrink-0">
            <FinnyMascot
              state={reaction.state}
              size="xs"
              interactive={true}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1">
                Finny
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </span>
              <span className="text-[9px] font-mono text-purple-300">Reaction</span>
            </div>
            <p className="text-[11px] text-slate-200 font-medium leading-snug">
              {reaction.message}
            </p>
          </div>
        </div>

        {/* Category Personality Advice Pill */}
        <div className="mb-4 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="italic truncate">{reaction.categoryAdvice}</span>
        </div>

        {/* Progress Bar & Telemetry */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Spent: ₹{Number(spent || 0).toLocaleString('en-IN')}</span>
            <span className={`font-extrabold ${isExceeded ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'}`}>
              {utilization_pct}%
            </span>
          </div>

          <div className="w-full h-3 bg-[#030611] rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, utilization_pct)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full transition-all ${
                isExceeded 
                  ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]' 
                  : isWarning 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer & Transaction Deep Dive Button */}
      <div className="pt-3 border-t border-cyan-500/15 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">
            {remaining >= 0 ? 'Remaining Cushion' : 'Over Limit By'}
          </span>
          <span className={`text-sm font-black ${remaining >= 0 ? 'text-emerald-400 glow-text-cyan' : 'text-rose-400'}`}>
            ₹{Math.abs(Number(remaining || 0)).toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={() => onInspectCategory(category)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 hover:text-white transition-all text-[11px] font-mono cursor-pointer"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Transactions</span>
        </button>
      </div>
    </motion.div>
  );
}

/**
 * ================= COMPONENT: FINNY REWARDS & BADGES (SECTION C) =================
 */
export function FinnyRewardsSection({ budgetData, dashboardData, txCount, onSelectBadge }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Finny Rewards & Badges</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Gamified System
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Earn stars & unlock celebration badges as you manage your money
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {BUDGET_ACHIEVEMENTS.map((badge) => {
          const isUnlocked = badge.check(budgetData, dashboardData, txCount);
          const progress = badge.getProgress(budgetData, dashboardData, txCount);

          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectBadge({ ...badge, isUnlocked, progress })}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-gradient-to-b from-[#16203a] to-[#091122] border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                  : 'bg-[#060c18]/80 border-slate-800 opacity-75 hover:opacity-100'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
              )}

              <div>
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h5 className="font-bold text-white text-xs mb-1">{badge.title}</h5>
                <p className="text-[11px] text-slate-400 leading-tight mb-3">
                  {badge.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className={isUnlocked ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                    {isUnlocked ? 'UNLOCKED' : `${progress}%`}
                  </span>
                  <span className="text-slate-400">+{badge.points} pts</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isUnlocked ? 'bg-amber-400' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ================= COMPONENT: MONTHLY CHALLENGES (SECTION F) =================
 */
export function FinnyChallengesSection({ budgetData, transactions, onClaimChallenge }) {
  const [joinedChallenges, setJoinedChallenges] = useState(() => {
    try {
      const stored = localStorage.getItem('finagent_joined_challenges');
      return stored ? JSON.parse(stored) : ['no_spend_day', 'save_10_percent'];
    } catch {
      return ['no_spend_day', 'save_10_percent'];
    }
  });

  const toggleChallenge = (id) => {
    setJoinedChallenges(prev => {
      const updated = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      try {
        localStorage.setItem('finagent_joined_challenges', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Interactive Budget Challenges</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Monthly Quests
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Accept monthly financial challenges to boost your Finny Health Score
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUDGET_CHALLENGES.map((challenge) => {
          const isJoined = joinedChallenges.includes(challenge.id);
          const progress = challenge.calcProgress(budgetData, transactions);
          const isCompleted = progress >= 100;

          return (
            <div
              key={challenge.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'bg-gradient-to-br from-emerald-950/30 via-[#0a1426] to-[#040814] border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                  : isJoined
                  ? 'bg-[#091428]/90 border-cyan-500/35 shadow-md'
                  : 'bg-[#060c18]/70 border-slate-800 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-2xl">{challenge.icon}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                    isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                      : isJoined 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isCompleted ? 'COMPLETED' : isJoined ? 'IN PROGRESS' : 'AVAILABLE'}
                  </span>
                </div>

                <h5 className="font-extrabold text-white text-sm mb-1">{challenge.title}</h5>
                <p className="text-xs text-slate-300 leading-snug mb-3">
                  {challenge.description}
                </p>

                <div className="p-2.5 rounded-xl bg-[#040814] border border-cyan-500/20 mb-3 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Target:</span>
                    <span className="text-slate-200">{challenge.target}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reward:</span>
                    <span className="text-purple-300 font-bold">{challenge.reward}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Progress</span>
                    <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleChallenge(challenge.id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer font-mono ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isJoined
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                    }`}
                  >
                    {isCompleted ? 'Claimed ✓' : isJoined ? 'Leave Challenge' : 'Join Challenge'}
                  </button>
                  {isCompleted && (
                    <button
                      onClick={() => onClaimChallenge(challenge)}
                      className="px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                      title="Celebrate achievement!"
                    >
                      🎉
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ================= COMPONENT: CATEGORY TRANSACTIONS INSPECTOR MODAL =================
 */
export function CategoryTransactionsModal({ 
  category, 
  onClose, 
  transactions = [] 
}) {
  const safeList = Array.isArray(transactions) ? transactions : (transactions?.transactions || []);
  const filtered = safeList.filter(t => t.category === category);
  const total = filtered.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel-glow hud-corner rounded-3xl max-w-lg w-full p-6 border border-cyan-500/35 space-y-4 shadow-2xl relative bg-[#091325]/95 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-cyan-400" />
              {category} Transactions
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Total Recorded Spend: <strong className="text-rose-400">₹{Number(total || 0).toLocaleString('en-IN')}</strong> across {filtered.length} entries
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.length > 0 ? (
            filtered.map((tx) => (
              <div 
                key={tx.transaction_id || tx.id}
                className="p-3 rounded-2xl bg-[#040814] border border-cyan-500/15 flex items-center justify-between text-xs font-mono hover:border-cyan-400/40 transition-colors"
              >
                <div>
                  <p className="font-bold text-white text-[13px]">{tx.description}</p>
                  <span className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>{tx.date}</span>
                    <span className="text-slate-600">·</span>
                    <span className="uppercase text-cyan-400">{tx.type}</span>
                  </span>
                </div>
                <span className={`text-sm font-black ${tx.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {tx.type === 'expense' ? '-' : '+'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              No transactions recorded in this category yet.
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-cyan-500/20 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer font-mono"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * ================= COMPONENT: ACHIEVEMENT CELEBRATION MODAL =================
 */
export function AchievementCelebrationModal({ badge, onClose }) {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel-glow hud-corner rounded-3xl max-w-sm w-full p-7 border border-amber-400/50 text-center space-y-4 shadow-[0_0_50px_rgba(251,191,36,0.3)] bg-gradient-to-b from-[#18233f] via-[#0d162d] to-[#060b18] relative"
      >
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <FinnyMascot
            state="celebrating"
            size="md"
            interactive={true}
          />
        </div>

        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
            Finny Reward Unlocked! 🎉
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {badge.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {badge.description}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-400/30 text-xs font-mono text-amber-300 font-bold">
          +{badge.points || 50} Finny Gamification XP Points
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
        >
          Awesome, Thanks Finny!
        </button>
      </motion.div>
    </div>
  );
}
