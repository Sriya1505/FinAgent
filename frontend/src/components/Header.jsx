import React from 'react';
import { Plus, UploadCloud, Calendar, LogIn, LogOut, ShieldCheck, Activity, Sparkles } from 'lucide-react';

export default function Header({ 
  title, 
  subtitle, 
  onAddTx, 
  onUploadCsv, 
  currentUser, 
  onOpenAuth, 
  onLogout,
  onOpenCalendar
}) {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-[#050c1b]/80 backdrop-blur-2xl border-b border-cyan-500/20 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] print:hidden">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Interactive Month & Date Calendar Trigger */}
        <button
          type="button"
          onClick={onOpenCalendar}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-white text-xs font-semibold rounded-xl border border-cyan-500/25 hover:border-cyan-400/60 transition-all shadow-xs cursor-pointer group"
          title="Click to view interactive Calendar & Date details"
        >
          <Calendar className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>{currentMonth}</span>
          <span className="text-[10px] text-cyan-400/80 font-mono bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/20 group-hover:border-cyan-400/40">
            Calendar →
          </span>
        </button>

        {/* Upload Documents button */}
        <button
          onClick={onUploadCsv}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:text-white"
        >
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload Documents</span>
        </button>

        {/* Add Transaction button - Neon Gradient */}
        <button
          onClick={onAddTx}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>

        {/* User Auth Section */}
        <div className="pl-2 border-l border-cyan-500/20 flex items-center gap-2">
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
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 rounded-xl transition-colors"
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
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 rounded-xl transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
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
