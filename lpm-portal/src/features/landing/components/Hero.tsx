import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOTIFICATIONS } from '../constants';

const Hero: React.FC = () => {
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNoteIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
    }, 5000); // Changed to 5000ms
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center pt-48 pb-24 px-4 overflow-hidden">
      {/* Background Aurora */}
      <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-accent/10 dark:bg-accent-dark/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10 px-4 py-1.5 rounded-full border border-secondary-light/20 dark:border-secondary-dark/20 bg-white/30 dark:bg-white/5 backdrop-blur-sm"
      >
        <span className="text-xs font-semibold tracking-wide uppercase text-secondary-light dark:text-secondary-dark">
          Public Beta Access
        </span>
      </motion.div>

      {/* Notification Toast (Moved & Centered) */}
      <div className="h-14 mb-10">
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeNoteIndex}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg"
          >
            <div className="text-lg">{NOTIFICATIONS[activeNoteIndex].icon}</div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                {NOTIFICATIONS[activeNoteIndex].title}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-300 leading-tight">
                {NOTIFICATIONS[activeNoteIndex].message}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Headlines */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl md:text-7xl font-extrabold text-center tracking-tight text-primary-light dark:text-primary-dark max-w-4xl mb-10 text-balance"
      >
        Your Contracts, <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light dark:from-white dark:to-secondary-dark">
          Under Control.
        </span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg md:text-xl text-center text-secondary-light dark:text-secondary-dark max-w-2xl mb-16 leading-relaxed"
      >
        The unified platform to track every service agreement, catch hidden costs, and never miss a renewal date again. From landscaping to elevators—manage it all in one place.
      </motion.p>

      {/* CTA Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative flex flex-col items-center mb-24"
      >
        <button className="bg-accent text-white dark:text-black px-8 py-4 rounded-xl text-lg font-bold shadow-glow dark:shadow-glow-dark hover:scale-105 active:scale-95 transition-all duration-200 z-10">
          Start Tracking for Free
        </button>
      </motion.div>

      {/* 3D Visual Anchor REMOVED per request */}

    </section>
  );
};

export default Hero;