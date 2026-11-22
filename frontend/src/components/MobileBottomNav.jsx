import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PiggyBank, 
  Target, 
  Sparkles, 
  Menu 
} from 'lucide-react';

export default function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  onOpenMore 
}) {
  const primaryTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'savings', label: 'Goals', icon: Target },
    { id: 'insights', label: 'Insights', icon: Sparkles }
  ];

  const isMoreActive = ['assistant', 'evaluation', 'report'].includes(activeTab);

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#050c1b]/95 backdrop-blur-2xl border-t border-cyan-500/25 shadow-[0_-10px_30px_rgba(0,0,0,0.7)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 px-2 transition-all"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive 
                  ? 'text-cyan-300 font-bold' 
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              {/* Active Ambient Glow Indicator */}
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
              <Icon 
                className={`w-5 h-5 transition-transform ${
                  isActive 
                    ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] scale-110' 
                    : 'text-slate-400'
                }`} 
              />
              <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 'More' Button for secondary tabs & profile */}
        <button
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            isMoreActive 
              ? 'text-cyan-300 font-bold' 
              : 'text-slate-400 hover:text-cyan-200'
          }`}
        >
          {isMoreActive && (
            <span className="absolute -top-1 w-8 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          )}
          <div className="relative">
            <Menu 
              className={`w-5 h-5 transition-transform ${
                isMoreActive 
                  ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)] scale-110' 
                  : 'text-slate-400'
              }`} 
            />
            {isMoreActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#050c1b]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
