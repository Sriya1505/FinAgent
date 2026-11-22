import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialView = 'login' }) {
  const [view, setView] = useState(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const rememberedEmail = typeof window !== 'undefined' ? (localStorage.getItem('finagent_remembered_email') || '') : '';
  const rememberedPref = typeof window !== 'undefined' ? (localStorage.getItem('finagent_remember_me') !== 'false') : true;

  const [loginForm, setLoginForm] = useState({ 
    email: rememberedEmail, 
    password: '',
    rememberMe: rememberedPref
  });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ resetCode: '', newPassword: '', confirmNewPassword: '' });
  const [demoCodeHint, setDemoCodeHint] = useState(null);

  if (!isOpen) return null;

  const resetAll = () => {
    setError(null);
    setSuccessMsg(null);
    setDemoCodeHint(null);
  };

  const switchView = (newView) => {
    resetAll();
    setView(newView);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetAll();
    if (!loginForm.email || !loginForm.password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.login({ 
        email: loginForm.email, 
        password: loginForm.password,
        rememberMe: loginForm.rememberMe 
      });
      try {
        if (loginForm.rememberMe) {
          localStorage.setItem('finagent_remembered_email', loginForm.email.trim());
          localStorage.setItem('finagent_remember_me', 'true');
        } else {
          localStorage.removeItem('finagent_remembered_email');
          localStorage.setItem('finagent_remember_me', 'false');
        }
      } catch (e) {
        console.warn('Could not persist remembered email:', e);
      }
      setSuccessMsg(res.message || 'Authenticated successfully!');
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };


  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    resetAll();
    if (!signupForm.name.trim() || !signupForm.email.trim() || !signupForm.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password
      });
      setSuccessMsg('Account created successfully! Welcome to FinAgent.');
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    resetAll();
    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotPassword({ email: forgotEmail.trim() });
      setSuccessMsg('Verification recovery code generated!');
      setDemoCodeHint(res.reset_code);
      setView('reset');
    } catch (err) {
      setError(err.message || 'Failed to request reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    resetAll();
    if (!resetForm.resetCode || !resetForm.newPassword) {
      setError('Please enter both the recovery code and your new password.');
      return;
    }
    if (resetForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
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
      setSuccessMsg(res.message || 'Password reset successfully!');
      setTimeout(() => {
        setView('login');
        setLoginForm({ email: forgotEmail.trim(), password: '' });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02050e]/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* Modal Container with Cyber Bounding & Glow */}
      <div className="bg-[#091326]/95 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.25)] border border-cyan-500/35 overflow-hidden relative hud-corner animate-in fade-in zoom-in-95 duration-200">
        {/* Top Glow Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_15px_#38bdf8]"></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-cyan-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#38bdf8] via-[#0284c7] to-[#2563eb] flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.35)] shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4h14a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2v2.8h7.6a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2V20H5V4z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg tracking-tight flex items-center gap-2">
                FinAgent
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </h3>
              <p className="text-[11px] text-cyan-400/70 font-medium">
                {view === 'login' && 'Sign in to access your personal finance dashboard'}
                {view === 'signup' && 'Create your new FinAgent account'}
                {view === 'forgot' && 'Receive a secure 6-digit recovery code'}
                {view === 'reset' && 'Establish a new verified account password'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Notifications */}
        <div className="px-6 pt-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 mb-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2.5 mb-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 pt-2">
          {/* ================= VIEW: LOGIN ================= */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder:text-slate-600 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView('forgot')}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder:text-slate-600 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl font-extrabold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Sign In</span>
              </button>

              {/* Switch to Signup */}
              <div className="pt-3 text-center border-t border-cyan-500/15">
                <p className="text-xs text-slate-400">
                  New to FinAgent?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('signup')}
                    className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline ml-1"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ================= VIEW: SIGNUP ================= */}
          {view === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sriya G."
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-white placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="gs.sriya15@gmail.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-white placeholder:text-slate-600 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-white placeholder:text-slate-600 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-white placeholder:text-slate-600 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl font-extrabold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Create Account</span>
              </button>

              <div className="pt-2 text-center border-t border-cyan-500/15">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline ml-1"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ================= VIEW: FORGOT PASSWORD ================= */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="gs.sriya15@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-white placeholder:text-slate-600 transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We will generate a 6-digit verification code valid for 15 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-extrabold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Generate Recovery Code</span>
              </button>

              <div className="pt-3 text-center border-t border-cyan-500/15">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ================= VIEW: RESET PASSWORD ================= */}
          {view === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              {demoCodeHint && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-400/40 text-cyan-200 text-xs">
                  <span className="font-bold block text-cyan-300">Generated Recovery Code:</span>
                  <span className="font-mono text-lg font-black text-white tracking-widest block">{demoCodeHint}</span>
                  <span className="text-[10px] text-cyan-400/70 block mt-0.5">(Pre-filled for your testing convenience)</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  6-Digit Recovery Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={resetForm.resetCode || demoCodeHint || ''}
                    onChange={(e) => setResetForm({ ...resetForm, resetCode: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm font-mono tracking-widest text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={resetForm.confirmNewPassword}
                    onChange={(e) => setResetForm({ ...resetForm, confirmNewPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-cyan-500/25 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-xl font-extrabold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Set New Password</span>
              </button>

              <div className="pt-2 text-center border-t border-cyan-500/15">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  ← Cancel and Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
