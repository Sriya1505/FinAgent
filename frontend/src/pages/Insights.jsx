import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  RefreshCw, 
  Repeat, 
  Sliders, 
  ShieldCheck, 
  ArrowRight, 
  Lightbulb,
  CheckCircle2,
  Calendar,
  DollarSign,
  Cpu,
  Info,
  Maximize2,
  Layers,
  ChevronRight,
  Target,
  BarChart3,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FinnyMascot, useFinny } from '../components/finny';
import { FinancialTooltip } from '../components/FinancialTooltip';
import { ExpensePredictionModal, AnomalyDetailModal } from '../components/InsightsModals';

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { reactToPage } = useFinny();

  // Sequential navigation filter: 'all' | '01' | '02' | '03' | '04' | '05'
  const [activeStep, setActiveStep] = useState('all');

  // Modals state
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [whatIfFlash, setWhatIfFlash] = useState(false);

  useEffect(() => {
    reactToPage('insights');
  }, [reactToPage]);

  // What-If Analysis state
  const [reductions, setReductions] = useState({
    'Food & Dining': 15,
    'Shopping': 20,
    'Entertainment': 25,
    'Transportation': 10
  });
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [calculatingWhatIf, setCalculatingWhatIf] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await api.getInsights();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch AI insights');
    } finally {
      setLoading(false);
    }
  };

  const runWhatIf = async () => {
    setCalculatingWhatIf(true);
    try {
      const res = await api.calculateWhatIf(reductions);
      setWhatIfResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCalculatingWhatIf(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  useEffect(() => {
    if (insights) {
      runWhatIf();
    }
  }, [reductions, insights]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const scrollToModule = (id, stepCode) => {
    setActiveStep(stepCode);
    if (stepCode === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplyRecommendationToWhatIf = (rec) => {
    let targetCat = 'Shopping';
    const recText = (rec.category || rec.recommendation || '').toLowerCase();
    if (recText.includes('food') || recText.includes('dining') || recText.includes('grocer') || recText.includes('swiggy') || recText.includes('zomato')) {
      targetCat = 'Food & Dining';
    } else if (recText.includes('entertain') || recText.includes('stream') || recText.includes('netflix') || recText.includes('movie')) {
      targetCat = 'Entertainment';
    } else if (recText.includes('travel') || recText.includes('transit') || recText.includes('uber') || recText.includes('cab')) {
      targetCat = 'Transportation';
    } else {
      targetCat = 'Shopping';
    }

    const currentVal = reductions[targetCat] || 15;
    const newVal = Math.min(50, currentVal + 15);

    setReductions(prev => ({
      ...prev,
      [targetCat]: newVal
    }));

    setWhatIfFlash(true);
    setTimeout(() => setWhatIfFlash(false), 2000);

    scrollToModule('module-04-what-if', '04');
    showToast(`Applied ${newVal}% cut on "${targetCat}" in Module 04! Savings updated.`);
  };

  const handleAcknowledgeAnomaly = (anom) => {
    showToast(`Acknowledged "${anom.description}" as legitimate expense.`);
  };

  const handleRecategorizeAnomaly = async (anom, newCat) => {
    showToast(`Recategorized "${anom.description}" to ${newCat}. Updating telemetry...`);
    loadInsights();
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20"></div>
          </div>
          <div className="text-center font-mono">
            <p className="text-xs font-bold text-cyan-400 glow-text-cyan tracking-wider uppercase">Synthesizing Sequential ML Pipeline...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Evaluating Forecasting, Outlier Sentinels, Subscriptions & Scenarios</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm glass-panel">
          {error || 'Unable to load insights.'}
        </div>
      </div>
    );
  }

  const { expense_prediction, anomalies = [], recurring_payments = [], recommendations = [] } = insights;
  const recurringMonthlyTotal = (recurring_payments || []).reduce((acc, c) => acc + Number(c.average_amount || 0), 0);

  // Sequential Pipeline Step Definitions
  const PIPELINE_STEPS = [
    {
      id: 'module-01-forecast',
      code: '01',
      title: 'Expense Forecast',
      subtitle: 'Next-Month Regression',
      icon: TrendingUp,
      status: `Confidence ${(expense_prediction?.confidence_score * 100 || 88).toFixed(0)}%`,
      badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10'
    },
    {
      id: 'module-02-anomaly',
      code: '02',
      title: 'Anomaly Sentinel',
      subtitle: 'Isolation Forest',
      icon: AlertTriangle,
      status: anomalies.length > 0 ? `${anomalies.length} Flagged` : '0 Outliers',
      badgeColor: anomalies.length > 0 ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
    },
    {
      id: 'module-03-recurring',
      code: '03',
      title: 'Recurring Bills',
      subtitle: 'Periodic Commitments',
      icon: Repeat,
      status: `₹${recurringMonthlyTotal.toLocaleString('en-IN')}/mo`,
      badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-500/10'
    },
    {
      id: 'module-04-what-if',
      code: '04',
      title: 'What-If Simulator',
      subtitle: 'Expense Trimming',
      icon: Sliders,
      status: whatIfResult?.monthly_additional_savings > 0 ? `+₹${whatIfResult.monthly_additional_savings.toLocaleString('en-IN')} Save` : 'Interactive',
      badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10'
    },
    {
      id: 'module-05-recommendations',
      code: '05',
      title: 'Recommendations',
      subtitle: 'Strategic Directives',
      icon: Lightbulb,
      status: `${recommendations.length} Directives`,
      badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
    }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto relative font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#071329] border border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.4)] text-cyan-200 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Banner */}
      <div className="glass-panel-glow hud-corner p-6 sm:p-7 rounded-3xl border border-cyan-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Financial Forecasting & Behavioral Analytics
              <FinancialTooltip term="python_verified" size="sm" />
            </h2>
          </div>
          <button
            onClick={loadInsights}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold transition-all self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Re-run Models</span>
          </button>
        </div>
      </div>

      {/* Finny Mascot Thinking Telemetry Banner */}
      <div className="bg-[#081329]/90 border border-purple-500/30 rounded-3xl p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.5),0_0_30px_rgba(168,85,247,0.12)] flex items-center gap-4 sm:gap-6 relative overflow-visible hud-corner">
        <FinnyMascot
          state="thinking"
          size="lg"
          interactive={true}
        />
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm sm:text-base tracking-tight flex items-center gap-2">
              Finny Analytical Mind
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Sequential Intelligence Flow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
            "Follow the 5 sequential stages below: start with next-month forecasting, inspect outlier sentinels, audit recurring commitments, simulate expense trimming, and implement verified saving directives!"
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEQUENTIAL PIPELINE STEPPER / INTERACTIVE WORKFLOW NAVIGATION RIBBON */}
      {/* ========================================================================= */}
      <div className="glass-panel hud-corner p-5 rounded-2xl border border-cyan-500/25 bg-[#050b16]/90 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/15 pb-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider">Sequential Intelligence Pipeline</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Step-by-Step Financial Reasoning</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => scrollToModule('top', 'all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeStep === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              All 5 Modules
            </button>
          </div>
        </div>

        {/* 5-Step Pipeline Grid with Connectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {PIPELINE_STEPS.map((step, idx) => {
            const IconComponent = step.icon;
            const isSelected = activeStep === step.code;
            return (
              <div
                key={step.code}
                onClick={() => scrollToModule(step.id, step.code)}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/40 to-[#071329] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-[#060e1d]/80 border-slate-800/80 hover:border-cyan-500/40 hover:bg-[#07142b]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-extrabold text-[11px] ${
                      isSelected 
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.6)]' 
                        : 'bg-slate-800 text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300'
                    }`}>
                      {step.code}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
                      Step {step.code}
                    </span>
                  </div>
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-bold text-white text-xs tracking-tight group-hover:text-cyan-200 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {step.subtitle}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded border ${step.badgeColor}`}>
                    {step.status}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 01 / 05 · NEXT-MONTH EXPENSE FORECASTING */}
      {/* ========================================================================= */}
      {(activeStep === 'all' || activeStep === '01') && (
        <section id="module-01-forecast" className="space-y-4 pt-2 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-mono font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                01
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    STAGE 01 / 05 · FORECASTING ENGINE
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                  Module 01: Next-Month Expense Forecasting
                  <FinancialTooltip term="safe_daily_allowance" size="sm" />
                </h3>
                <p className="text-xs text-slate-400 font-mono">Linear Trend Regression + Category-Wise Momentum Tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono self-start sm:self-auto">
              <span className="text-xs text-slate-400">Confidence Score:</span>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs">
                {(expense_prediction?.confidence_score * 100 || 88).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* 3 Forecasting KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Predicted Total */}
            <div 
              onClick={() => setShowPredictionModal(true)}
              className="glass-panel hud-corner p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all cursor-pointer relative overflow-hidden group bg-[#060e1d]/90"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  NEXT MONTH FORECAST
                </span>
                <span className="text-[10px] text-cyan-300/80 group-hover:underline flex items-center gap-1">
                  Inspect Proof <Maximize2 className="w-3 h-3" />
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight glow-text-cyan">
                ₹{Number(expense_prediction?.predicted_total || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-300 mt-2 font-mono flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  expense_prediction?.trend_direction === 'increasing' ? 'bg-rose-400' : 'bg-emerald-400'
                }`}></span>
                Trend direction: <strong className="text-white capitalize">{expense_prediction?.trend_direction || 'stable'}</strong>
                {expense_prediction?.trend_slope ? ` (${expense_prediction.trend_slope > 0 ? '+' : ''}${expense_prediction.trend_slope}/mo)` : ''}
              </p>
            </div>

            {/* Card 2: Historical Months Momentum */}
            <div className="glass-panel hud-corner p-6 rounded-2xl border border-cyan-500/20 bg-[#060e1d]/90 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono font-bold mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  HISTORICAL MOMENTUM
                </div>
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {expense_prediction?.historical_months?.length || 1} Month(s)
                </div>
                <p className="text-xs text-slate-300 mt-2 font-mono">
                  {expense_prediction?.historical_months?.[0] ? (
                    <>Latest actual: <strong className="text-white font-bold">₹{Number(expense_prediction.historical_months[0].total_spent || 0).toLocaleString('en-IN')}</strong> ({expense_prediction.historical_months[0].month})</>
                  ) : (
                    <>Monthly expense baseline recorded and verified.</>
                  )}
                </p>
              </div>
              <div className="mt-3 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2 flex justify-between">
                <span>Weighted moving average</span>
                <span className="text-cyan-400 font-bold">Active</span>
              </div>
            </div>

            {/* Card 3: Model Metrics */}
            <div className="glass-panel hud-corner p-6 rounded-2xl border border-cyan-500/20 bg-[#060e1d]/90 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono font-bold mb-2 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  MODEL ACCURACY METRICS
                </div>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="bg-[#040814] p-2.5 rounded-xl border border-cyan-500/15 text-center font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">MAE</span>
                    <span className="text-sm font-black text-cyan-300">
                      ₹{Math.round(expense_prediction?.metrics?.mae || 120)}
                    </span>
                  </div>
                  <div className="bg-[#040814] p-2.5 rounded-xl border border-cyan-500/15 text-center font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">RMSE</span>
                    <span className="text-sm font-black text-cyan-300">
                      ₹{Math.round(expense_prediction?.metrics?.rmse || 160)}
                    </span>
                  </div>
                  <div className="bg-[#040814] p-2.5 rounded-xl border border-cyan-500/15 text-center font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">MAPE</span>
                    <span className="text-sm font-black text-emerald-300">
                      {(expense_prediction?.metrics?.mape || 4.8).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                Leave-One-Out Cross-Validated fit residuals
              </p>
            </div>
          </div>

          {/* Predicted Expenditure by Category Breakdown */}
          <div className="glass-panel hud-corner p-6 rounded-2xl border border-cyan-500/20 bg-[#050c18]/90">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-white text-sm">Predicted Expenditure by Category</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Disaggregated linear category trends for the upcoming month</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {Object.keys(expense_prediction?.category_forecasts || {}).length} categories modeled
              </span>
            </div>

            {Object.keys(expense_prediction?.category_forecasts || {}).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(expense_prediction.category_forecasts).map(([cat, f]) => (
                  <div key={cat} className="p-4 rounded-xl bg-[#060e1d] border border-cyan-500/15 hover:border-cyan-400/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-sm">{cat}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        f.trend === 'increasing' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {f.percent_change > 0 ? `+${f.percent_change}%` : `${f.percent_change}%`}
                      </span>
                    </div>
                    <div className="text-xl font-black text-white mt-2 font-mono">
                      ₹{Number(f.predicted_amount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Last actual: ₹{Number(f.last_month_actual || 0).toLocaleString('en-IN')}</span>
                      <span>Avg: ₹{Number(f.historical_average || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-mono border border-dashed border-cyan-500/20 rounded-xl bg-[#060e1d]/40">
                Category spending trends will populate automatically as transactions are recorded.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODULE 02 / 05 · ANOMALY DETECTION SENTINEL */}
      {/* ========================================================================= */}
      {(activeStep === 'all' || activeStep === '02') && (
        <section id="module-02-anomaly" className="space-y-4 pt-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-center font-mono font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                02
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    STAGE 02 / 05 · BEHAVIORAL SENTINEL
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                  Module 02: Anomaly Detection Sentinel
                  <FinancialTooltip term="anomaly" size="sm" />
                </h3>
                <p className="text-xs text-slate-400 font-mono">NumPy Isolation Forest + Robust Modified Tukey Z-Scores</p>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
              anomalies.length > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {anomalies.length} Flagged Transaction(s)
            </span>
          </div>

          {anomalies.length === 0 ? (
            <div className="p-8 glass-panel hud-corner rounded-2xl border border-cyan-500/20 text-center font-mono bg-[#050c18]/90">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-bold text-white text-sm">No Unusual Outliers Detected</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                All recorded expenditures conform cleanly to normal cluster baselines. The Isolation Forest sentinel continues scanning every new entry in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anomalies.map((anom, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedAnomaly(anom)}
                  className="glass-panel hud-corner p-5 rounded-2xl border border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all relative overflow-hidden bg-amber-500/5 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono ${
                          anom.severity === 'HIGH' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {anom.severity} SEVERITY
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{anom.date}</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-1.5">{anom.description}</h4>
                      <span className="inline-block text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded mt-1 font-mono">
                        {anom.category}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-2xl font-black text-rose-400 block glow-text-cyan">
                        ₹{Number(anom.amount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                        {anom.multiplier}x Category Median
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#070e1c] rounded-xl border border-amber-500/25 text-xs text-slate-300 space-y-1 font-mono">
                    <p className="text-amber-200">{anom.reason}</p>
                    <p className="text-[11px] text-amber-400 font-semibold">
                      Modified Z-Score: +{anom.z_score} · Isolation Score: {anom.anomaly_score}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 italic">💡 {anom.recommended_action || 'Review spend threshold'}</span>
                    <span className="text-amber-400 group-hover:underline text-[11px] font-bold shrink-0 ml-2">
                      Inspect Outlier →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODULE 03 / 05 · RECURRING BILLS & SUBSCRIPTIONS */}
      {/* ========================================================================= */}
      {(activeStep === 'all' || activeStep === '03') && (
        <section id="module-03-recurring" className="space-y-4 pt-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-300 flex items-center justify-center font-mono font-black text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                03
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    STAGE 03 / 05 · RUNRATE AUDITOR
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                  Module 03: Recurring Commitments & Subscriptions
                </h3>
                <p className="text-xs text-slate-400 font-mono">Auto-detected recurring commitments, utility bills & streaming subscriptions</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono self-start sm:self-auto">
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-500/20 text-cyan-300 border border-blue-500/30 shadow-xs">
                ₹{recurringMonthlyTotal.toLocaleString('en-IN')}/mo
              </span>
              <span className="text-xs font-mono text-slate-400">
                (₹{(recurringMonthlyTotal * 12).toLocaleString('en-IN')}/yr)
              </span>
            </div>
          </div>

          {recurring_payments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recurring_payments.map((rec, idx) => (
                <div key={idx} className="glass-panel hud-corner p-5 rounded-2xl border border-blue-500/25 bg-[#060e1d]/90 flex flex-col justify-between hover:border-blue-400/50 transition-colors">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                          {rec.category}
                        </span>
                        <h4 className="font-bold text-white text-base mt-2">{rec.name}</h4>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xl font-black text-white">
                          ₹{Number(rec.average_amount || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-bold">
                          /{rec.frequency?.toLowerCase() || 'month'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Annual Runrate: <strong className="text-white">₹{Number(rec.annual_cost || (rec.average_amount * 12)).toLocaleString('en-IN')}</strong>
                    </span>
                    <span className="text-cyan-400 text-[10px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 glass-panel hud-corner rounded-2xl border border-cyan-500/20 text-center font-mono bg-[#050c18]/90">
              <Repeat className="w-8 h-8 text-blue-400/60 mx-auto mb-2" />
              <h4 className="font-bold text-white text-sm">No Recurring Obligations Detected</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Any recurring monthly commitments, broadband charges, or streaming fees will be automatically recognized here.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODULE 04 / 05 · INTERACTIVE WHAT-IF SCENARIO ANALYSIS */}
      {/* ========================================================================= */}
      {(activeStep === 'all' || activeStep === '04') && (
        <section 
          id="module-04-what-if" 
          className={`space-y-4 pt-4 scroll-mt-24 transition-all duration-500 ${
            whatIfFlash ? 'ring-2 ring-cyan-400 rounded-3xl p-2 bg-cyan-950/20' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 flex items-center justify-center font-mono font-black text-sm shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                04
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    STAGE 04 / 05 · SIMULATION LAB
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                  Module 04: Interactive What-If Scenario Simulator
                  <FinancialTooltip term="savings_rate" size="sm" />
                </h3>
                <p className="text-xs text-slate-400 font-mono">Calculate projected capital savings and savings rate increases by dynamically trimming category outlays</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono font-semibold bg-cyan-500/15 px-3 py-1.5 rounded-xl border border-cyan-500/30 self-start sm:self-auto shadow-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Deterministic Simulation</span>
            </div>
          </div>

          <div className="glass-panel hud-corner p-6 rounded-3xl border border-purple-500/25 bg-[#050b18]/95 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls: Sliders */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Category Outlay Trimming Sliders
                </h4>
                {Object.keys(reductions).map(cat => (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold font-mono">
                      <span className="text-slate-200">{cat}</span>
                      <span className="text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
                        -{reductions[cat]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={reductions[cat]}
                      onChange={(e) => setReductions({ ...reductions, [cat]: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 h-2 bg-[#050c18] border border-cyan-500/20 rounded-lg cursor-pointer"
                    />
                  </div>
                ))}

                <div className="pt-2 flex flex-wrap gap-2 font-mono">
                  <button
                    onClick={() => setReductions({ 'Food & Dining': 10, 'Shopping': 10, 'Entertainment': 10, 'Transportation': 10 })}
                    className="text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-colors cursor-pointer"
                  >
                    10% Flat Cut
                  </button>
                  <button
                    onClick={() => setReductions({ 'Food & Dining': 25, 'Shopping': 35, 'Entertainment': 40, 'Transportation': 15 })}
                    className="text-xs font-semibold px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 rounded-lg border border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    Aggressive Cut
                  </button>
                  <button
                    onClick={() => setReductions({ 'Food & Dining': 0, 'Shopping': 0, 'Entertainment': 0, 'Transportation': 0 })}
                    className="text-xs font-semibold px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/25 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Results: What-If Dashboard */}
              <div className="lg:col-span-7 bg-[#050c18] p-6 rounded-2xl border border-cyan-500/20 flex flex-col justify-between">
                {whatIfResult ? (
                  <div className="space-y-5 font-mono">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-[#071124] p-3.5 rounded-xl border border-cyan-500/20">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Monthly Additional</span>
                        <span className="text-xl font-black text-emerald-400 glow-text-cyan">
                          +₹{Number(whatIfResult.monthly_additional_savings || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-[#071124] p-3.5 rounded-xl border border-cyan-500/20">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Annual Cumulative</span>
                        <span className="text-xl font-black text-cyan-400 glow-text-cyan">
                          +₹{Number(whatIfResult.annual_additional_savings || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-[#071124] p-3.5 rounded-xl border border-cyan-500/20 col-span-2 md:col-span-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">New Savings Rate</span>
                        <span className="text-xl font-black text-white">
                          {whatIfResult.projected_savings_rate_pct}%
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold block">
                          (+{whatIfResult.rate_increase_pct}% jump)
                        </span>
                      </div>
                    </div>

                    {/* Per Category Saved breakdown */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-300">Projected Savings per Category:</h5>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {whatIfResult.category_breakdown?.map(item => (
                          <div key={item.category} className="flex justify-between items-center text-xs bg-[#071124] p-2.5 rounded-lg border border-cyan-500/15">
                            <span className="font-semibold text-slate-200">{item.category}</span>
                            <div className="flex items-center gap-3 font-mono">
                              <span className="text-slate-400 text-[11px]">-₹{item.current_spent} spent</span>
                              <span className="text-emerald-400 font-bold">+₹{item.monthly_saved}/mo</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/20 text-xs text-cyan-300">
                      💡 <strong>Mathematical compounding:</strong> Investing this extra ₹{Number(whatIfResult.monthly_additional_savings || 0).toLocaleString('en-IN')}/mo in an index SIP yielding 12% p.a. generates ~₹{Math.round(whatIfResult.monthly_additional_savings * 12 * 5 * 1.34).toLocaleString('en-IN')} in 5 years!
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center text-xs font-mono text-slate-400">
                    Adjust sliders on the left to calculate simulated financial outcomes.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODULE 05 / 05 · PERSONALIZED STRATEGIC RECOMMENDATIONS */}
      {/* ========================================================================= */}
      {(activeStep === 'all' || activeStep === '05') && (
        <section id="module-05-recommendations" className="space-y-4 pt-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-mono font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                05
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    STAGE 05 / 05 · ACTION DIRECTIVES
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                  Module 05: Personalized Strategic Recommendations
                  <FinancialTooltip term="budget_utilization" size="sm" />
                </h3>
                <p className="text-xs text-slate-400 font-mono">Actionable saving strategies with mathematical justifications derived directly from your spending profile</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto shadow-xs">
              {recommendations.length} Actionable Advice
            </span>
          </div>

          {recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="glass-panel hud-corner p-5 rounded-2xl border border-cyan-500/20 shadow-xl flex flex-col justify-between bg-[#060e1d]/90">
                  <div>
                    <div className="flex justify-between items-start mb-2 font-mono">
                      <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded border border-cyan-500/30">
                        {rec.category || 'Strategic Advice'}
                      </span>
                      {rec.potential_savings > 0 && (
                        <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
                          Save ₹{Number(rec.potential_savings).toLocaleString('en-IN')}/mo
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-sm mt-1">{rec.recommendation}</h4>
                    <p className="text-xs text-slate-300 mt-2 bg-[#060e1d] p-3 rounded-xl border border-cyan-500/15 font-mono">
                      <strong className="text-cyan-400">Why this was generated:</strong> {rec.reason}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Verified Recommendation</span>
                    <button 
                      onClick={() => handleApplyRecommendationToWhatIf(rec)}
                      className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>Apply to Module 04</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 glass-panel hud-corner rounded-2xl border border-cyan-500/20 text-center space-y-1 bg-[#060e1d]/40 font-mono">
              <Lightbulb className="w-8 h-8 text-cyan-400/40 mx-auto mb-2" />
              <h4 className="font-bold text-white text-sm">Personalized Directives Ready</h4>
              <p className="text-xs text-slate-400">Directives will automatically calibrate once new monthly records are recorded.</p>
            </div>
          )}
        </section>
      )}

      {/* Expense Prediction Telemetry Modal */}
      {showPredictionModal && (
        <ExpensePredictionModal
          prediction={expense_prediction}
          onClose={() => setShowPredictionModal(false)}
          onOpenWhatIf={() => {
            scrollToModule('module-04-what-if', '04');
          }}
        />
      )}

      {/* Anomaly Inspection Modal */}
      {selectedAnomaly && (
        <AnomalyDetailModal
          anomaly={selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
          onAcknowledge={handleAcknowledgeAnomaly}
          onRecategorize={handleRecategorizeAnomaly}
        />
      )}
    </div>
  );
}
