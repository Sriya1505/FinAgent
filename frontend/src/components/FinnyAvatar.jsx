import React from 'react';
import FinnyMascot from './finny/FinnyMascot';

/**
 * FinnyAvatar
 * Backwards-compatible proxy forwarding directly to the unified FinnyMascot.
 * Ensures 100% identical character design across all pages.
 */
export default function FinnyAvatar({ 
  state = 'idle', 
  size = 'md', 
  className = '', 
  onClick, 
  showConfetti = false 
}) {
  return (
    <FinnyMascot
      state={state}
      size={size}
      className={className}
      onClick={onClick}
    />
  );
}
