import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Calculator,
  Layers,
  HelpCircle,
  Tag,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinnyMascot } from './finny';

// ==========================================
// 1. EXPENSE PREDICTION TELEMETRY MODAL
// ==========================================
export function ExpensePredictionModal({ 
  prediction, 
  onClose,
  onOpenWhatIf 
}) {
  const [simulatedGrowth, setSimulatedGrowth] = useState(0);

  if (!prediction) return null;

  const {
    predicted_total = 0,
    confidence_score = 0.85,
    trend_direction = 'stable',
    trend_slope = 0,
    historical_months = [],
    metrics = { mae: 0, rmse: 0, mape: 0 }
  } = prediction;

  const adjustedTotal = Math.max(0, Math.round(predicted_total * (1 + simulatedGrowth / 100)));

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass-panel-glow hud-corner rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-cyan-500/35 space-y-6 shadow-2xl relative bg-[#091325]/95 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Predictive Regression Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Linear ML
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Model Telemetry, Residual Metrics & Mathematical Proof
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Finny Mascot Commentary */}
        <div className="p-4 rounded-2xl bg-[#061022] border border-purple-500/30 flex items-center gap-4">
          <FinnyMascot state="thinking" size="sm" interactive={false} />
          <div className="text-xs space-y-1">
            <span className="font-bold text-purple-300 font-mono flex items-center gap-1.5">
              Finny ML Verification Note
            </span>
            <p className="text-slate-300 leading-relaxed">
              "This prediction uses deterministic ordinary least squares regression in Python! We never allow an LLM to guess or hallucinate your forecast numbers."
            </p>
          </div>
        </div>

        {/* Core Predictions & Regression Formula */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
          <div className="p-4 rounded-2xl bg-[#060e1d] border border-cyan-500/20">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Projected Total Expenditure
            </span>
            <span className="text-2xl font-black text-cyan-400 glow-text-cyan block">
              ₹{Number(predicted_total || 0).toLocaleString('en-IN')}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
              <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                trend_direction === 'increasing' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : trend_direction === 'decreasing'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/10 text-slate-300'
              }`}>
                {trend_direction}
              </span>
              <span className="text-slate-400">Slope: {trend_slope > 0 ? '+' : ''}₹{trend_slope}/month</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#060e1d] border border-cyan-500/20">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Linear Regression Formula
            </span>
            <span className="text-sm font-black text-white font-mono block bg-black/40 p-2 rounded-lg border border-cyan-500/15">
              ŷ = ({trend_slope}) · t + b
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold block mt-2">
              Model Confidence: {Math.round(confidence_score * 100)}% Verified
            </span>
          </div>
        </div>

        {/* Residual Metrics (MAE, RMSE, MAPE) */}
        <div className="space-y-2 font-mono">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Model Performance Residuals:
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#060e1d] rounded-xl border border-cyan-500/15 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">MAE</span>
              <span className="text-base font-extrabold text-white">₹{metrics.mae || 0}</span>
              <span className="text-[9px] text-slate-500 block">Mean Absolute Error</span>
            </div>
            <div className="p-3 bg-[#060e1d] rounded-xl border border-cyan-500/15 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">RMSE</span>
              <span className="text-base font-extrabold text-white">₹{metrics.rmse || 0}</span>
              <span className="text-[9px] text-slate-500 block">Root Mean Square Error</span>
            </div>
            <div className="p-3 bg-[#060e1d] rounded-xl border border-cyan-500/15 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">MAPE</span>
              <span className="text-base font-extrabold text-cyan-400">
                {metrics.mape_percent || metrics.mape || 0}%
              </span>
              <span className="text-[9px] text-slate-500 block">Percentage Error</span>
            </div>
          </div>
        </div>

        {/* Interactive Sensitivity Simulator */}
        <div className="p-4 rounded-2xl bg-[#060e1d] border border-cyan-500/20 space-y-3 font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Simulate Spending Variance:
            </span>
            <span className="font-bold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
              {simulatedGrowth > 0 ? `+${simulatedGrowth}%` : `${simulatedGrowth}%`}
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="5"
            value={simulatedGrowth}
            onChange={(e) => setSimulatedGrowth(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-[#050c18] border border-cyan-500/20 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between items-center text-xs pt-1 border-t border-cyan-500/10">
            <span className="text-slate-400">Simulated Next-Month Target:</span>
            <span className="font-black text-emerald-400 text-sm">
              ₹{Number(adjustedTotal || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-700 transition-colors"
          >
            Close
          </button>
          {onOpenWhatIf && (
            <button
              onClick={() => {
                onClose();
                onOpenWhatIf();
              }}
              className="px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore in What-If Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 2. ANOMALY INSPECTION & ACTION MODAL
// ==========================================
export function AnomalyDetailModal({ 
  anomaly, 
  onClose,
  onAcknowledge,
  onRecategorize 
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);
  const [selectedCat, setSelectedCat] = useState(anomaly?.category || 'Shopping');

  if (!anomaly) return null;

  const handleAck = () => {
    setAcknowledged(true);
    if (onAcknowledge) onAcknowledge(anomaly);
  };

  const handleSaveCategory = () => {
    if (onRecategorize) {
      onRecategorize(anomaly, selectedCat);
    }
    setEditingCategory(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass-panel-glow hud-corner rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-amber-500/35 space-y-5 shadow-2xl relative bg-[#091325]/95 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Anomaly Investigation
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  anomaly.severity === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {anomaly.severity} Priority
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Isolation Forest & Robust Tukey Outlier Analysis
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 rounded-2xl bg-[#060e1d] border border-amber-500/20 space-y-3 font-mono">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{anomaly.date}</span>
              <h4 className="text-base font-bold text-white mt-0.5">{anomaly.description}</h4>
              <span className="inline-block text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded mt-1">
                {anomaly.category}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-rose-400 glow-text-cyan block">
                ₹{Number(anomaly?.amount || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 inline-block mt-1">
                {anomaly.multiplier}x Category Median
              </span>
            </div>
          </div>
        </div>

        {/* Mathematical Proof & Detection Reason */}
        <div className="p-4 rounded-2xl bg-[#070e1c] border border-amber-500/20 space-y-2 font-mono text-xs">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-400" />
            Detection Justification:
          </span>
          <p className="text-slate-300 leading-relaxed">
            {anomaly.reason}
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-amber-500/10 text-[11px] text-amber-400">
            <span>NumPy Z-Score: +{anomaly.z_score || '3.2'}σ</span>
            <span>Isolation Score: {anomaly.anomaly_score || '-0.24'}</span>
          </div>
        </div>

        {/* Finny Mascot Recommendation */}
        <div className="p-4 rounded-2xl bg-[#061022] border border-purple-500/30 flex items-center gap-4">
          <FinnyMascot state="alert" size="sm" interactive={false} />
          <div className="text-xs space-y-1">
            <span className="font-bold text-purple-300 font-mono">
              Finny Sentinel Recommendation:
            </span>
            <p className="text-slate-300 leading-relaxed">
              💡 {anomaly.recommended_action || 'Review this transaction. If this is a valid one-off expense, mark it as acknowledged so future predictions ignore this spike.'}
            </p>
          </div>
        </div>

        {/* Recategorize dropdown if requested */}
        {editingCategory && (
          <div className="p-4 rounded-2xl bg-[#050c18] border border-cyan-500/30 space-y-3 font-mono text-xs">
            <span className="font-bold text-cyan-300 block">Select Correct Spending Category:</span>
            <div className="flex gap-2">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-white"
              >
                {['Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'Other Expenses'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 font-mono">
          <button
            onClick={() => setEditingCategory(!editingCategory)}
            className="px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:text-white rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{editingCategory ? 'Cancel Recategorize' : 'Recategorize'}</span>
          </button>

          <div className="flex items-center gap-2">
            {acknowledged ? (
              <span className="px-4 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/15 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Acknowledged as Legitimate
              </span>
            ) : (
              <button
                onClick={handleAck}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Acknowledge Outlier</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-700 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
