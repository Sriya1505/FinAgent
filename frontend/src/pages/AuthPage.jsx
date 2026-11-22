import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  RefreshCw,
  ArrowLeft,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import FinnyMascot from '../components/finny/FinnyMascot';

export default function AuthPage({ onAuthSuccess, initialView = 'login' }) {
  const [view, setView] = useState(initialView); // 'login' | 'signup' | 'forgot' | 'reset'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Initialize remembered email and preference from localStorage
  const rememberedEmail = typeof window !== 'undefined' ? (localStorage.getItem('finagent_remembered_email') || '') : '';
  const rememberedPref = typeof window !== 'undefined' ? (localStorage.getItem('finagent_remember_me') !== 'false') : true;

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: rememberedEmail,
    password: '',
    rememberMe: rememberedPref
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot / Reset password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({
    resetCode: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Live Agent Cluster Interactive State
  const [activeAgent, setActiveAgent] = useState('Prediction');

  const agentDetails = {
    Supervisor: {
      status: '> Supervisor cluster orchestrating 4 domain-specific subagents',
      bars: [28, 42, 24, 38, 54, 40, 26, 46, 32, 22, 38, 52, 28, 44],
      activeIndices: [1, 4, 11]
    },
    Transaction: {
      status: '> Transaction agent categorized 100% of ledger without LLM math',
      bars: [22, 36, 56, 30, 42, 26, 36, 62, 44, 22, 32, 42, 26, 36],
      activeIndices: [2, 7, 8]
    },
    Budget: {
      status: '> Budget agent computing category limits and daily safe runway',
      bars: [42, 26, 36, 52, 32, 46, 22, 36, 58, 42, 26, 36, 46, 32],
      activeIndices: [3, 8, 12]
    },
    Prediction: {
      status: '> Prediction agent forecast next 30 days of spend',
      bars: [28, 38, 20, 56, 32, 22, 16, 48, 36, 18, 22, 42, 26, 40],
      activeIndices: [3, 7, 11]
    },
    Anomaly: {
      status: '> Anomaly agent evaluating robust z-scores and IQR outlier thresholds',
      bars: [26, 32, 22, 36, 66, 26, 22, 32, 42, 58, 22, 32, 26, 36],
      activeIndices: [4, 9]
    }
  };

  // Email regex validator
  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email.trim());
  };

  // Real-time password strength calculation
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-400' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-cyan-400', textColor: 'text-cyan-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400', textColor: 'text-emerald-400' };
  };

  const strength = calculateStrength(signupForm.password);

  const resetMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleTabSwitch = (newView) => {
    resetMessages();
    setView(newView);
  };

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    const email = loginForm.email.trim();
    const password = loginForm.password;

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        email,
        password,
        rememberMe: loginForm.rememberMe
      });
      // Store or clear remembered login information based on checkbox
      try {
        if (loginForm.rememberMe) {
          localStorage.setItem('finagent_remembered_email', email);
          localStorage.setItem('finagent_remember_me', 'true');
        } else {
          localStorage.removeItem('finagent_remembered_email');
          localStorage.setItem('finagent_remember_me', 'false');
        }
      } catch (e) {
        console.warn('Could not persist remembered email:', e);
      }
      setSuccessMsg(res.message || 'Authenticated successfully! Redirecting...');
      setTimeout(() => {
        onAuthSuccess(res.user);
      }, 400);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SIGN UP HANDLER
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    const name = signupForm.name.trim();
    const email = signupForm.email.trim();
    const password = signupForm.password;
    const confirmPassword = signupForm.confirmPassword;

    if (!name || name.length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (!email || !isValidEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[\d\W_]/.test(password)) {
      setError('Password must contain at least one letter and at least one number or special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({
        name,
        email,
        password,
        confirmPassword
      });

      setSuccessMsg(res.message || 'Account created successfully! Please sign in with your credentials.');
      setLoginForm(prev => ({ ...prev, email: email, password: '' }));
      setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
      setView('login');
    } catch (err) {
      setError(err.message || 'Registration failed. This email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  // 3. FORGOT PASSWORD HANDLER
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    const email = forgotEmail.trim();
    if (!email || !isValidEmail(email)) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword({ email });
      setSuccessMsg(`Recovery code generated! Code: ${res.reset_code} (Valid for 15 minutes)`);
      setView('reset');
    } catch (err) {
      setError(err.message || 'Unable to generate reset code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. RESET PASSWORD HANDLER
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!resetForm.resetCode || resetForm.resetCode.length !== 6) {
      setError('Please enter the 6-digit recovery code.');
      return;
    }
    if (resetForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        email: forgotEmail.trim(),
        reset_code: resetForm.resetCode.trim(),
        new_password: resetForm.newPassword
      });
      setSuccessMsg(res.message || 'Password reset successfully! Please sign in with your new password.');
      setLoginForm(prev => ({ ...prev, email: forgotEmail.trim(), password: '' }));
      setView('login');
    } catch (err) {
      setError(err.message || 'Password reset failed. Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060b14] text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Soft Ambient Light Gradients matching PDF aesthetic */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[550px] h-[550px] bg-blue-900/15 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Main Dual-Pane Container */}
      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* ================= LEFT HERO SHOWCASE PANE (PROMINENT LARGE FINNY) ================= */}
        <div className="hidden lg:flex lg:col-span-6 flex-col items-center text-center space-y-6">
          
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#38bdf8] via-[#0284c7] to-[#2563eb] flex items-center justify-center text-white shadow-[0_0_25px_rgba(56,189,248,0.35)] shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4h14a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2v2.8h7.6a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2V20H5V4z" fill="currentColor"/>
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-[26px] font-black text-white tracking-tight leading-tight">
                FinAgent
              </h1>
              <p className="text-xs text-[#38bdf8] font-medium tracking-wide">
                AI-Powered Personal Finance Agent
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Master your money with <span className="text-[#38bdf8]">FinAgent</span> & <span className="text-purple-400">Finny</span>
            </h2>
          </div>

          {/* ================= PROMINENT LARGE FINNY MASCOT HERO (280-350px) ================= */}
          <div className="relative flex flex-col items-center justify-center pt-2 pb-4">
            
            {/* Contextual Speech Bubble */}
            <div className="mb-4 max-w-sm px-4 py-3 bg-[#0a1428]/95 border border-purple-400/40 rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.25)] relative text-center">
              <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
                {view === 'signup' 
                  ? (signupForm.name.trim().length > 1
                      ? `Yay ${signupForm.name.trim()}! A new financial journey begins. Let's do this together! 🐻✨`
                      : "Yay! A new financial journey begins. Let's do this together! 🐻✨")
                  : view === 'forgot' || view === 'reset'
                  ? "Don't worry! I'll help you regain access to your account! 🛡️"
                  : "Hey! Welcome back. Ready to take control of your finances? 🐻💫"
                }
              </p>
              {/* Downward Speech Bubble Tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#0a1428] border-r border-b border-purple-400/40 transform rotate-45"></div>
            </div>

            {/* 3D Large Hero Mascot (320px Desktop) */}
            <div className="relative group">
              {/* Ambient Soft Cyber Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-blue-600/30 blur-2xl pointer-events-none"></div>

              <FinnyMascot
                state={view === 'signup' ? 'excited' : 'welcoming'}
                size="hero"
                lookAtForm={true}
                interactive={true}
                className="relative z-10"
              />

              {/* Glowing Pedestal Under Finny */}
              <div className="w-64 h-12 bg-gradient-to-r from-cyan-500/30 via-purple-500/50 to-blue-500/30 rounded-[100%] blur-md -mt-6 mx-auto border-b border-purple-400/40 pointer-events-none"></div>
              <div className="w-48 h-3 bg-purple-400/30 rounded-full blur-sm -mt-2 mx-auto pointer-events-none"></div>
            </div>

            {/* Companion Identity Badge */}
            <div className="mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-bold">Finny</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT CARD PANE ================= */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[440px] bg-[#091325]/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative">
            
            {/* Mobile Mascot Header (compact responsive 140-160px) */}
            <div className="block lg:hidden text-center mb-6">
              <div className="inline-flex flex-col items-center">
                <div className="mb-2 px-3 py-1.5 bg-[#0a1428]/95 border border-purple-400/40 rounded-xl text-center max-w-xs shadow-sm">
                  <p className="text-[11px] font-medium text-slate-100">
                    {view === 'signup' 
                      ? "Yay! Let's build your financial future together! 🐻✨"
                      : "Hey! Welcome back to FinAgent! 🐻💫"}
                  </p>
                </div>
                <FinnyMascot
                  state={view === 'signup' ? 'excited' : 'welcoming'}
                  size="xl"
                  interactive={true}
                />
              </div>
            </div>

            {/* Top Switcher Segmented Control */}
            <div className="bg-[#050b16] p-1 rounded-xl flex items-center border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-2 text-center text-xs sm:text-sm rounded-lg font-semibold transition-all cursor-pointer ${
                  view === 'login' || view === 'forgot' || view === 'reset'
                    ? 'bg-[#0d2244] border border-cyan-500/50 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className={`flex-1 py-2 text-center text-xs sm:text-sm rounded-lg font-semibold transition-all cursor-pointer ${
                  view === 'signup'
                    ? 'bg-[#0d2244] border border-cyan-500/50 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create account
              </button>
            </div>

            {/* Error / Success Banners */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ================= VIEW: SIGN IN ================= */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5 text-left">
                {/* Header */}
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Welcome back to FinAgent
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Sign in to access your private financial dashboard and AI models.
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('forgot')}
                      className="text-xs text-[#38bdf8] hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="At least 8 characters"
                      required
                      autoComplete="current-password"
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-16 py-3 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400 hover:text-white cursor-pointer select-none"
                    >
                      {showLoginPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 pt-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#060c18] border-slate-700 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer accent-[#22d3ee]"
                    />
                    <span className="text-xs text-slate-300 font-medium">
                      Remember me for 7 days
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] hover:from-[#38bdf8] hover:to-[#2563eb] text-slate-950 hover:text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign in to FinAgent</span>
                  )}
                </button>
              </form>
            )}

            {/* ================= VIEW: SIGN UP ================= */}
            {view === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-left">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Create account
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Register to access your private financial dashboard and AI models.
                  </p>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="Alex Sharma"
                      required
                      autoComplete="name"
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="At least 8 characters"
                      required
                      autoComplete="new-password"
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-16 py-2.5 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400 hover:text-white cursor-pointer select-none"
                    >
                      {showSignupPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>

                  {signupForm.password && (
                    <div className="pt-0.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Strength:</span>
                        <span className={strength.textColor}>{strength.label}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 transition-all ${
                              step <= strength.score ? strength.color : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-16 py-2.5 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400 hover:text-white cursor-pointer select-none"
                    >
                      {showConfirmPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] hover:from-[#38bdf8] hover:to-[#2563eb] text-slate-950 hover:text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create FinAgent Account</span>
                  )}
                </button>
              </form>
            )}

            {/* ================= VIEW: FORGOT PASSWORD ================= */}
            {view === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Reset password
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Enter your registered email address to receive a secure 6-digit recovery code.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] hover:from-[#38bdf8] hover:to-[#2563eb] text-slate-950 hover:text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending code...' : 'Send Recovery Code'}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-mono"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign in</span>
                  </button>
                </div>
              </form>
            )}

            {/* ================= VIEW: RESET PASSWORD ================= */}
            {view === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-3.5 text-left">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Set new password
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Enter the 6-digit code sent to <strong className="text-cyan-400">{forgotEmail}</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    6-DIGIT RECOVERY CODE
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetForm.resetCode}
                    onChange={(e) => setResetForm({ ...resetForm, resetCode: e.target.value.replace(/\D/g, '') })}
                    placeholder="123456"
                    required
                    className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-center tracking-[0.3em] font-mono font-bold text-lg rounded-xl py-2.5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showResetPassword ? "text" : "password"}
                      value={resetForm.newPassword}
                      onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                      placeholder="At least 8 characters"
                      required
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-16 py-2.5 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400 hover:text-white cursor-pointer select-none"
                    >
                      {showResetPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    CONFIRM NEW PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={resetForm.confirmNewPassword}
                      onChange={(e) => setResetForm({ ...resetForm, confirmNewPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      required
                      className="w-full bg-[#060c18] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] hover:from-[#38bdf8] hover:to-[#2563eb] text-slate-950 hover:text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-mono"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign in</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
