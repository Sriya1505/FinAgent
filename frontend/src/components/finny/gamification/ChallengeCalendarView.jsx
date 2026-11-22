import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Target, 
  Flame, 
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';

export default function ChallengeCalendarView({ 
  challenges = [], 
  streakDays = 1,
  onSelectDate 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayNum, setSelectedDayNum] = useState(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const safeChallenges = Array.isArray(challenges) ? challenges : (challenges?.challenges || []);
  const activeDaily = safeChallenges.filter(c => c.category === 'daily' && c.status === 'active');
  const activeWeekly = safeChallenges.filter(c => c.category === 'weekly' && c.status === 'active');
  const activeMonthly = safeChallenges.filter(c => c.category === 'monthly' && c.status === 'active');

  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > streakDays) || 100;

  return (
    <div className="glass-panel-glow hud-corner p-6 sm:p-7 rounded-3xl border border-cyan-500/30 space-y-5 bg-gradient-to-br from-[#060e1d] to-[#040814] font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base font-sans">
              Financial Challenge Calendar & Streaks
            </h3>
            <p className="text-slate-400 text-[11px]">
              Track daily habits, weekly missions and monthly discipline milestones
            </p>
          </div>
        </div>

        {/* Streak Flame Pill */}
        <div className="flex items-center gap-2 bg-[#040814] px-4 py-2 rounded-2xl border border-amber-500/30 text-amber-300 font-bold">
          <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
          <span>{streakDays} Day Discipline Streak!</span>
          <span className="text-[10px] text-slate-500">(Next Milestone: {nextMilestone}d)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Calendar Month Switcher */}
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-black text-white font-sans">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 text-slate-300 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20 text-slate-300 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-500 uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day Numbers */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2.5 rounded-xl bg-transparent"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === new Date().getDate() && month === new Date().getMonth();
              const isSelected = day === selectedDayNum;
              const isStreakDay = isToday || (day < new Date().getDate() && day >= (new Date().getDate() - streakDays));

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDayNum(day)}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all text-xs font-mono relative flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-black border-cyan-300 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                      : isToday
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-bold'
                      : isStreakDay
                      ? 'bg-[#09152b] border-amber-500/30 text-amber-300'
                      : 'bg-[#040814]/70 border-slate-800 text-slate-400 hover:border-cyan-500/40'
                  }`}
                >
                  <span>{day}</span>
                  {isStreakDay && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Quests & Timeline */}
        <div className="p-4 rounded-2xl bg-[#040814] border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
            <span className="font-bold text-white text-xs">
              Missions for Day {selectedDayNum}
            </span>
            <span className="text-[10px] text-cyan-400">
              {monthNames[month]} {selectedDayNum}, {year}
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activeDaily.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 block">Daily Sprints:</span>
                {activeDaily.map(c => (
                  <div key={c.id} className="p-2 rounded-xl bg-slate-900/80 border border-cyan-500/15 flex items-center justify-between text-[11px]">
                    <span className="truncate max-w-[150px]">{c.icon} {c.title}</span>
                    <span className="text-cyan-300 font-bold">{c.progress_pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {activeWeekly.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">Weekly Quests:</span>
                {activeWeekly.map(c => (
                  <div key={c.id} className="p-2 rounded-xl bg-slate-900/80 border border-cyan-500/15 flex items-center justify-between text-[11px]">
                    <span className="truncate max-w-[150px]">{c.icon} {c.title}</span>
                    <span className="text-cyan-300 font-bold">{c.progress_pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {activeMonthly.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Monthly Campaign:</span>
                {activeMonthly.map(c => (
                  <div key={c.id} className="p-2 rounded-xl bg-slate-900/80 border border-cyan-500/15 flex items-center justify-between text-[11px]">
                    <span className="truncate max-w-[150px]">{c.icon} {c.title}</span>
                    <span className="text-purple-300 font-bold">{c.progress_pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {activeDaily.length === 0 && activeWeekly.length === 0 && activeMonthly.length === 0 && (
              <p className="text-slate-500 text-[11px] italic text-center py-4">
                No active challenges scheduled for this date. Accept a quest from the catalog below!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
