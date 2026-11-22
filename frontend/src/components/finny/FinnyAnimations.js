/**
 * FinnyAnimations.js
 * Centralized Framer Motion animation definitions for Finny the AI Mascot.
 * States: idle, welcoming, excited, happy, thinking, celebrating, concerned, talking
 */

export const mascotVariants = {
  idle: {
    y: [0, -6, 0],
    rotate: [0, -1, 1, 0],
    transition: {
      duration: 3.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  welcoming: {
    y: [0, -5, 0],
    rotate: [0, -2, 2, 0],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  excited: {
    y: [0, -14, 0, -8, 0],
    scale: [1, 1.04, 0.98, 1.02, 1],
    rotate: [-2, 2, -1, 1, 0],
    transition: {
      duration: 1.1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  happy: {
    y: [0, -10, 0],
    scale: [1, 1.03, 1],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  thinking: {
    y: [0, -4, 0],
    rotate: [-4, -3, -4],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  celebrating: {
    y: [0, -18, 0, -12, 0],
    scale: [1, 1.08, 0.96, 1.04, 1],
    rotate: [-4, 4, -3, 3, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  concerned: {
    y: [0, 2, 0],
    rotate: [1, -2, 1],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  talking: {
    y: [0, -3, 0],
    rotate: [0, 1.5, -1.5, 0],
    transition: {
      duration: 0.7,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pawLeftVariants = {
  idle: { rotate: 0, y: 0 },
  welcoming: { rotate: [-5, 5, -5], y: [-1, 1, -1], transition: { duration: 1.8, repeat: Infinity } },
  excited: { rotate: [-15, 15, -15], y: [-6, 0, -6], transition: { duration: 0.6, repeat: Infinity } },
  happy: { rotate: [-10, 0, -10], y: [-2, 0, -2], transition: { duration: 1.2, repeat: Infinity } },
  thinking: { rotate: -15, y: -8, x: 4, transition: { duration: 0.4 } }, // Paw touching chin
  celebrating: { rotate: [-35, -20, -35], y: [-14, -8, -14], transition: { duration: 0.8, repeat: Infinity } },
  concerned: { rotate: 8, y: 2, transition: { duration: 0.4 } },
  talking: { rotate: [-8, 4, -8], y: [-2, 0, -2], transition: { duration: 0.9, repeat: Infinity } }
};

export const pawRightVariants = {
  idle: { rotate: 0, y: 0 },
  welcoming: { 
    rotate: [15, -25, 20, -20, 15], 
    y: [-12, -18, -12],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } 
  }, // Friendly wave towards user
  excited: { rotate: [20, -20, 20], y: [-8, 0, -8], transition: { duration: 0.6, repeat: Infinity } },
  happy: { 
    rotate: [-15, -5, -15], 
    y: [-6, -2, -6], 
    transition: { duration: 1.2, repeat: Infinity } 
  }, // Thumbs up gesture
  thinking: { rotate: 10, y: 0, transition: { duration: 0.4 } },
  celebrating: { rotate: [35, 20, 35], y: [-14, -8, -14], transition: { duration: 0.8, repeat: Infinity } },
  concerned: { rotate: -8, y: 2, transition: { duration: 0.4 } },
  talking: { rotate: [8, -4, 8], y: [-2, 0, -2], transition: { duration: 0.9, repeat: Infinity } }
};

export const earLeftVariants = {
  idle: { rotate: [0, -3, 0], transition: { duration: 4, repeat: Infinity } },
  excited: { rotate: [-8, 6, -8], transition: { duration: 0.5, repeat: Infinity } },
  thinking: { rotate: -8, transition: { duration: 0.3 } },
  concerned: { rotate: 6, y: 2, transition: { duration: 0.4 } } // Droopy ears
};

export const earRightVariants = {
  idle: { rotate: [0, 3, 0], transition: { duration: 4.5, repeat: Infinity } },
  excited: { rotate: [8, -6, 8], transition: { duration: 0.5, repeat: Infinity } },
  thinking: { rotate: 4, transition: { duration: 0.3 } },
  concerned: { rotate: -6, y: 2, transition: { duration: 0.4 } } // Droopy ears
};

export const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 380, damping: 24 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 6, 
    transition: { duration: 0.2 } 
  }
};
