import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Volume2, 
  VolumeX, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
  Bot,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import FinnyAvatar from './FinnyAvatar';
import MarkdownRenderer from './MarkdownRenderer';
import { api } from '../services/api';
import { useFinny } from './finny/FinnyController';

// Gentle cute Web Audio sound generator for Finny
const playChirp = (type = 'neutral') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'happy') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.16);
      });
    } else if (type === 'concerned') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(349.23, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(293.66, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    }
  } catch {}
};

export default function FinnyCompanion({ currentUser, refreshKey, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [companionModel, setCompanionModel] = useState('auto');
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('finny_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [finnyState, setFinnyState] = useState('idle');
  const [speechBubble, setSpeechBubble] = useState(null);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const { mood: globalMood, speechText: globalSpeech, isSpeechVisible: globalSpeechVisible } = useFinny();

  // Synchronize with global FinnyController state
  useEffect(() => {
    if (globalMood && globalMood !== 'idle') {
      setFinnyState(globalMood);
    }
  }, [globalMood]);

  useEffect(() => {
    if (globalSpeech) {
      setSpeechBubble(globalSpeech);
      setShowSpeechBubble(globalSpeechVisible);
    }
  }, [globalSpeech, globalSpeechVisible]);

  // Financial Context
  const [finData, setFinData] = useState(null);

  // Active conversation thread in companion
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const speechTimeoutRef = useRef(null);

  const userId = currentUser?.user_id || 'guest';
  const userName = currentUser?.name?.split(' ')[0] || 'Friend';

  // 1. Initialize or Load Active Conversation
  useEffect(() => {
    let isMounted = true;
    const initThread = async () => {
      try {
        const res = await api.getFinnyConversations();
        const rawList = res?.conversations || [];
        const validList = Array.isArray(rawList) ? rawList.filter(c => c && c.conversation_id) : [];

        if (validList.length > 0) {
          const firstId = validList[0].conversation_id;
          if (isMounted) setActiveConvId(firstId);
          try {
            const thread = await api.getFinnyMessages(firstId);
            if (isMounted && thread && Array.isArray(thread.messages) && thread.messages.length > 0) {
              setMessages(thread.messages);
              return;
            }
          } catch (tErr) {
            console.warn('Finny could not fetch initial thread:', tErr);
          }
        } else {
          try {
            const newThread = await api.createFinnyConversation('Finny Companion Chat');
            const convId = newThread?.conversation?.conversation_id || newThread?.conversation_id || `conv_${Date.now()}`;
            if (isMounted) setActiveConvId(convId);
          } catch (cErr) {
            console.warn('Finny could not create initial conversation:', cErr);
            if (isMounted) setActiveConvId(`conv_${Date.now()}`);
          }
        }
      } catch (err) {
        console.warn('Finny initThread error:', err);
      }

      // Default greeting if no messages loaded
      if (isMounted) {
        setMessages([
          {
            message_id: 'default_1',
            role: 'assistant',
            content: `Hey ${userName}! 😊 How's your day going? Want to check your finances or just chat?`,
            proof: 'Finny AI Companion',
            created_at: new Date().toISOString()
          }
        ]);
      }
    };

    initThread();
    return () => { isMounted = false; };
  }, [userId, userName]);

  // Scroll on message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isStreaming]);

  // 2. Fetch real user financial data and calculate Finny's mood & speech bubble
  useEffect(() => {
    const evaluateFinancialMood = async () => {
      try {
        const dashboard = await api.getDashboard();
        setFinData(dashboard);

        const txCount = (dashboard.recent_transactions || []).length;
        const savingsRate = dashboard.savings_rate_pct || 0;
        const budgetUtil = dashboard.budget_utilization_pct || 0;
        const balance = dashboard.current_balance || 0;
        const totalBudget = dashboard.total_budget || 0;
        const daysLeft = dashboard.days_left_in_month || 1;
        const safeDaily = dashboard.safe_daily_allowance || 0;

        let newMood = 'idle';
        let bubbleText = '';
        let soundType = 'neutral';

        if (txCount === 0) {
          newMood = 'idle';
          bubbleText = `Hi ${userName}! Welcome to FinAgent! Let's get started by uploading your bank statement or recording your first expense! ✨`;
        } else if (budgetUtil > 100) {
          newMood = 'concerned';
          soundType = 'concerned';
          bubbleText = `Uh oh ${userName}! We've utilized ${budgetUtil.toFixed(0)}% of our monthly budget. Let's pause non-essential spending for the next ${daysLeft} days! 🛡️`;
        } else if (savingsRate >= 20 && balance > 0) {
          newMood = 'celebrating';
          soundType = 'happy';
          bubbleText = `Woohoo! You have a strong ${savingsRate.toFixed(1)}% savings rate this month! Keep it up, you're crushing it! 🎉`;
        } else if (totalBudget > 0 && budgetUtil <= 80) {
          newMood = 'happy';
          soundType = 'happy';
          bubbleText = `Great discipline! Spending is only ${budgetUtil.toFixed(0)}% of your limit. Safe daily pace: ₹${Number(safeDaily || 0).toLocaleString('en-IN')}/day! 👍`;
        } else {
          newMood = 'idle';
          bubbleText = `Current balance is ₹${Number(balance || 0).toLocaleString('en-IN')}. Need an instant spending analysis? Click me! 🐻`;
        }

        setFinnyState(newMood);
        setSpeechBubble(bubbleText);
        setShowSpeechBubble(true);

        if (!isMuted) {
          playChirp(soundType);
        }

        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = setTimeout(() => {
          setShowSpeechBubble(false);
        }, 9000);

      } catch (err) {
        console.warn('Finny could not fetch live context:', err);
      }
    };

    evaluateFinancialMood();

    return () => {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    };
  }, [refreshKey, userName, isMuted]);

  // Handle Mute Toggle
  const toggleMute = (e) => {
    e.stopPropagation();
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    try {
      localStorage.setItem('finny_muted', String(nextVal));
    } catch {}
  };

  // Clear Chat History
  const clearChat = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Reset Finny conversation history?')) return;
    try {
      const res = await api.createFinnyConversation('New Companion Thread');
      const convId = res?.conversation?.conversation_id || res?.conversation_id || `conv_${Date.now()}`;
      setActiveConvId(convId);
      setMessages([
        {
          message_id: 'fresh_slate',
          role: 'assistant',
          content: `Fresh slate, ${userName}! Ask me anything across coding, math, general topics, or your finances! 🐻`,
          created_at: new Date().toISOString()
        }
      ]);
    } catch {}
  };

  // Send Message via Real-Time Streaming SSE
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isStreaming) return;

    let targetConvId = activeConvId;
    if (!targetConvId) {
      try {
        const cRes = await api.createFinnyConversation('New Chat');
        targetConvId = cRes?.conversation?.conversation_id || cRes?.conversation_id || `conv_${Date.now()}`;
        setActiveConvId(targetConvId);
      } catch {
        targetConvId = `conv_${Date.now()}`;
        setActiveConvId(targetConvId);
      }
    }

    setInputMessage('');
    const userMsg = {
      message_id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      created_at: new Date().toISOString()
    };

    const tempAsstId = `asst_${Date.now() + 1}`;
    const initialAsstMsg = {
      message_id: tempAsstId,
      role: 'assistant',
      content: '',
      proof: null,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg, initialAsstMsg]);
    setIsStreaming(true);
    setFinnyState('thinking');

    let accumulatedText = '';
    let proofText = null;

    try {
      await api.streamFinnyChat({
        conversationId: targetConvId,
        message: query,
        agentModel: companionModel,
        onChunk: (token, meta) => {
          accumulatedText += token;
          if (meta?.proof) proofText = meta.proof;
          setFinnyState('talking');

          setMessages(prev => prev.map(m => {
            if (m.message_id === tempAsstId) {
              return { ...m, content: accumulatedText, proof: proofText || m.proof };
            }
            return m;
          }));
        },
        onDone: (meta) => {
          setIsStreaming(false);
          setFinnyState('idle');
          if (meta?.proof) {
            setFinnyState('celebrating');
            setTimeout(() => setFinnyState('idle'), 3000);
          }
          if (!isMuted) playChirp('happy');
        },
        onError: (err) => {
          setIsStreaming(false);
          setFinnyState('concerned');
          setMessages(prev => prev.map(m => {
            if (m.message_id === tempAsstId) {
              return { ...m, content: accumulatedText || `⚠️ ${err.message || 'Error communicating with assistant.'}` };
            }
            return m;
          }));
        }
      });
    } catch (err) {
      setIsStreaming(false);
      setFinnyState('concerned');
    }
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    { label: '📊 Analyze my spending', query: 'Can you analyze my monthly spending breakdown and trends?' },
    { label: '💰 How much can I save?', query: 'How much can I realistically save by the end of this month?' },
    { label: '⚡ Python useDebounce', query: 'Show me an optimal React useDebounce hook with TypeScript' },
    { label: '💡 Give me a financial tip', query: 'Give me a personalized financial recommendation based on my actual cashflow.' }
  ];

  return (
    <div className="print:hidden">
      {/* ================= 1. FLOATING FINNY MASCOT & SPEECH BUBBLE ================= */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none">
        
        {/* Context-Aware Speech Bubble Popup (Desktop only - prevents mobile content overlap) */}
        {showSpeechBubble && speechBubble && !isOpen && (
          <div 
            className="hidden sm:block mb-3 max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-[#091325]/95 border border-purple-500/40 text-slate-100 text-xs shadow-[0_10px_35px_rgba(168,85,247,0.3)] backdrop-blur-xl pointer-events-auto relative animate-fadeIn transition-all"
            onMouseEnter={() => {
              if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-bold text-purple-300 font-mono text-[11px] flex items-center gap-1">
                <span>🐻</span> Finny says:
              </span>
              <button
                onClick={() => setShowSpeechBubble(false)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                title="Dismiss tip"
                aria-label="Dismiss tip"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-200 leading-relaxed font-sans">
              {speechBubble}
            </p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-[#091325] border-r border-b border-purple-500/40 transform rotate-45"></div>
          </div>
        )}

        {/* Floating Mascot Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              setIsOpen(prev => !prev);
              setShowSpeechBubble(false);
              if (!isOpen && !isMuted) playChirp('happy');
            }}
            className="group relative cursor-pointer outline-none focus:scale-105 active:scale-95 transition-transform min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Chat with Finny"
          >
            {/* Ambient Halo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/40 via-cyan-500/30 to-blue-500/40 blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Mascot Base Button */}
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-[#1a1233] to-[#090d18] border-2 border-purple-400/50 shadow-[0_0_25px_rgba(192,132,252,0.4)] flex items-center justify-center overflow-visible hover:border-cyan-400 transition-colors">
              <FinnyAvatar 
                state={isOpen ? (isStreaming ? 'talking' : 'idle') : finnyState} 
                size="md" 
                className="w-12 h-12 sm:w-16 sm:h-16" 
              />
              <span className="absolute bottom-1 right-1 w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-emerald-400 border-2 border-[#090d18] shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            </div>

            {!isOpen && (
              <span className="hidden sm:inline-block absolute -top-7 right-0 px-2 py-0.5 rounded-md bg-purple-950/90 text-[10px] font-mono text-purple-200 border border-purple-500/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                Ask Finny 🐻✨
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= 2. INTERACTIVE CHAT DRAWER / WINDOW ================= */}
      {isOpen && (
        <div 
          className={`fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 bg-[#091325]/95 backdrop-blur-2xl border-t sm:border border-purple-500/30 rounded-t-3xl sm:rounded-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.8)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300 font-sans ${
            isMinimized 
              ? 'h-16 w-full sm:w-80' 
              : 'w-full sm:w-[440px] h-[85dvh] sm:h-[600px] max-h-[88dvh] sm:max-h-[85vh]'
          }`}
        >
          {/* Top Bar Header */}
          <div className="p-4 bg-gradient-to-r from-[#170e30] via-[#0d162f] to-[#081226] border-b border-purple-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(192,132,252,0.3)]">
                <FinnyAvatar state={isStreaming ? 'talking' : finnyState} size="sm" className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-white text-sm">Finny</h3>
                </div>
                <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Companion
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              {/* Maximize to full screen ChatGPT Assistant page */}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('assistant');
                  }}
                  className="p-1.5 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Open Full-Screen ChatGPT View"
                >
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                </button>
              )}

              <button
                onClick={toggleMute}
                className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                onClick={clearChat}
                className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(prev => !prev)}
                className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Frontier Multi-Agent Selector Strip */}
              <div className="px-3 py-1.5 bg-[#050b16] border-b border-purple-500/15 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
                <span className="text-slate-400 shrink-0 flex items-center gap-1">
                  <Bot className="w-3 h-3 text-cyan-400" />
                  Model:
                </span>
                {[
                  { id: 'auto', label: '⚡ Auto', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/50' },
                  { id: 'o3mini', label: '🧠 o3-mini', color: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/50' },
                  { id: 'gpt4', label: '🟢 GPT-4o', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/50' },
                  { id: 'claude37', label: '🟣 Claude 3.7', color: 'text-purple-300 border-purple-500/40 bg-purple-950/50' },
                  { id: 'claude', label: '🟠 Claude 3.5', color: 'text-amber-300 border-amber-500/40 bg-amber-950/50' },
                  { id: 'gemini25', label: '🔵 Gemini 2.5', color: 'text-blue-300 border-blue-500/40 bg-blue-950/50' },
                  { id: 'gemini', label: '⚡ Gemini 2.0', color: 'text-sky-300 border-sky-500/40 bg-sky-950/50' },
                  { id: 'deepseek', label: '🌌 DeepSeek-R1', color: 'text-violet-300 border-violet-500/40 bg-violet-950/50' }
                ].map(m => {
                  const active = companionModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCompanionModel(m.id)}
                      className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                        active 
                          ? `${m.color} font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]` 
                          : 'border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Financial Quick Status Strip */}
              {finData && (
                <div className="px-4 py-2 bg-[#050b16] border-b border-purple-500/15 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Balance:</span>
                    <strong className="text-emerald-400 font-bold">
                      ₹{(finData.current_balance || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Savings Rate:</span>
                    <strong className="text-cyan-400 font-bold">
                      {(finData.savings_rate_pct || 0).toFixed(0)}%
                    </strong>
                  </div>
                </div>
              )}

              {/* Message Feed with MarkdownRenderer */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-[#091325]/70 to-[#050a14]">
                {messages.map((msg, idx) => {
                  const isFinny = msg.role === 'assistant';
                  return (
                    <div 
                      key={msg.message_id || idx}
                      className={`flex gap-2.5 ${isFinny ? 'items-start' : 'items-end justify-end'}`}
                    >
                      {isFinny && (
                        <div className="w-7 h-7 rounded-lg bg-purple-900/60 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs">🐻</span>
                        </div>
                      )}

                      <div className={`max-w-[85%] space-y-1 ${isFinny ? 'text-left' : 'text-right'}`}>
                        <div 
                          className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isFinny 
                              ? 'bg-[#0f1d38] border border-purple-500/25 text-slate-100 rounded-tl-xs' 
                              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-xs shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          }`}
                        >
                          {isFinny ? (
                            <MarkdownRenderer content={msg.content} />
                          ) : (
                            <p className="whitespace-pre-line">{msg.content}</p>
                          )}

                          {isStreaming && idx === messages.length - 1 && isFinny && (
                            <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse"></span>
                          )}
                        </div>

                        {/* Verified Math Proof Badge */}
                        {isFinny && msg.proof && (
                          <div className="flex items-center justify-between text-[10px] text-cyan-400/80 font-mono px-1">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              {msg.proof}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyText(msg.content, msg.message_id || idx)}
                              className="text-slate-400 hover:text-white"
                            >
                              {copiedId === (msg.message_id || idx) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="p-2.5 bg-[#050b16] border-t border-purple-500/15 overflow-x-auto flex items-center gap-1.5">
                {quickActions.map((act, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(act.query)}
                    disabled={isStreaming}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900/80 hover:bg-purple-950/70 border border-slate-700/60 hover:border-purple-400/50 text-slate-300 hover:text-purple-200 whitespace-nowrap transition-all font-mono cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {act.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[#081224] border-t border-purple-500/20 flex items-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask Finny coding, math, science, or your money...`}
                  disabled={isStreaming}
                  className="flex-1 bg-[#040814] border border-slate-800 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all font-sans min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isStreaming}
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 fill-slate-950" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
