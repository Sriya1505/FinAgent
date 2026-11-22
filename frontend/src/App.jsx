import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import Insights from './pages/Insights';
import Assistant from './pages/Assistant';
import Evaluation from './pages/Evaluation';
import Report from './pages/Report';
import AuthPage from './pages/AuthPage';
import AddTransactionModal from './components/AddTransactionModal';
import UploadDocumentModal from './components/UploadDocumentModal';
import CalendarModal from './components/CalendarModal';
import FinnyCompanion from './components/FinnyCompanion';
import { FinnyProvider } from './components/finny';
import { api } from './services/api';
import { supabaseAuth } from './services/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return api.getCurrentUser();
  });
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [initialTxDate, setInitialTxDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected route session verification on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = api.getToken();
      if (!token) {
        setCurrentUser(null);
        setIsVerifyingSession(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res && res.user) {
          setCurrentUser(res.user);
        } else {
          const storedUser = api.getCurrentUser();
          if (storedUser) {
            setCurrentUser(storedUser);
          } else {
            api.logout();
            setCurrentUser(null);
          }
        }
      } catch (err) {
        // Only terminate session if explicitly unauthorized (401) or token expired
        if (err.message && (err.message.includes('401') || err.message.includes('expired') || err.message.includes('invalid') || err.message.includes('token'))) {
          api.logout();
          setCurrentUser(null);
        } else {
          // Retain stored session on network glitch or offline
          const storedUser = api.getCurrentUser();
          if (storedUser) {
            setCurrentUser(storedUser);
          }
        }
      } finally {
        setIsVerifyingSession(false);
      }
    };

    checkSession();

    // Listen for external auth changes (e.g. Supabase session updates or cross-tab events)
    const unsubscribe = supabaseAuth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        setCurrentUser(session.user);
        api.setSession(session.token, session.user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        api.clearSession();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    triggerRefresh();
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
    triggerRefresh();
  };

  // 1. Initializing Session Loading State
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-center font-mono">
        <div className="space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20"></div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest glow-text-cyan">
              Verifying Encrypted Session...
            </p>
            <p className="text-[11px] text-slate-500">
              Deterministic Python Security Handshake
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Route Guard: Unauthenticated users are redirected to the dedicated Authentication Landing Page
  if (!currentUser) {
    return (
      <FinnyProvider>
        <AuthPage 
          onAuthSuccess={handleAuthSuccess} 
          initialView="login" 
        />
      </FinnyProvider>
    );
  }

  // 3. Authenticated Application: Full FinAgent Dashboard & Financial Modules
  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Personal Finance Dashboard',
          subtitle: ''
        };
      case 'transactions':
        return {
          title: 'Transaction Management',
          subtitle: ''
        };
      case 'budgets':
        return {
          title: 'Smart Budget Management',
          subtitle: ''
        };
      case 'savings':
        return {
          title: 'Savings Goal Planner',
          subtitle: ''
        };
      case 'insights':
        return {
          title: 'AI Insights & Predictions',
          subtitle: ''
        };
      case 'assistant':
        return {
          title: 'Finny AI',
          subtitle: ''
        };
      case 'evaluation':
        return {
          title: 'Neural Intelligence Engine',
          subtitle: ''
        };
      case 'report':
        return {
          title: 'Financial Statements & Reports',
          subtitle: ''
        };
      default:
        return { 
          title: 'FinAgent', 
          subtitle: 'Your Personal AI-Powered Financial Assistant' 
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <FinnyProvider>
      <div className="flex min-h-screen bg-[#040814] bg-cyber-radial cyber-grid-pattern font-sans text-slate-100 antialiased selection:bg-cyan-500 selection:text-black print:bg-white print:text-slate-900 print:block print:min-h-0 overflow-x-hidden">
        {/* Sidebar Navigation with User Profile & Logout */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentUser={currentUser}
          onOpenAuth={() => {}}
          onLogout={handleLogout}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 print:block print:w-full pb-20 md:pb-0 overflow-x-hidden">
          <Header
            title={title}
            subtitle={subtitle}
            onAddTx={() => {
              setInitialTxDate(null);
              setShowAddModal(true);
            }}
            onUploadCsv={() => setShowUploadModal(true)}
            currentUser={currentUser}
            onOpenAuth={() => {}}
            onLogout={handleLogout}
            onOpenCalendar={() => setShowCalendarModal(true)}
            onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          />

          <main className="flex-1 overflow-y-auto print:overflow-visible print:block print:w-full print:p-0">
            {activeTab === 'dashboard' && (
              <Dashboard 
                key={refreshKey}
                onAddTx={() => {
                  setInitialTxDate(null);
                  setShowAddModal(true);
                }} 
                onUploadCsv={() => setShowUploadModal(true)} 
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenCalendar={() => setShowCalendarModal(true)}
              />
            )}

            {activeTab === 'transactions' && (
              <Transactions 
                key={refreshKey}
                onAddTx={() => {
                  setInitialTxDate(null);
                  setShowAddModal(true);
                }} 
                onUploadCsv={() => setShowUploadModal(true)} 
              />
            )}

            {activeTab === 'budgets' && <Budgets key={refreshKey} />}

            {activeTab === 'savings' && <Savings key={refreshKey} />}

            {activeTab === 'insights' && <Insights key={refreshKey} />}

            {activeTab === 'assistant' && <Assistant key={refreshKey} />}

            {activeTab === 'evaluation' && <Evaluation key={refreshKey} />}

            {activeTab === 'report' && <Report key={refreshKey} currentUser={currentUser} />}
          </main>
        </div>

        {/* Global Modals for Authenticated Operations */}
        <AddTransactionModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setInitialTxDate(null);
          }}
          onSuccess={triggerRefresh}
          initialDate={initialTxDate}
        />

        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={triggerRefresh}
        />

        {/* Interactive Quantum Financial Calendar & Date Telemetry */}
        <CalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          currentUser={currentUser}
          onAddTxOnDate={(dateStr) => {
            setInitialTxDate(dateStr);
            setShowAddModal(true);
          }}
        />

        {/* Mobile Fixed Bottom Navigation Bar (< 768px) */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMore={() => setMobileMenuOpen(true)}
        />

        {/* Floating Animated AI Financial Companion Mascot */}
        <FinnyCompanion
          currentUser={currentUser}
          refreshKey={refreshKey}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      </div>
    </FinnyProvider>
  );
}
