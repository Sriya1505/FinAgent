import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export default function CalendarModal({ 
  isOpen, 
  onClose, 
  onAddTxOnDate,
  currentUser 
}) {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return today.toISOString().split('T')[0];
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load transactions when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchTxs = async () => {
      setLoading(true);
      try {
        const res = await api.getTransactions();
        if (isMounted) {
          setTransactions(res?.transactions || []);
        }
      } catch (err) {
        console.warn('Failed to load transactions for calendar:', err);
        const fallback = api.handleOfflineFallback('/transactions');
        if (isMounted) {
          setTransactions(fallback?.transactions || []);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTxs();
    return () => { isMounted = false; };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calendar calculations
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'long' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  // Map transactions by YYYY-MM-DD
  const txMap = useMemo(() => {
    const map = {};
    for (const tx of transactions) {
      const d = String(tx.date || '').slice(0, 10);
      if (!d) continue;
      if (!map[d]) {
        map[d] = { income: 0, expense: 0, items: [] };
      }
      map[d].items.push(tx);
      const amt = Number(tx.amount || 0);
      if (tx.type === 'income') {
        map[d].income += amt;
      } else {
        map[d].expense += amt;
      }
    }
    return map;
  }, [transactions]);

  // Month-level totals
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let activeDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${currentMonthPrefix}-${String(day).padStart(2, '0')}`;
      const dayData = txMap[dStr];
      if (dayData && dayData.items.length > 0) {
        activeDays++;
        income += dayData.income;
        expense += dayData.expense;
      }
    }

    return {
      income,
      expense,
      activeDays,
      zeroSpendDays: daysInMonth - activeDays
    };
  }, [currentMonthPrefix, daysInMonth, txMap]);

  // Selected date details
  const selectedDayData = txMap[selectedDateStr] || { income: 0, expense: 0, items: [] };
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateStr) return '';
    try {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#070e1e] border border-cyan-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Bar Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0d1c38] via-[#09152b] to-[#060e1d] border-b border-cyan-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <CalendarIcon className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-lg tracking-tight">Financial Calendar & Date Inspector</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Click any date to view inside cashflow, recorded transactions, and daily telemetry</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Calendar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Month Navigation & Summary Strip */}
          <div className="px-6 py-3 bg-[#050a16] border-b border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Month & Year Controller */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 hover:border-cyan-400 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-sm font-extrabold text-white font-mono px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded-xl min-w-[150px] text-center">
                {monthName} {currentYear}
              </span>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 hover:border-cyan-400 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 rounded-xl transition-all ml-1 cursor-pointer"
              >
                Today
              </button>
            </div>

            {/* Quick Month Metrics */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                In: +₹{Number(monthStats.income || 0).toLocaleString('en-IN')}
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Out: -₹{Number(monthStats.expense || 0).toLocaleString('en-IN')}
              </span>
              <span className="hidden sm:inline-block text-slate-400">
                Active Days: <strong className="text-cyan-300">{monthStats.activeDays}</strong>/{daysInMonth}
              </span>
            </div>
          </div>

          {/* Body: Calendar Grid + Date Inspector */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Columns: Monthly Calendar Grid */}
            <div className="lg:col-span-7 space-y-2">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-slate-400 pb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-1 uppercase tracking-wider">{day}</div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty leading padding days */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl bg-transparent border border-transparent opacity-0 pointer-events-none" />
                ))}

                {/* Actual Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${currentMonthPrefix}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = selectedDateStr === dateStr;
                  const isToday = today.toISOString().split('T')[0] === dateStr;
                  const dataForDay = txMap[dateStr];
                  const hasIncome = dataForDay && dataForDay.income > 0;
                  const hasExpense = dataForDay && dataForDay.expense > 0;
                  const txCount = dataForDay ? dataForDay.items.length : 0;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-16 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all relative overflow-hidden cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400' 
                          : isToday
                            ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400'
                            : 'bg-slate-950/60 border-cyan-500/10 hover:border-cyan-500/30 hover:bg-slate-900/50'
                      }`}
                    >
                      {/* Top row: day number + today pill */}
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-mono font-bold ${
                          isSelected ? 'text-white' : isToday ? 'text-cyan-400' : 'text-slate-300'
                        }`}>
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] animate-pulse" />
                        )}
                      </div>

                      {/* Cashflow Indicators */}
                      <div className="w-full space-y-0.5">
                        {hasExpense && (
                          <div className="text-[9px] font-mono font-bold text-rose-400 truncate leading-none">
                            -₹{Number(dataForDay.expense || 0).toLocaleString('en-IN')}
                          </div>
                        )}
                        {hasIncome && (
                          <div className="text-[9px] font-mono font-bold text-emerald-400 truncate leading-none">
                            +₹{Number(dataForDay.income || 0).toLocaleString('en-IN')}
                          </div>
                        )}
                        {!hasIncome && !hasExpense && (
                          <div className="text-[9px] text-slate-600 font-mono leading-none">
                            —
                          </div>
                        )}
                      </div>

                      {/* Transaction Count Badge */}
                      {txCount > 0 && (
                        <div className="flex items-center gap-1">
                          {hasExpense && <span className="w-1 h-1 rounded-full bg-rose-400"></span>}
                          {hasIncome && <span className="w-1 h-1 rounded-full bg-emerald-400"></span>}
                          <span className="text-[8px] font-mono text-slate-400">{txCount} tx</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Columns: Selected Date Details Inspector ("See Inside") */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-cyan-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Header for Selected Date */}
                <div className="border-b border-cyan-500/15 pb-3">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Selected Date Telemetry</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-1">{formattedSelectedDate}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">Date Key: {selectedDateStr}</p>
                </div>

                {/* Day Summary Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25">
                    <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">Inflow</span>
                    <span className="text-sm font-black text-white font-mono">+₹{Number(selectedDayData.income || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/25">
                    <span className="text-[10px] font-mono text-rose-400 block uppercase font-bold">Outflow</span>
                    <span className="text-sm font-black text-white font-mono">-₹{Number(selectedDayData.expense || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Inside Transactions List for this Date */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      Recorded Transactions ({selectedDayData.items.length})
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      Net: ₹{Number((selectedDayData.income || 0) - (selectedDayData.expense || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {selectedDayData.items.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedDayData.items.map((tx, idx) => (
                        <div
                          key={tx.transaction_id || idx}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/15 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{tx.description}</p>
                            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/20">
                              {tx.category}
                            </span>
                          </div>
                          <span className={`text-xs font-mono font-black shrink-0 ${
                            tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-slate-900/40 border border-dashed border-cyan-500/20 text-center space-y-1.5">
                      <CheckCircle2 className="w-6 h-6 text-cyan-400/60 mx-auto" />
                      <p className="text-xs font-bold text-white">No transactions on this date</p>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Zero spending recorded. Your budget was 100% preserved for this day!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Add Transaction for this exact date */}
              <div className="pt-2 border-t border-cyan-500/15">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onAddTxOnDate) {
                      onAddTxOnDate(selectedDateStr);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Transaction on {selectedDateStr}</span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
