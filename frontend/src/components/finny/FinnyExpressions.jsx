import React from 'react';
import { motion } from 'framer-motion';
import { pawLeftVariants, pawRightVariants } from './FinnyAnimations';

/**
 * FinnyExpressions.jsx
 * Modular SVG facial components and paws for Finny.
 * Maintains consistent dimensions and proportions across states.
 */

export function FinnyEyes({ state, isBlinking }) {
  if (isBlinking) {
    // Natural blinking: cute curved eyelids
    return (
      <g>
        <path d="M 37 49 Q 44 54 51 49" stroke="#3b0764" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M 69 49 Q 76 54 83 49" stroke="#3b0764" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (state === 'celebrating') {
    // Joyful anime star/sparkle eyes
    return (
      <g>
        {/* Left Star Eye */}
        <path d="M 44 42 L 46 47 L 51 48 L 47 51 L 48 56 L 44 53 L 40 56 L 41 51 L 37 48 L 42 47 Z" fill="#38bdf8" />
        <circle cx="44" cy="49" r="1.5" fill="#ffffff" />
        {/* Right Star Eye */}
        <path d="M 76 42 L 78 47 L 83 48 L 79 51 L 80 56 L 76 53 L 72 56 L 73 51 L 69 48 L 74 47 Z" fill="#38bdf8" />
        <circle cx="76" cy="49" r="1.5" fill="#ffffff" />
      </g>
    );
  }

  if (state === 'thinking') {
    // Eyes looking upward & slightly right in deep analytical thought
    return (
      <g>
        {/* Left Eye Base */}
        <ellipse cx="44" cy="48" rx="6.5" ry="8" fill="url(#bearEyeGrad)" />
        {/* Pupil shifted up-right */}
        <circle cx="46" cy="44" r="3.2" fill="#ffffff" />
        <circle cx="48" cy="47" r="1.4" fill="#ffffff" opacity="0.85" />
        <ellipse cx="45" cy="51" rx="3.2" ry="1.6" fill="#c084fc" opacity="0.45" />

        {/* Right Eye Base */}
        <ellipse cx="76" cy="48" rx="6.5" ry="8" fill="url(#bearEyeGrad)" />
        {/* Pupil shifted up-right */}
        <circle cx="78" cy="44" r="3.2" fill="#ffffff" />
        <circle cx="80" cy="47" r="1.4" fill="#ffffff" opacity="0.85" />
        <ellipse cx="77" cy="51" rx="3.2" ry="1.6" fill="#c084fc" opacity="0.45" />
      </g>
    );
  }

  if (state === 'concerned') {
    // Gentle, compassionate wide eyes looking towards problem
    return (
      <g>
        <ellipse cx="44" cy="49" rx="6.5" ry="7.5" fill="url(#bearEyeGrad)" />
        <circle cx="43" cy="47" r="2.6" fill="#ffffff" />
        <circle cx="46.5" cy="52" r="1.2" fill="#ffffff" opacity="0.8" />
        <ellipse cx="44" cy="54" rx="3" ry="1.4" fill="#c084fc" opacity="0.4" />

        <ellipse cx="76" cy="49" rx="6.5" ry="7.5" fill="url(#bearEyeGrad)" />
        <circle cx="75" cy="47" r="2.6" fill="#ffffff" />
        <circle cx="78.5" cy="52" r="1.2" fill="#ffffff" opacity="0.8" />
        <ellipse cx="76" cy="54" rx="3" ry="1.4" fill="#c084fc" opacity="0.4" />
      </g>
    );
  }

  // Default: Large, expressive, friendly eyes with rich specular depth
  return (
    <g>
      {/* Left Eye */}
      <ellipse cx="44" cy="48" rx="6.5" ry="8" fill="url(#bearEyeGrad)" />
      <circle cx="42" cy="45" r="2.8" fill="#ffffff" />
      <circle cx="46.5" cy="51" r="1.3" fill="#ffffff" opacity="0.85" />
      <ellipse cx="44" cy="53" rx="3" ry="1.5" fill="#c084fc" opacity="0.45" />

      {/* Right Eye */}
      <ellipse cx="76" cy="48" rx="6.5" ry="8" fill="url(#bearEyeGrad)" />
      <circle cx="74" cy="45" r="2.8" fill="#ffffff" />
      <circle cx="78.5" cy="51" r="1.3" fill="#ffffff" opacity="0.85" />
      <ellipse cx="76" cy="53" rx="3" ry="1.5" fill="#c084fc" opacity="0.45" />
    </g>
  );
}

export function FinnyEyebrows({ state }) {
  if (state === 'thinking') {
    // Inquisitive asymmetric eyebrows
    return (
      <g>
        <path d="M 38 38 Q 44 35 49 39" stroke="#6b21a8" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 71 34 Q 77 30 82 34" stroke="#6b21a8" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }

  if (state === 'concerned') {
    // Gentle sympathetic worried eyebrows
    return (
      <g>
        <path d="M 39 36 Q 44 39 49 37" stroke="#6b21a8" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 71 37 Q 76 39 81 36" stroke="#6b21a8" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    );
  }

  if (state === 'excited' || state === 'celebrating') {
    // High arched happy eyebrows
    return (
      <g>
        <path d="M 38 35 Q 44 31 50 35" stroke="#6b21a8" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M 70 35 Q 76 31 82 35" stroke="#6b21a8" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }

  // Welcoming / Happy / Idle: Friendly soft arch
  return (
    <g>
      <path d="M 39 37 Q 44 34 49 37" stroke="#6b21a8" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 71 37 Q 76 34 81 37" stroke="#6b21a8" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

export function FinnyMouth({ state }) {
  if (state === 'happy' || state === 'celebrating' || state === 'excited') {
    // Joyful open smile with pink tongue
    return (
      <g>
        <path d="M 53 64 Q 60 73 67 64 Z" fill="#881337" />
        <path d="M 55 67 Q 60 74 65 67 Q 60 66 55 67 Z" fill="#fb7185" />
      </g>
    );
  }

  if (state === 'concerned') {
    // Gentle worried pout
    return (
      <path d="M 54 67 Q 60 63 66 67" stroke="#3b0764" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    );
  }

  if (state === 'thinking') {
    // Inquisitive pursed smirk
    return (
      <path d="M 55 65 Q 60 68 66 64" stroke="#3b0764" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    );
  }

  if (state === 'talking') {
    // Animated talking mouth rhythm
    return (
      <g>
        <ellipse cx="60" cy="66" rx="4.5" ry="3.5" fill="#881337" className="animate-finny-mouth" />
        <path d="M 58 68 Q 60 70 62 68" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    );
  }

  // Welcoming / Idle: Warm cheerful mascot smile
  return (
    <path d="M 53 64 Q 60 68 67 64" stroke="#3b0764" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  );
}

export function FinnyPaws({ state }) {
  return (
    <g>
      {/* Left Front Paw */}
      <motion.g
        variants={pawLeftVariants}
        animate={state}
        style={{ originX: "32px", originY: "78px" }}
      >
        <ellipse cx="32" cy="78" rx="8" ry="7" fill="url(#bearDarkFur)" />
        <ellipse cx="32" cy="77" rx="4" ry="3" fill="url(#bearBlueAccent)" />
      </motion.g>

      {/* Right Front Paw (Waves on welcoming/excited, thumbs up on happy) */}
      <motion.g
        variants={pawRightVariants}
        animate={state}
        style={{ originX: "88px", originY: "78px" }}
      >
        <ellipse cx="88" cy="78" rx="8" ry="7" fill="url(#bearDarkFur)" />
        <ellipse cx="88" cy="77" rx="4" ry="3" fill="url(#bearBlueAccent)" />
      </motion.g>
    </g>
  );
}
