import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  Maximize2, 
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  PiggyBank, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { api } from '../../services/api';
import MarkdownRenderer from '../MarkdownRenderer';
import { useFinny } from './FinnyController';

export default function FinnyChat({ isOpen, onClose, onNavigate }) {
  const { mood, setFinnyState, speak } = useFinny();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey! 😊 How can I help you today? Ask me about your finances, or we can just chat!",
      proof: "Finny AI Companion"
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState(() => `conv_${Date.now()}`);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const quickPrompts = [
    { label: "Analyze my spending", icon: PieChart, prompt: "Can you analyze my recent spending and breakdown by category?" },
    { label: "How much can I save?", icon: PiggyBank, prompt: "Based on my income and expenses, how much can I realistically save this month?" },
    { label: "Where am I overspending?", icon: AlertTriangle, prompt: "Where am I overspending or close to exceeding my category budgets?" },
    { label: "Give me a financial tip", icon: Lightbulb, prompt: "Give me a high-impact, actionable financial tip for optimizing my daily cash flow." }
  ];

  const handleSend = async (textToSend = null) => {
    const cleanText = (textToSend || input).trim();
    if (!cleanText || isStreaming) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: cleanText
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setFinnyState('thinking', "Hmm... Let me think about that!");

    const assistantMsgId = `ast_${Date.now()}`;
    let accumulatedText = "";
    let finalProof = null;

    setMessages(prev => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        proof: null
      }
    ]);

    try {
      await api.streamFinnyChat({
        conversationId,
        message: cleanText,
        onChunk: (chunk, meta) => {
          setFinnyState('talking');
          const token = typeof chunk === 'string' ? chunk : (chunk?.token || '');
          if (token) {
            accumulatedText += token;
            setMessages(prev => prev.map(m => 
              m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
            ));
          }
          if (meta?.proof || chunk?.proof) {
            finalProof = meta?.proof || chunk?.proof;
          }
        },
        onDone: (data) => {
          setIsStreaming(false);
          setFinnyState('happy', "There you go! Let me know if you need anything else! ✨", 6000);
          if (data && data.proof) {
            finalProof = data.proof;
          }
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: accumulatedText, proof: finalProof } : m
          ));
        },
        onError: (err) => {
          setIsStreaming(false);
          setFinnyState('concerned', "I ran into a temporary error while processing that.", 6000);
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { 
              ...m, 
              content: accumulatedText || "I'm having trouble connecting right now. Please verify your connection or retry in a moment." 
            } : m
          ));
        }
      });
    } catch (err) {
      setIsStreaming(false);
      setFinnyState('concerned', "Something went wrong. Let's try again in a second.", 6000);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared! How can I help you next? 🐻✨"
      }
    ]);
    setConversationId(`conv_${Date.now()}`);
    setFinnyState('happy', "Fresh chat started!", 4000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed bottom-24 right-4 sm:right-8 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[640px] flex flex-col bg-[#070f22]/98 backdrop-blur-2xl border border-purple-500/35 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(168,85,247,0.25)] overflow-hidden font-sans hud-corner"
      >
        {/* Top Gradient Glow Accent */}
        <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 shadow-[0_0_15px_#c084fc]" />

        {/* Chat Drawer Header */}
        <div className="p-4 bg-[#09152e]/90 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <div className="w-full h-full bg-[#091224] rounded-[14px] flex items-center justify-center font-bold text-white text-base">
                  🐻
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#091224] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm tracking-tight">Finny AI Companion</h3>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  GPT-4o
                </span>
              </div>
              <p className="text-[10px] text-cyan-300 font-mono">
                {isStreaming ? 'Streaming response...' : 'Zero Arithmetic Hallucination'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('assistant');
                }}
                className="p-1.5 rounded-lg hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Maximize to Full-Screen Chat"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 rounded-lg hover:text-purple-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close companion chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans">
          {messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 flex items-center justify-center shrink-0 shadow-xs text-xs">
                  🐻
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-br-xs shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'bg-[#0d1c3a]/90 border border-purple-500/20 text-slate-100 rounded-bl-xs shadow-xs'
              }`}>
                {msg.role === 'assistant' ? (
                  <div>
                    <MarkdownRenderer content={msg.content} />
                    {isStreaming && i === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse align-middle" />
                    )}
                    {msg.proof && (
                      <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{msg.proof}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Action Chips */}
        <div className="px-3.5 py-2 bg-[#060c1d]/90 border-t border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {quickPrompts.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={isStreaming}
                onClick={() => handleSend(qp.prompt)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-purple-950/60 border border-cyan-500/20 hover:border-purple-400/40 text-[11px] font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                <Icon className="w-3 h-3 text-cyan-400" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[#081226] border-t border-purple-500/20 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask Finny anything across coding, math, or money..."
            className="flex-1 bg-[#040814] border border-slate-800 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all font-sans"
          />

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
            title="Send prompt to Finny"
          >
            <Send className="w-4 h-4 fill-slate-950" />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
