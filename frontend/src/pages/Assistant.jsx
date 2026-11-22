import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Edit3, 
  Square, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronRight, 
  Terminal, 
  Code, 
  TrendingUp, 
  Lightbulb, 
  Briefcase,
  HelpCircle,
  Zap,
  Layers,
  ArrowRight,
  Search,
  MoreVertical,
  Pin,
  Archive,
  ArchiveRestore,
  Clock,
  AlertTriangle,
  ChevronDown,
  Bot,
  Cpu,
  Brain,
  Compass,
  Code2
} from 'lucide-react';
import FinnyAvatar from '../components/FinnyAvatar';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { api } from '../services/api';

export const FINNY_MODELS = [
  {
    id: 'auto',
    name: 'Auto-Router',
    fullName: 'Finny Auto-Router (Ensemble)',
    provider: 'Multi-Agent Consensus',
    badge: 'Smart Routing',
    icon: Zap,
    color: 'from-cyan-400 to-purple-500',
    dotColor: 'bg-cyan-400',
    tagColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
    description: 'Intelligently routes between o3-mini, GPT-4o, Claude 3.7, Gemini 2.5, and DeepSeek-R1 based on prompt intent.'
  },
  {
    id: 'o3mini',
    name: 'o3-mini',
    fullName: 'Finny o3-mini (OpenAI)',
    provider: 'OpenAI',
    badge: 'Deep Reasoning',
    icon: Brain,
    color: 'from-indigo-400 to-cyan-500',
    dotColor: 'bg-indigo-400',
    tagColor: 'text-indigo-300 bg-indigo-950/60 border-indigo-500/30',
    description: 'Complex multi-step financial derivations, tax calculations, compound interest calculus, and ledger anomaly deduction.'
  },
  {
    id: 'gpt4',
    name: 'Finny GPT-4o',
    fullName: 'Finny GPT-4o (OpenAI)',
    provider: 'OpenAI',
    badge: 'Precision & Math',
    icon: Terminal,
    color: 'from-emerald-400 to-teal-500',
    dotColor: 'bg-emerald-400',
    tagColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30',
    description: 'Precision deterministic ledger calculations, Python code proofs, and strict mathematical balance formulas.'
  },
  {
    id: 'claude37',
    name: 'Claude 3.7 Sonnet',
    fullName: 'Finny Claude 3.7 Sonnet (Anthropic)',
    provider: 'Anthropic',
    badge: 'Hybrid Reasoning',
    icon: Sparkles,
    color: 'from-purple-400 to-pink-500',
    dotColor: 'bg-purple-400',
    tagColor: 'text-purple-300 bg-purple-950/60 border-purple-500/30',
    description: 'Anthropic flagship hybrid reasoning model. Combines deep behavioral finance coaching with strategic wealth architecture.'
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    fullName: 'Finny Claude 3.5 Sonnet (Anthropic)',
    provider: 'Anthropic',
    badge: 'Strategic Advisory',
    icon: Compass,
    color: 'from-amber-400 to-orange-500',
    dotColor: 'bg-amber-400',
    tagColor: 'text-amber-300 bg-amber-950/60 border-amber-500/30',
    description: 'In-depth financial advisory, empathetic habit coaching, and holistic 50/30/20 lifestyle budgeting.'
  },
  {
    id: 'gemini25',
    name: 'Gemini 2.5 Pro',
    fullName: 'Finny Gemini 2.5 Pro (Google)',
    provider: 'Google DeepMind',
    badge: 'Deep Multimodal',
    icon: Layers,
    color: 'from-blue-400 to-indigo-500',
    dotColor: 'bg-blue-400',
    tagColor: 'text-blue-300 bg-blue-950/60 border-blue-500/30',
    description: 'Google premier frontier model for multi-horizon cashflow modeling, bank document synthesis, and macro forecasting.'
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0 Flash',
    fullName: 'Finny Gemini 2.0 Flash (Google)',
    provider: 'Google DeepMind',
    badge: 'Ultra-Fast (0.05s)',
    icon: Zap,
    color: 'from-sky-400 to-cyan-400',
    dotColor: 'bg-sky-400',
    tagColor: 'text-sky-300 bg-sky-950/60 border-sky-500/30',
    description: 'Sub-100ms real-time financial stream, instant transaction categorization, and rapid spending velocity updates.'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek-R1',
    fullName: 'Finny DeepSeek-R1 (DeepSeek)',
    provider: 'DeepSeek',
    badge: 'Open Reasoning',
    icon: Code2,
    color: 'from-blue-500 to-violet-600',
    dotColor: 'bg-blue-500',
    tagColor: 'text-violet-300 bg-violet-950/60 border-violet-500/30',
    description: 'Transparent chain-of-thought mathematical reasoning, eliminating financial leakage, and rigorous budget bounds.'
  }
];

