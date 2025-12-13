import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-canvas-light dark:bg-canvas-dark">
      <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between text-sm">
        
        <div className="text-secondary-light dark:text-secondary-dark font-medium">
          © 2025 VNDR
        </div>

        <div className="hidden md:flex gap-6 text-secondary-light dark:text-secondary-dark">
          <a href="#" className="hover:text-primary-light dark:hover:text-primary-dark transition-colors">Support</a>
          <a href="#" className="hover:text-primary-light dark:hover:text-primary-dark transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary-light dark:hover:text-primary-dark transition-colors">Vendor Login</a>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="font-mono text-xs text-secondary-light dark:text-secondary-dark uppercase tracking-wider">
            System Operational
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;