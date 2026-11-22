import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PiggyBank, 
  Target, 
  Sparkles, 
  BotMessageSquare, 
  FileText, 
  LogOut, 
  LogIn, 
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenAuth, 
  onLogout 
}) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      id: 'transactions', 
      label: 'Transactions', 
      icon: ReceiptText 
    },
    { 
      id: 'budgets', 
      label: 'Budgets & Finny', 
      icon: PiggyBank
    },
    { 
      id: 'savings', 
      label: 'Savings Goals', 
      icon: Target 
    },
    { 
      id: 'insights', 
      label: 'AI Insights', 
      icon: Sparkles
    },
    { 
      id: 'assistant', 
      label: 'Finny AI Frontier', 
      icon: BotMessageSquare
    },
    { 
      id: 'evaluation', 
      label: 'Neural Engine', 
      icon: Cpu
    },
    { 
      id: 'report', 
      label: 'Financial Report', 
      icon: FileText 
    }
  ];

  const handleTabClick = (item) => {
    setActiveTab(item.id);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-64 bg-[#050c1b]/95 backdrop-blur-2xl text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-cyan-500/20 shadow-[4px_0_30px_rgba(0,180,255,0.05)] relative z-20 font-sans print:hidden">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-cyan-500/15 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#38bdf8] via-[#0284c7] to-[#2563eb] flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.35)] shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4h14a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2v2.8h7.6a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2V20H5V4z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight">FinAgent</h1>
            <p className="text-[11px] text-cyan-400 font-medium tracking-wide">Personal Finance Agent</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/25 to-transparent text-cyan-300 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] font-bold'
                  : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800/50 hover:border hover:border-cyan-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                <span>{item.label}</span>
              </div>
              
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isActive ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40' : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-cyan-500/15 bg-[#030814]/80">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-[0_0_12px_rgba(6,182,212,0.4)] shrink-0">
                {getInitials(currentUser.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-cyan-400/70 truncate font-mono">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/30 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Sign Up</span>
          </button>
        )}
      </div>
    </aside>
  );
}
