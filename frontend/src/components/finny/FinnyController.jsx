import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/**
 * FinnyController.jsx
 * Centralized State Management & React Context for Finny the AI Mascot.
 * 
 * Supported States:
 * - 'idle'
 * - 'welcoming'
 * - 'excited'
 * - 'happy'
 * - 'thinking'
 * - 'celebrating'
 * - 'concerned'
 * - 'talking'
 */

const FinnyContext = createContext(null);

export const FINNY_DEFAULT_MESSAGES = {
  login: "Hey! Welcome back. Ready to take control of your finances?",
  signup: "Yay! A new financial journey begins. Let's do this together!",
  dashboard: "Hey! Let's see how your money is doing today!",
  insights: "Hmm... Let me analyze your financial activity!",
  celebrating: "Woohoo! You reached your savings goal. I'm so proud of you!",
  concerned: "Oops! Your spending is getting a little high. Let's review it together.",
  idle: "I'm right here if you need advice or want to analyze your money! 🐻"
};

export function FinnyProvider({ children }) {
  const [mood, setMood] = useState('idle');
  const [speechText, setSpeechText] = useState('');
  const [isSpeechVisible, setIsSpeechVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const speechTimerRef = useRef(null);

  // Set Mood & Message safely with optional auto-dismiss
  const setFinnyState = useCallback((newMood, message = null, autoDismissMs = null) => {
    setMood(newMood);
    if (message !== null) {
      setSpeechText(message);
      setIsSpeechVisible(true);
    }

    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }

    if (autoDismissMs && autoDismissMs > 0) {
      speechTimerRef.current = setTimeout(() => {
        setIsSpeechVisible(false);
      }, autoDismissMs);
    }
  }, []);

  // Speak a custom message
  const speak = useCallback((message, newMood = null, autoDismissMs = 8000) => {
    if (newMood) setMood(newMood);
    setSpeechText(message);
    setIsSpeechVisible(true);

    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }

    if (autoDismissMs) {
      speechTimerRef.current = setTimeout(() => {
        setIsSpeechVisible(false);
      }, autoDismissMs);
    }
  }, []);

  const hideSpeech = useCallback(() => {
    setIsSpeechVisible(false);
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }
  }, []);

  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);
  const toggleChat = useCallback(() => setIsChatOpen(prev => !prev), []);

  // Automatic Financial Reactivity using Ground-Truth Numbers
  const reactToFinancials = useCallback((financialData) => {
    if (!financialData) return;

    const { budgetUtilization, completedGoalsCount, hasAnomalies, transactionsCount } = financialData;

    // 1. Savings Goal Achieved (Priority 1)
    if (completedGoalsCount && completedGoalsCount > 0) {
      setFinnyState('celebrating', FINNY_DEFAULT_MESSAGES.celebrating, 12000);
      return;
    }

    // 2. Overspending / High Utilization Alert (Priority 2)
    if (budgetUtilization && budgetUtilization > 100) {
      setFinnyState('concerned', FINNY_DEFAULT_MESSAGES.concerned, 10000);
      return;
    }

    // 3. High severity anomaly detected
    if (hasAnomalies) {
      setFinnyState('concerned', "I noticed an unusual transaction in your recent activity. Let's inspect it!", 10000);
      return;
    }

    // 4. Healthy habits or active transactions
    if (transactionsCount && transactionsCount > 0) {
      setFinnyState('happy', FINNY_DEFAULT_MESSAGES.dashboard, 8000);
    } else {
      setFinnyState('idle', "Add income, expenses, or upload a bank statement to get started!", 8000);
    }
  }, [setFinnyState]);

  // Automatic Page-Context Reactivity
  const reactToPage = useCallback((pageName, userName = null) => {
    setActivePage(pageName);

    switch (pageName) {
      case 'login':
        setFinnyState('welcoming', FINNY_DEFAULT_MESSAGES.login);
        break;
      case 'signup':
        if (userName && userName.trim().length > 1) {
          setFinnyState('excited', `Yay ${userName.trim()}! A new financial journey begins. Let's do this together!`);
        } else {
          setFinnyState('excited', FINNY_DEFAULT_MESSAGES.signup);
        }
        break;
      case 'dashboard':
        setFinnyState('happy', FINNY_DEFAULT_MESSAGES.dashboard, 7000);
        break;
      case 'insights':
      case 'evaluation':
        setFinnyState('thinking', FINNY_DEFAULT_MESSAGES.insights, 8000);
        break;
      case 'assistant':
        setFinnyState('happy', "Ask me anything! From coding and math to your private verified finances. ✨", 8000);
        break;
      case 'savings':
        setFinnyState('happy', "Setting targets is the first step toward true financial freedom!", 7000);
        break;
      case 'budgets':
        setFinnyState('thinking', "Let's track your category limits and safe spending runway.", 7000);
        break;
      default:
        setFinnyState('idle', FINNY_DEFAULT_MESSAGES.idle, 6000);
        break;
    }
  }, [setFinnyState]);

  return (
    <FinnyContext.Provider
      value={{
        mood,
        state: mood,
        speechText,
        isSpeechVisible,
        isChatOpen,
        activePage,
        setFinnyState,
        setMood,
        speak,
        hideSpeech,
        openChat,
        closeChat,
        toggleChat,
        reactToFinancials,
        reactToPage
      }}
    >
      {children}
    </FinnyContext.Provider>
  );
}

export function useFinny() {
  const context = useContext(FinnyContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      mood: 'idle',
      state: 'idle',
      speechText: '',
      isSpeechVisible: false,
      isChatOpen: false,
      setFinnyState: () => {},
      setMood: () => {},
      speak: () => {},
      hideSpeech: () => {},
      openChat: () => {},
      closeChat: () => {},
      toggleChat: () => {},
      reactToFinancials: () => {},
      reactToPage: () => {}
    };
  }
  return context;
}
