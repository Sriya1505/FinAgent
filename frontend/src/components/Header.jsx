import React from 'react';
import { Plus, UploadCloud, Calendar, LogIn, LogOut, ShieldCheck, Activity, Sparkles, Menu } from 'lucide-react';

export default function Header({ 
  title, 
  subtitle, 
  onAddTx, 
  onUploadCsv, 
  currentUser, 
  onOpenAuth, 
  onLogout,
  onOpenCalendar,
  onToggleMobileMenu
}) {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-[#050c1b]/80 backdrop-blur-2xl border-b border-cyan-500/20 px-4 sm:px-8 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] print:hidden">
      {/* Mobile Sticky Top Brand Row (< 768px) */}
      <div className="flex items-center justify-between w-full md:hidden pb-2.5 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#38bdf8] via-[#0284c7] to-[#2563eb] flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4h14a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2v2.8h7.6a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2V20H5V4z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">FinAgent</h1>
            <p className="text-[10px] text-cyan-400 font-medium tracking-wide leading-none">Personal Finance Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <div 
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 cursor-pointer"
              onClick={() => onOpenAuth && onOpenAuth('login')}
              title={currentUser.name}
            >
              {getInitials(currentUser.name)}
            </div>
          )}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-2 min-w-[44px] min-h-[44px] text-slate-300 hover:text-white rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>
          )}
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] truncate">
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium truncate">{subtitle}</p>}
      </div>

      {/* Header Actions Row (Wrapping / Responsive Stacking) */}
      <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
        {/* Interactive Month & Date Calendar Trigger */}
        <button
          type="button"
          onClick={onOpenCalendar}
          className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-white text-xs font-semibold rounded-xl border border-cyan-500/25 hover:border-cyan-400/60 transition-all shadow-xs cursor-pointer group"
          title="Click to view interactive Calendar & Date details"
        >
          <Calendar className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>{currentMonth}</span>
          <span className="text-[10px] text-cyan-400/80 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20 group-hover:border-cyan-400/40 hidden sm:inline">
            Calendar →
          </span>
        </button>

        {/* Upload Documents button */}
        <button
          onClick={onUploadCsv}
          className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:text-white cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload</span>
        </button>

        {/* Add Transaction button - Neon Gradient */}
        <button
          onClick={onAddTx}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>

        {/* User Auth Section (Desktop only; on mobile, available in top bar & drawer) */}
        <div className="hidden md:flex pl-2 border-l border-cyan-500/20 items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2.5 px-3 py-1 bg-slate-900/90 border border-cyan-500/30 rounded-xl cursor-pointer hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                onClick={() => onOpenAuth('login')}
                title="Account Settings"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                  {getInitials(currentUser.name)}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-bold text-white block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-cyan-400/80 block leading-none font-mono">{currentUser.email}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 rounded-xl transition-colors min-h-[38px] cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 rounded-xl transition-colors min-h-[38px] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] min-h-[38px] cursor-pointer"
              >
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
