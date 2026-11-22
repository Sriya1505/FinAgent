import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mascotVariants, earLeftVariants, earRightVariants } from './FinnyAnimations';
import { FinnyEyes, FinnyEyebrows, FinnyMouth, FinnyPaws } from './FinnyExpressions';
import FinnySpeechBubble from './FinnySpeechBubble';
import { useFinny } from './FinnyController';

/**
 * FinnyMascot.jsx
 * Unified Interactive 3D Baby Bear AI Companion Mascot.
 * 
 * Features:
 * - 100% Identical character design, proportions, color palette (lavender/purple/cyan/blue)
 * - 8 Context-Aware States: idle, welcoming, excited, happy, thinking, celebrating, concerned, talking
 * - Autonomous eye-blinking with natural jitter
 * - Interactive hover & click reactions
 * - Celebration canvas confetti & Thinking floating particle telemetry
 */
export default function FinnyMascot({
  state: stateProp,
  size = 'md',
  speechMessage: speechProp,
  showSpeech = false,
  speechPosition = 'top',
  speechActionLabel,
  onSpeechAction,
  interactive = true,
  onClick,
  className = '',
  lookAtForm = false
}) {
  const { mood: contextMood, speechText: contextSpeech, isSpeechVisible, toggleChat, speak } = useFinny();
  const currentState = stateProp || contextMood || 'idle';
  const currentSpeech = speechProp !== undefined ? speechProp : contextSpeech;
  const shouldShowSpeech = showSpeech || isSpeechVisible;

  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef(null);

  // Size mapping
  const sizeMap = {
    xs: { container: 'w-8 h-8', svg: 32 },
    sm: { container: 'w-12 h-12', svg: 48 },
    md: { container: 'w-20 h-20', svg: 80 },
    lg: { container: 'w-28 h-28', svg: 112 },
    xl: { container: 'w-40 h-40', svg: 160 },
    hero: { container: 'w-48 h-48 sm:w-64 sm:h-64 lg:w-[320px] lg:h-[320px]', svg: 320 }
  };
  const currentSize = sizeMap[size] || sizeMap.md;

  // 1. Natural Blinking Engine (Every 3.2s to 5.2s with 140ms duration)
  useEffect(() => {
    let blinkTimeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        const nextInterval = 3200 + Math.random() * 2000;
        blinkTimeout = setTimeout(triggerBlink, nextInterval);
      }, 140);
    };

    const initialDelay = 1500 + Math.random() * 2000;
    blinkTimeout = setTimeout(triggerBlink, initialDelay);

    return () => clearTimeout(blinkTimeout);
  }, []);

  // 2. High-Performance Canvas Confetti on Celebrating State
  useEffect(() => {
    if (currentState === 'celebrating') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 260;
      canvas.height = 260;

      const colors = ['#c084fc', '#38bdf8', '#22d3ee', '#f472b6', '#fbbf24', '#a855f7', '#60a5fa'];
      const particles = Array.from({ length: 48 }, () => ({
        x: 130 + (Math.random() - 0.5) * 50,
        y: 110,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 9 - 4,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 14,
        life: 1
      }));

      let animId;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.24; // gravity
          p.rotation += p.vr;
          p.life -= 0.016;

          if (p.life > 0) {
            alive = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            ctx.restore();
          }
        });

        if (alive) {
          animId = requestAnimationFrame(render);
        }
      };

      animId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animId);
    }
  }, [currentState]);

  // Click handler
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (interactive) {
      // Toggle or open interactive chat and say hello
      if (currentState === 'idle') {
        speak("Hi! I'm Finny. How can I assist your financial journey today?", 'happy');
      } else {
        toggleChat();
      }
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      
      {/* Optional Speech Bubble Placed Contextually */}
      {currentSpeech && (
        <div className={`absolute pointer-events-auto z-40 ${
          speechPosition === 'top' ? 'bottom-[105%] mb-2' :
          speechPosition === 'bottom' ? 'top-[105%] mt-2' :
          speechPosition === 'right' ? 'left-[105%] top-0 ml-3' :
          'right-[105%] top-0 mr-3'
        }`}>
          <FinnySpeechBubble
            message={currentSpeech}
            isVisible={shouldShowSpeech}
            state={currentState}
            position={speechPosition}
            actionLabel={speechActionLabel}
            onActionClick={onSpeechAction || toggleChat}
          />
        </div>
      )}

      {/* Main Animated Mascot Body */}
      <motion.div
        variants={mascotVariants}
        animate={currentState}
        whileHover={interactive ? { scale: 1.06, rotate: 1 } : {}}
        whileTap={interactive ? { scale: 0.94 } : {}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className={`relative inline-flex items-center justify-center cursor-pointer ${currentSize.container}`}
      >
        {/* Celebration Confetti Canvas */}
        {currentState === 'celebrating' && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 -top-16 -left-16 w-[260%] h-[260%] pointer-events-none z-30"
          />
        )}

        {/* Floating Thinking Question Marks / Sparkles */}
        <AnimatePresence>
          {currentState === 'thinking' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: [0.6, 1, 0.6], y: [-2, -8, -2], scale: [0.95, 1.05, 0.95] }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 right-1 flex items-center gap-1 z-20 pointer-events-none font-mono font-bold"
            >
              <span className="text-purple-400 text-sm drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">?</span>
              <span className="text-cyan-300 text-xs drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse">✦</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Soft Cyber Glow Filter behind mascot */}
        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
          currentState === 'celebrating' ? 'bg-amber-400/20' :
          currentState === 'concerned' ? 'bg-rose-500/15' :
          currentState === 'thinking' ? 'bg-purple-500/25' :
          isHovered ? 'bg-cyan-400/30' : 'bg-purple-600/15'
        }`} />

        {/* 100% Consistent 3D Baby Bear Mascot SVG */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-[0_8px_22px_rgba(168,85,247,0.35)] relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Lavender / Purple 3D Fur Gradient */}
            <radialGradient id="bearFurGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="28%" stopColor="#d8b4fe" />
              <stop offset="68%" stopColor="#a855f7" />
              <stop offset="92%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#581c87" />
            </radialGradient>

            {/* Dark Fur for Ears / Body Shadow */}
            <radialGradient id="bearDarkFur" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="80%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#4c1d95" />
            </radialGradient>

            {/* Celestial Soft Blue Accent Gradient */}
            <radialGradient id="bearBlueAccent" cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="35%" stopColor="#bae6fd" />
              <stop offset="75%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </radialGradient>

            {/* Rosy Cheek Blush */}
            <radialGradient id="bearBlush" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f472b6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
            </radialGradient>

            {/* Glossy Eye Gradient */}
            <radialGradient id="bearEyeGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="45%" stopColor="#1e1b4b" />
              <stop offset="85%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Button Nose Gradient */}
            <radialGradient id="bearNoseGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="40%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>

            {/* Holographic Cyan Cyber Gem */}
            <linearGradient id="cyberGem" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ================= 1. EARS ================= */}
          {/* Left Ear */}
          <motion.g
            variants={earLeftVariants}
            animate={currentState}
            style={{ originX: "28px", originY: "28px" }}
          >
            <ellipse cx="28" cy="28" rx="17" ry="16" fill="url(#bearDarkFur)" />
            <ellipse cx="28" cy="28" rx="11" ry="10" fill="url(#bearBlueAccent)" />
            <ellipse cx="25" cy="23" rx="4" ry="2.5" fill="#ffffff" opacity="0.32" transform="rotate(-20 25 23)" />
          </motion.g>

          {/* Right Ear */}
          <motion.g
            variants={earRightVariants}
            animate={currentState}
            style={{ originX: "92px", originY: "28px" }}
          >
            <ellipse cx="92" cy="28" rx="17" ry="16" fill="url(#bearDarkFur)" />
            <ellipse cx="92" cy="28" rx="11" ry="10" fill="url(#bearBlueAccent)" />
            <ellipse cx="89" cy="23" rx="4" ry="2.5" fill="#ffffff" opacity="0.32" transform="rotate(20 89 23)" />
          </motion.g>

          {/* ================= 2. BODY & BELLY ================= */}
          <ellipse cx="60" cy="85" rx="34" ry="28" fill="url(#bearFurGrad)" />
          <ellipse cx="60" cy="86" rx="20" ry="18" fill="url(#bearBlueAccent)" />

          {/* Lower Feet Paws */}
          <ellipse cx="38" cy="108" rx="13" ry="8" fill="url(#bearDarkFur)" />
          <ellipse cx="38" cy="107" rx="7" ry="4.5" fill="url(#bearBlueAccent)" />
          <ellipse cx="82" cy="108" rx="13" ry="8" fill="url(#bearDarkFur)" />
          <ellipse cx="82" cy="107" rx="7" ry="4.5" fill="url(#bearBlueAccent)" />

          {/* ================= 3. CHUBBY HEAD ================= */}
          <g transform={lookAtForm ? "translate(3, 1) rotate(2 60 54)" : ""}>
            {/* Base Head */}
            <ellipse cx="60" cy="54" rx="39" ry="34" fill="url(#bearFurGrad)" />
            {/* Forehead Specular Sheen */}
            <ellipse cx="50" cy="32" rx="16" ry="7" fill="#ffffff" opacity="0.25" transform="rotate(-8 50 32)" />

            {/* Rosy Cheeks */}
            <circle cx="33" cy="62" r="9" fill="url(#bearBlush)" />
            <circle cx="87" cy="62" r="9" fill="url(#bearBlush)" />

            {/* Muzzle */}
            <ellipse cx="60" cy="64" rx="17" ry="13" fill="url(#bearBlueAccent)" />

            {/* Eyes */}
            <FinnyEyes state={currentState} isBlinking={isBlinking} />

            {/* Eyebrows */}
            <FinnyEyebrows state={currentState} />

            {/* Button Nose */}
            <ellipse cx="60" cy="59" rx="4.5" ry="3.5" fill="url(#bearNoseGrad)" />
            <ellipse cx="58.5" cy="58" rx="1.5" ry="0.8" fill="#ffffff" opacity="0.65" />

            {/* Mouth */}
            <FinnyMouth state={currentState} />

            {/* Whiskers */}
            <circle cx="49" cy="63" r="0.8" fill="#7e22ce" opacity="0.4" />
            <circle cx="47" cy="65" r="0.8" fill="#7e22ce" opacity="0.4" />
            <circle cx="71" cy="63" r="0.8" fill="#7e22ce" opacity="0.4" />
            <circle cx="73" cy="65" r="0.8" fill="#7e22ce" opacity="0.4" />
          </g>

          {/* ================= 4. FRONT PAWS ================= */}
          <FinnyPaws state={currentState} />

          {/* ================= 5. CYBER BOWTIE ================= */}
          <g transform="translate(60, 78) scale(0.92)">
            <polygon points="0,-4 7,0 0,4 -7,0" fill="url(#cyberGem)" filter="url(#softGlow)" />
            <polygon points="0,-3 5,0 0,3 -5,0" fill="#ffffff" opacity="0.55" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