const STARTER_PROMPTS = [
  {
    icon: TrendingUp,
    domain: 'Saving Money',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    prompt: 'Help me save money from my monthly salary'
  },
  {
    icon: Lightbulb,
    domain: 'Expense Review',
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
    prompt: 'How much did I spend this month and what is my biggest category?'
  },
  {
    icon: Briefcase,
    domain: 'Remaining Funds',
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30',
    prompt: 'How much money do I have left across my balance and budgets?'
  },
  {
    icon: MessageSquare,
    domain: 'Friendly Chat',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
    prompt: 'Hi Finny! How is your day going?'
  }
];

function formatConvTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  
  if (d >= startOfToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (d >= startOfYesterday) {
    return 'Yesterday';
  } else {
    const diffDays = Math.floor((startOfToday - d) / (24 * 60 * 60 * 1000));
    if (diffDays <= 7) return `${diffDays}d ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function groupConversations(list, showArchived) {
  const safeList = (list || []).filter(c => c && c.conversation_id);
  if (showArchived) {
    return [
      { key: 'archived', label: 'Archived Conversations', items: safeList }
    ];
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOf7Days = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOf30Days = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

  const pinned = [];
  const today = [];
  const yesterday = [];
  const prev7 = [];
  const prev30 = [];
  const older = [];

  safeList.forEach(c => {
    if (c.is_pinned === 1) {
      pinned.push(c);
      return;
    }
    const d = new Date(c.updated_at || c.created_at || Date.now());
    if (d >= startOfToday) {
      today.push(c);
    } else if (d >= startOfYesterday) {
      yesterday.push(c);
    } else if (d >= startOf7Days) {
      prev7.push(c);
    } else if (d >= startOf30Days) {
      prev30.push(c);
    } else {
      older.push(c);
    }
  });

  const sections = [];
  if (pinned.length > 0) sections.push({ key: 'pinned', label: 'Pinned', items: pinned });
  if (today.length > 0) sections.push({ key: 'today', label: 'Today', items: today });
  if (yesterday.length > 0) sections.push({ key: 'yesterday', label: 'Yesterday', items: yesterday });
  if (prev7.length > 0) sections.push({ key: 'prev7', label: 'Previous 7 Days', items: prev7 });
  if (prev30.length > 0) sections.push({ key: 'prev30', label: 'Previous 30 Days', items: prev30 });
  if (older.length > 0) sections.push({ key: 'older', label: 'Older Conversations', items: older });

  return sections;
}

export default function Assistant() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [openMenuConvId, setOpenMenuConvId] = useState(null);

  // Modals State
  const [renameModalConv, setRenameModalConv] = useState(null);
  const [renameInput, setRenameInput] = useState('');
  const [deleteModalConv, setDeleteModalConv] = useState(null);

  // Multi-Agent Frontier Models (Auto-Router, GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)
  const [selectedModel, setSelectedModel] = useState('auto');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // Streaming & Loading States
  const [isLoadingConvs, setIsLoadingConvs] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [finnyMood, setFinnyMood] = useState('idle'); // 'idle' | 'thinking' | 'talking' | 'celebrating' | 'concerned'
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Edit message state
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editInput, setEditInput] = useState('');

  // Sidebar visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const renameInputRef = useRef(null);

  const currentUser = api.getCurrentUser();
  const userName = currentUser?.name?.split(' ')[0] || 'Friend';

  // 1. Fetch Conversations on Mount & on Search / Filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadConversations(searchQuery, showArchived);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, showArchived]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuConvId(null);
      setModelDropdownOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-focus rename input when modal opens
  useEffect(() => {
    if (renameModalConv && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renameModalConv]);

  const loadConversations = async (search = '', archived = false) => {
    setIsLoadingConvs(true);
    try {
      const res = await api.getFinnyConversations(search, archived);
      const list = (res?.conversations || []).filter(c => c && c.conversation_id);
      setConversations(list);

      if (list.length > 0 && !activeConvId) {
        selectConversation(list[0]?.conversation_id);
      } else if (list.length === 0 && !search && !archived) {
        handleNewChat();
      }
    } catch (err) {
      console.warn('Could not load conversations:', err);
      setConversations([]);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  // 2. Select a Conversation
  const selectConversation = async (convId) => {
    if (!convId) return;
    setActiveConvId(convId);
    setEditingMsgId(null);
    setOpenMenuConvId(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
    setIsLoadingMessages(true);
    try {
      const res = await api.getFinnyMessages(convId);
      setMessages(res?.messages || []);
      setFinnyMood('idle');
    } catch (err) {
      console.error('Failed to load thread messages:', err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 3. Create a New Conversation
  const handleNewChat = async () => {
    if (isStreaming) return;
    try {
      const res = await api.createFinnyConversation('New Chat');
      const newConv = res?.conversation || res?.data?.conversation || {
        conversation_id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: 'New Chat',
        created_at: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...(prev || []).filter(c => c && c.conversation_id)]);
      setActiveConvId(newConv.conversation_id);
      setMessages([]);
      setFinnyMood('happy');
      setTimeout(() => setFinnyMood('idle'), 2500);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
      const fallbackConv = {
        conversation_id: `conv_${Date.now()}`,
        title: 'New Chat',
        created_at: new Date().toISOString()
      };
      setConversations(prev => [fallbackConv, ...(prev || []).filter(c => c && c.conversation_id)]);
      setActiveConvId(fallbackConv.conversation_id);
      setMessages([]);
    }
  };

  // 4. Pin / Unpin Conversation
  const handleTogglePin = async (e, conv) => {
    e.stopPropagation();
    setOpenMenuConvId(null);
    const newPinned = conv.is_pinned === 1 ? 0 : 1;
    try {
      await api.updateFinnyConversation(conv.conversation_id, { is_pinned: newPinned });
      setConversations(prev => prev.map(c => 
        c.conversation_id === conv.conversation_id ? { ...c, is_pinned: newPinned } : c
      ));
    } catch (err) {
      console.error('Failed to pin/unpin conversation:', err);
    }
  };

  // 5. Archive / Restore Conversation
  const handleToggleArchive = async (e, conv) => {
    e.stopPropagation();
    setOpenMenuConvId(null);
    const newArchived = conv.is_archived === 1 ? 0 : 1;
    try {
      await api.updateFinnyConversation(conv.conversation_id, { is_archived: newArchived });
      // Remove from current view list
      const remaining = conversations.filter(c => c.conversation_id !== conv.conversation_id);
      setConversations(remaining);

      if (activeConvId === conv.conversation_id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0]?.conversation_id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to archive/restore conversation:', err);
    }
  };

  // 6. Open Rename Modal
  const handleOpenRename = (e, conv) => {
    e.stopPropagation();
    setOpenMenuConvId(null);
    setRenameModalConv(conv);
    setRenameInput(conv?.title || 'New Chat');
  };

  // Save Rename
  const handleSaveRename = async (e) => {
    e?.preventDefault();
    if (!renameModalConv || !renameInput.trim() || !renameModalConv.conversation_id) return;
    const newTitle = renameInput.trim();
    try {
      await api.updateFinnyConversation(renameModalConv.conversation_id, { title: newTitle });
      setConversations(prev => prev.map(c => 
        c?.conversation_id === renameModalConv.conversation_id ? { ...c, title: newTitle } : c
      ));
      setRenameModalConv(null);
    } catch (err) {
      alert(err.message || 'Failed to rename conversation');
    }
  };

  // 7. Open Delete Modal
  const handleOpenDelete = (e, conv) => {
    e.stopPropagation();
    setOpenMenuConvId(null);
    setDeleteModalConv(conv);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteModalConv || !deleteModalConv.conversation_id) return;
    const convId = deleteModalConv.conversation_id;
    try {
      await api.deleteFinnyConversation(convId);
      const remaining = conversations.filter(c => c?.conversation_id !== convId);
      setConversations(remaining);
      setDeleteModalConv(null);

      if (activeConvId === convId) {
        if (remaining.length > 0) {
          selectConversation(remaining[0]?.conversation_id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete conversation');
    }
  };

  // Auto-scroll on new message or stream chunk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Adjust textarea height dynamically
  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Send message or prompt trigger
  const handleSend = async (overridePrompt) => {
    const textToSend = (overridePrompt || inputMessage).trim();
    if (!textToSend || isStreaming) return;

    let targetConvId = activeConvId;
    if (!targetConvId) {
      try {
        const res = await api.createFinnyConversation('New Chat');
        const newConv = res?.conversation || res?.data?.conversation || {
          conversation_id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: 'New Chat',
          created_at: new Date().toISOString()
        };
        targetConvId = newConv.conversation_id;
        setActiveConvId(targetConvId);
        setConversations(prev => [newConv, ...(prev || []).filter(c => c && c.conversation_id)]);
      } catch (err) {
        targetConvId = `conv_${Date.now()}`;
        setActiveConvId(targetConvId);
      }
    }

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Append user message immediately
    const userMsg = {
      message_id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };

    // Temporary placeholder for assistant streaming message
    const tempAssistantId = `asst_${Date.now() + 1}`;
    const initialAssistantMsg = {
      message_id: tempAssistantId,
      role: 'assistant',
      content: '',
      proof: null,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg, initialAssistantMsg]);
    setIsStreaming(true);
    setFinnyMood('thinking');

    let accumulatedText = '';
    let proofData = null;
    let activeAgent = selectedModel;

    try {
      await api.streamFinnyChat({
        conversationId: targetConvId,
        message: textToSend,
        agentModel: selectedModel,
        onChunk: (token, meta) => {
          accumulatedText += token;
          if (meta?.proof) proofData = meta.proof;
          if (meta?.agent_model) activeAgent = meta.agent_model;
          setFinnyMood('talking');

          setMessages(prev => prev.map(msg => {
            if (msg.message_id === tempAssistantId) {
              return { 
                ...msg, 
                content: accumulatedText, 
                proof: proofData || msg.proof,
                agent_model: activeAgent
              };
            }
            return msg;
          }));
        },
        onDone: (meta) => {
          setIsStreaming(false);
          setFinnyMood('idle');
          if (meta?.message_id) {
            setMessages(prev => prev.map(msg => {
              if (msg.message_id === tempAssistantId) {
                return { 
                  ...msg, 
                  message_id: meta.message_id, 
                  proof: meta.proof || proofData,
                  agent_model: meta.agent_model || activeAgent
                };
              }
              return msg;
            }));
          }
          // Refresh conversation list to capture auto-generated titles
          api.getFinnyConversations(searchQuery, showArchived).then(r => setConversations(r.conversations || []));
        },
        onError: (err) => {
          setIsStreaming(false);
          setFinnyMood('concerned');
          setMessages(prev => prev.map(msg => {
            if (msg.message_id === tempAssistantId) {
              return { 
                ...msg, 
                content: accumulatedText || `⚠️ Error generating response: ${err.message || 'Please check your connection and retry.'}` 
              };
            }
            return msg;
          }));
        }
      });
    } catch (err) {
      setIsStreaming(false);
      setFinnyMood('concerned');
      console.error('Stream failure:', err);
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (isStreaming || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setMessages(prev => prev.slice(0, -1));
      handleSend(lastUserMsg.content);
    }
  };

  // Edit and Resend User Message
  const handleSaveEditAndResend = (msgIndex) => {
    if (!editInput.trim() || isStreaming) return;
    const newText = editInput.trim();
    setEditingMsgId(null);
    setEditInput('');

    setMessages(prev => prev.slice(0, msgIndex));
    handleSend(newText);
  };

  // Copy message text
  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Keyboard Enter to send (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConv = (conversations || []).find(c => c && c.conversation_id === activeConvId);
  const groupedSections = groupConversations(conversations, showArchived);
  const currentModelMeta = FINNY_MODELS.find(m => m.id === selectedModel) || FINNY_MODELS[0];

  return (
    <div className="flex h-[calc(100dvh-75px)] sm:h-[calc(100vh-80px)] overflow-hidden bg-[#040814] text-slate-100 font-sans relative">
      
      {/* ================= 1. LEFT COLLAPSIBLE SIDEBAR ================= */}
      <aside 
        className={`${
          sidebarOpen ? 'w-72 sm:w-80 fixed inset-y-0 left-0 z-30 sm:relative sm:z-20' : 'w-0'
        } transition-all duration-300 bg-[#060c18] border-r border-cyan-500/20 flex flex-col shrink-0 overflow-hidden relative`}
      >
        {/* Sidebar Header: New Chat & View Toggle */}
        <div className="p-3.5 border-b border-cyan-500/15 space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              disabled={isStreaming}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                showArchived 
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
                  : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              title={showArchived ? 'View Active Chats' : 'View Archived Chats'}
            >
              {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, amounts..."
              className="w-full bg-[#030712] border border-cyan-500/25 focus:border-cyan-400 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Tab Filter Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono px-1">
            <span className="text-slate-400">
              {showArchived ? '📁 Archived Threads' : '💬 Active Threads'}
            </span>
            <span className="text-cyan-400 font-bold">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Conversation List Organized by Time Buckets */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {isLoadingConvs && conversations.length === 0 ? (
            <div className="space-y-2.5 p-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 animate-pulse space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 bg-slate-800 rounded w-2/3"></div>
                    <div className="h-2.5 bg-slate-800/60 rounded w-10"></div>
                  </div>
                  <div className="h-2.5 bg-slate-800/40 rounded w-4/5"></div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center px-4 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto opacity-40" />
              <p className="text-xs text-slate-400 font-medium">
                {searchQuery 
                  ? `No conversations match "${searchQuery}"`
                  : showArchived 
                    ? 'No archived conversations.' 
                    : 'No previous conversations yet.'}
              </p>
              {!searchQuery && !showArchived && (
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="inline-block mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                >
                  Start a new conversation
                </button>
              )}
            </div>
          ) : (
            groupedSections.map(section => (
              <div key={section.key} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{section.label}</span>
                  <span className="text-slate-600 text-[9px]">{section.items.length}</span>
                </div>

                {(section.items || []).filter(c => c && c.conversation_id).map(conv => {
                  const isActive = conv.conversation_id === activeConvId;
                  const isMenuOpen = openMenuConvId === conv.conversation_id;
                  const timeFormatted = formatConvTime(conv.last_message_at || conv.updated_at || conv.created_at);

                  return (
                    <div
                      key={conv.conversation_id}
                      onClick={() => selectConversation(conv.conversation_id)}
                      className={`group relative flex flex-col gap-1 p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/15 via-blue-600/20 to-purple-500/10 text-cyan-200 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-[#050b16]/70 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Pin Icon, Title, Timestamp, Menu Button */}
                      <div className="flex items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {conv.is_pinned === 1 && (
                            <Pin className="w-3 h-3 text-cyan-400 rotate-45 shrink-0" title="Pinned" />
                          )}
                          <span className={`font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                            {conv.title || 'New Chat'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {timeFormatted && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {timeFormatted}
                            </span>
                          )}

                          {/* Three-Dot Menu Trigger */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuConvId(isMenuOpen ? null : conv.conversation_id);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Conversation actions"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-6 w-36 py-1 bg-[#09152b] border border-cyan-500/30 rounded-xl shadow-2xl z-30 font-sans text-xs animate-fadeIn"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenRename(e, conv)}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-slate-300 hover:text-white hover:bg-cyan-500/10 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Rename</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={(e) => handleTogglePin(e, conv)}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-slate-300 hover:text-white hover:bg-cyan-500/10 cursor-pointer"
                                >
                                  <Pin className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{conv.is_pinned === 1 ? 'Unpin' : 'Pin chat'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleToggleArchive(e, conv)}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-slate-300 hover:text-white hover:bg-cyan-500/10 cursor-pointer"
                                >
                                  {conv.is_archived === 1 ? (
                                    <>
                                      <ArchiveRestore className="w-3.5 h-3.5 text-purple-400" />
                                      <span>Restore</span>
                                    </>
                                  ) : (
                                    <>
                                      <Archive className="w-3.5 h-3.5 text-purple-400" />
                                      <span>Archive</span>
                                    </>
                                  )}
                                </button>

                                <div className="my-1 border-t border-slate-800"></div>

                                <button
                                  type="button"
                                  onClick={(e) => handleOpenDelete(e, conv)}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Snippet Preview / Search Match */}
                      {conv.search_preview ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 truncate">
                          <Search className="w-2.5 h-2.5 shrink-0 text-cyan-400" />
                          <span className="truncate">"{conv.search_preview}"</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 truncate pl-0.5 leading-snug">
                          {conv.last_message || 'No messages yet'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3.5 border-t border-cyan-500/15 bg-[#030712]/90 flex items-center gap-2.5 text-xs">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
            {userName[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white truncate leading-tight">{userName}</p>
            <p className="text-[10px] text-cyan-400/80 font-mono truncate">Finny AI Private Ledger</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-15"
        />
      )}

      {/* ================= 2. MAIN CHAT WORKSPACE ================= */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-cyber-radial">
        
        {/* Top Control Header Bar */}
        <div className="h-14 px-4 sm:px-6 bg-[#060c18]/80 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <FinnyAvatar state={isStreaming ? 'talking' : finnyMood} size="xs" className="w-7 h-7" />
              <div>
                <h3 className="font-bold text-white text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
                  {activeConv?.title || 'Finny AI Assistant'}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            {/* Frontier Agent Model Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModelDropdownOpen(!modelDropdownOpen);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#09152b] border border-cyan-500/30 hover:border-cyan-400 text-xs font-mono transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/20"
                title="Select AI Frontier Agent"
              >
                <span className={`w-2 h-2 rounded-full ${currentModelMeta.dotColor} animate-pulse`}></span>
                <span className="font-bold text-white hidden sm:inline">{currentModelMeta.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border ${currentModelMeta.tagColor}`}>
                  {currentModelMeta.badge}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {modelDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-11 w-80 p-2 bg-[#081224] border border-cyan-500/40 rounded-2xl shadow-2xl z-50 space-y-1.5 font-sans animate-fadeIn"
                >
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Active Intelligence Agent</span>
                    <span className="text-cyan-400 font-bold">{FINNY_MODELS.length} Models</span>
                  </div>

                  {FINNY_MODELS.map((m) => {
                    const isSelected = selectedModel === m.id;
                    const IconComponent = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(m.id);
                          setModelDropdownOpen(false);
                          setFinnyMood('happy');
                          setTimeout(() => setFinnyMood('idle'), 2000);
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-start gap-3 text-left transition-all cursor-pointer border ${
                          isSelected 
                            ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-500/15 border-cyan-400 text-white shadow-md' 
                            : 'bg-[#050b16]/70 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${m.color} text-slate-950 font-bold shrink-0 mt-0.5`}>
                          <IconComponent className="w-4 h-4 fill-current" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white truncate">{m.fullName}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                            {m.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleNewChat}
              className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg border border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1"
              title="Start a new chat"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden md:inline">New</span>
            </button>
          </div>
        </div>

        {/* Message Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          
          {/* Skeleton Message Loader when switching conversations */}
          {isLoadingMessages && (
            <div className="max-w-3xl mx-auto space-y-6 py-4 animate-pulse">
              <div className="flex gap-3 justify-start items-start">
                <div className="w-9 h-9 rounded-full bg-slate-800 shrink-0"></div>
                <div className="space-y-2 w-3/5">
                  <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-16 bg-slate-800/60 rounded-2xl"></div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="h-10 bg-cyan-950/40 border border-cyan-500/20 rounded-2xl w-2/5"></div>
              </div>
              <div className="flex gap-3 justify-start items-start">
                <div className="w-9 h-9 rounded-full bg-slate-800 shrink-0"></div>
                <div className="space-y-2 w-4/5">
                  <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                  <div className="h-24 bg-slate-800/60 rounded-2xl"></div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Screen (When conversation is empty) */}
          {!isLoadingMessages && messages.length === 0 && (
            <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8 text-center animate-fadeIn">
              
              {/* Animated Mascot Showcase */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl"></div>
                  <FinnyAvatar state="happy" size="xl" className="w-28 h-28 sm:w-36 sm:h-36 relative z-10" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Hey {userName}! Ready to check your finances?
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                    Ask me anything about your spending, let's plan your monthly budget, or just chat!
                  </p>
                </div>
              </div>

              {/* 4 Multi-Domain Starter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(item.prompt)}
                      className="p-4 rounded-2xl bg-[#071325]/80 hover:bg-[#0b1b36] border border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer group text-left shadow-lg hover:shadow-cyan-500/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-gradient-to-r ${item.color}`}>
                          {item.domain}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-snug">
                        {item.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {/* Active Conversation Messages */}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isEditing = editingMsgId === msg.message_id;

            return (
              <div 
                key={msg.message_id || index}
                className={`flex gap-3 sm:gap-4 max-w-4xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Finny Avatar */}
                {!isUser && (
                  <div className="shrink-0 mt-1">
                    <FinnyAvatar state={isStreaming && index === messages.length - 1 ? 'talking' : 'idle'} size="sm" className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                )}

                {/* Message Content Bubble */}
                <div className={`space-y-2 max-w-[88%] sm:max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
                  
                  {isUser ? (
                    isEditing ? (
                      /* Inline Message Editor */
                      <div className="p-3 bg-[#081224] border border-cyan-400/40 rounded-2xl text-left space-y-2">
                        <textarea
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          className="w-full bg-[#030712] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingMsgId(null)}
                            className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditAndResend(index)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-400 text-slate-950"
                          >
                            Save & Resend
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* User Message Bubble */
                      <div className="group relative inline-block">
                        <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium text-xs sm:text-sm rounded-tr-xs shadow-[0_4px_20px_rgba(6,182,212,0.25)] text-left whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        
                        {/* Edit Button on Hover */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMsgId(msg.message_id);
                            setEditInput(msg.content);
                          }}
                          className="opacity-0 group-hover:opacity-100 absolute -left-7 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-opacity"
                          title="Edit message"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  ) : (
                    /* Assistant Message Card with Markdown */
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#081224]/90 border border-cyan-500/20 text-slate-100 rounded-tl-xs shadow-xl space-y-3">
                      
                      {/* Markdown Text Body */}
                      <MarkdownRenderer content={msg.content} />

                      {/* Blinking Streaming Cursor Indicator */}
                      {isStreaming && index === messages.length - 1 && (
                        <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse"></span>
                      )}

                      {/* Verified Math Proof Badge */}
                      {msg.proof && (
                        <div className="pt-2 border-t border-cyan-500/15 flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{msg.proof}</span>
                        </div>
                      )}

                      {/* Message Action Bar (Copy & Regenerate) */}
                      {!isStreaming && msg.content && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.content, msg.message_id || index)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedMsgId === (msg.message_id || index) ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {index === messages.length - 1 && (
                            <button
                              type="button"
                              onClick={handleRegenerate}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= 3. BOTTOM CHAT INPUT CONTAINER ================= */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-[#040814] via-[#050c18] to-transparent shrink-0">
          <div className="max-w-3xl mx-auto space-y-2.5">
            
            {/* Multi-Agent Selector Quick Bar */}
            <div className="flex items-center justify-between gap-2 px-1 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  Agent:
                </span>
                {FINNY_MODELS.map((m) => {
                  const isSelected = selectedModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id);
                        setFinnyMood('happy');
                        setTimeout(() => setFinnyMood('idle'), 2000);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/30 text-white border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${m.dotColor}`}></span>
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Suggestions Strip */}
            <div className="overflow-x-auto flex items-center gap-2 pb-1 text-xs font-mono">
              {[
                { label: '📊 Analyze my spending', query: 'Analyze my spending breakdown this month' },
                { label: '💰 How much can I save?', query: 'How much can I realistically save by the end of this month?' },
                { label: '⚡ Python useDebounce', query: 'Show me an optimal useDebounce hook with cleanup' },
                { label: '💡 Smart budget tip', query: 'Give me a financial tip based on my current cashflow' }
              ].map((pill, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleSend(pill.query)}
                  disabled={isStreaming}
                  className="px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-700/60 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 transition-all whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Input Box Frame */}
            <div className="relative rounded-2xl bg-[#071325]/90 border border-cyan-500/30 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 shadow-2xl transition-all p-2 flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedModel === 'o3mini'
                    ? "Ask Finny o3-mini deep reasoning, tax calculations, or compound interest derivations..."
                    : selectedModel === 'gpt4' 
                      ? "Ask Finny GPT-4o exact calculations, Python algorithms, or ledger math..." 
                      : selectedModel === 'claude37'
                        ? "Ask Finny Claude 3.7 Sonnet hybrid reasoning, strategic wealth, or behavior guidance..."
                        : selectedModel === 'claude' 
                          ? "Ask Finny Claude 3.5 Sonnet strategic advice, lifestyle budgeting, or habit mentoring..." 
                          : selectedModel === 'gemini25'
                            ? "Ask Finny Gemini 2.5 Pro deep multimodal forecasting, cashflow trends, or document insights..." 
                            : selectedModel === 'gemini'
                              ? "Ask Finny Gemini 2.0 Flash ultra-fast real-time velocity or instant pulse-checks..."
                              : selectedModel === 'deepseek'
                                ? "Ask Finny DeepSeek-R1 chain-of-thought audits, expense leakage deduction, or zero-loss math..."
                                : "Ask Finny (Auto-Router Ensemble) anything across personal finance, coding, or math..."
                }
                rows={1}
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm p-2 outline-none resize-none max-h-36 leading-relaxed font-sans"
              />

              {/* Stop Generation or Send Action */}
              {isStreaming ? (
                <button
                  type="button"
                  onClick={() => setIsStreaming(false)}
                  className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer shrink-0"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
                  title="Send (Enter)"
                >
                  <Send className="w-4 h-4 fill-slate-950" />
                </button>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-500 font-mono">
              Finny integrates multi-domain LLM reasoning with deterministic Python financial calculations.
            </p>
          </div>
        </div>

      </main>

      {/* ================= 4. RENAME MODAL ================= */}
      {renameModalConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#09152b] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                Rename Conversation
              </h3>
              <button
                type="button"
                onClick={() => setRenameModalConv(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRename} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Conversation Title
                </label>
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  placeholder="e.g. Monthly Salary Planning"
                  className="w-full bg-[#040814] border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalConv(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors disabled:opacity-50"
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 5. DELETE CONFIRMATION MODAL ================= */}
      {deleteModalConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#09152b] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Conversation?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to delete <strong className="text-white">"{deleteModalConv.title || 'New Chat'}"</strong>? All messages in this conversation thread will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalConv(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              >
                Delete Thread
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
