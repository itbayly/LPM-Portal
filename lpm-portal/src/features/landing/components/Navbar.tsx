import React from 'react';
import { motion } from 'framer-motion';
import { VndrLogo } from '../../../components/ui/VndrLogo';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLoginClick: () => void; 
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, onLoginClick }) => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl border border-transparent dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-md shadow-lvl1">
        <div className="flex items-center">
          <VndrLogo className="h-6 w-auto text-primary-light dark:text-white hover:opacity-80 transition-opacity" />
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-secondary-light dark:text-secondary-dark"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={onLoginClick}
            className="hidden sm:block text-sm font-medium text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
          >
            Sign In
          </button>
          
          <button 
            onClick={onLoginClick}
            className="bg-accent text-white dark:text-black px-5 py-2 rounded-full text-sm font-semibold shadow-glow dark:shadow-glow-dark hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Start Tracking
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;