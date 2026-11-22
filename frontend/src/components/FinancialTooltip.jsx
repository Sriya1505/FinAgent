import React, { useState } from 'react';
import { HelpCircle, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FINANCIAL_DEFINITIONS = {
  inflow: {
    title: 'Monthly Inflow',
    definition: 'Total monetary funds credited to your account this month (salaries, dividends, reimbursements).',
    finnyTip: 'Finny tip: Tracking inflow helps ensure your fixed obligations never exceed 50% of your earnings!'
  },
  outflow: {
    title: 'Monthly Outflow',
    definition: 'The aggregate sum of all expenditures, bill payments, and debit charges recorded this month.',
    finnyTip: 'Finny tip: Keep variable expenses in check so you retain at least 20% for future savings!'
  },
  current_balance: {
    title: 'Current Balance',
    definition: 'Net lifetime cash position derived deterministically by subtracting total expenses from total income.',
    finnyTip: 'Finny tip: Calculated directly in Python with zero arithmetic hallucination.'
  },
  savings_rate: {
    title: 'Savings Rate',
    definition: 'The proportion of your monthly income that is saved: (Inflow - Outflow) / Inflow * 100.',
    finnyTip: 'Finny tip: A 20%+ savings rate is the gold standard for long-term financial independence!'
  },
  safe_daily_allowance: {
    title: 'Safe Daily Allowance',
    definition: 'The maximum amount you can spend each day without exceeding your allocated monthly budget: Remaining Cushion / Days Left.',
    finnyTip: 'Finny tip: Staying under this number guarantees you will never overspend your budget cap!'
  },
  budget_utilization: {
    title: 'Budget Utilization',
    definition: 'The percentage of your total allocated budget limit that has been consumed so far.',
    finnyTip: 'Finny tip: Finny will gently warn you when your pace exceeds 75% before month end.'
  },
  anomaly: {
    title: 'Anomaly Detection',
    definition: 'Transactions flagged by our statistical IQR and robust Z-score engine that exceed your baseline merchant spending.',
    finnyTip: 'Finny tip: Inspect flagged charges to catch hidden recurring fees or accidental double charges!'
  },
  python_verified: {
    title: 'Verified Financial Engine',
    definition: 'Financial calculations are executed using verified deterministic arithmetic engines with strict IEEE 754 precision, ensuring zero LLM hallucination.',
    finnyTip: 'Finny tip: Our AI explains the results, while deterministic calculations guarantee the math!'
  }
};

export default function FinancialTooltip({ term, children, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const info = FINANCIAL_DEFINITIONS[term] || {
    title: 'Financial Metric',
    definition: 'A key indicator of your personal cashflow and budget efficiency.',
    finnyTip: 'Finny tip: Keep tracking regularly to build healthy financial habits!'
  };

  return (
    <span 
      className={`relative inline-flex items-center gap-1 cursor-pointer group ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
      }}
    >
      <span className="border-b border-dotted border-cyan-400/50 hover:border-cyan-300 transition-colors">
        {children}
      </span>
      <Info className="w-3 h-3 text-cyan-400/70 group-hover:text-cyan-300 transition-colors shrink-0" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#081224]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)] text-left z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h5 className="font-bold text-white text-xs">{info.title}</h5>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2 font-sans">
              {info.definition}
            </p>
            <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[10px] text-purple-200 flex items-start gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
              <span>{info.finnyTip}</span>
            </div>
            {/* Tooltip Downward Arrow Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#081224] border-r border-b border-cyan-500/40 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export { FinancialTooltip };

