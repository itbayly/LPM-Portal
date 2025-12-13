import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_TABS } from '../constants';
import type { TabItem } from '../types';

const SolutionBinder: React.FC = () => {
  const [tabs, setTabs] = useState<TabItem[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState('elevator');

  const handleTabClick = (id: string) => {
    setActiveTabId(id);
    
    // Simulate fixing the problem on click
    if (id === 'hvac') {
      const updatedTabs = tabs.map(t => 
        t.id === 'hvac' ? { ...t, status: 'active' as const } : t
      );
      setTabs(updatedTabs);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <section className="py-32 px-4">
      <div className="max-w-4xl mx-auto mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-primary-light dark:text-primary-dark">
          Everything in its right place.
        </h2>
        <p className="text-lg text-secondary-light dark:text-secondary-dark max-w-2xl mx-auto">
          Upload your PDF. We extract the dates, the costs, and the 'gotchas'. If your vendor tries to raise prices, you'll know if it's capped.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* The Binder Interface */}
        <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
          
          {/* Header/Tabs */}
          <div className="flex border-b border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md p-2 gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTabId === tab.id 
                    ? 'bg-white dark:bg-white/10 shadow-sm text-primary-light dark:text-white' 
                    : 'text-primary-light/60 dark:text-white/60 hover:text-primary-light dark:hover:text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.label}
                  <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                    tab.status === 'active' ? 'bg-green-500' : 
                    tab.status === 'missing' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 md:p-12 relative overflow-hidden bg-white/50 dark:bg-[#0A0A0C]">
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeTabId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex justify-between items-start mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-primary-light dark:text-primary-dark mb-2">
                        {activeTab?.label} Maintenance Agreement
                      </h3>
                      <p className="text-sm text-secondary-light dark:text-secondary-dark font-mono">
                        ID: #{activeTab?.id.toUpperCase()}-2024-X99
                      </p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                       activeTab?.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                       activeTab?.status === 'missing' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                       'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {activeTab?.status === 'active' ? 'Active & Monitored' : activeTab?.status === 'missing' ? 'Docs Missing' : 'Action Required'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-xs text-secondary-light dark:text-secondary-dark uppercase mb-2">Annual Cost</p>
                      <p className="text-2xl font-mono text-primary-light dark:text-primary-dark">$12,450.00</p>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-xs text-secondary-light dark:text-secondary-dark uppercase mb-2">Renewal Date</p>
                      <p className="text-2xl font-mono text-primary-light dark:text-primary-dark">Oct 24, 2025</p>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-xs text-secondary-light dark:text-secondary-dark uppercase mb-2">Increase Cap</p>
                      <p className="text-2xl font-mono text-green-600 dark:text-green-400">3.5% Max</p>
                    </div>
                  </div>

                  <div className="mt-8 flex-1 bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-dashed border-gray-300 dark:border-white/10 flex flex-col justify-center">
                     <p className="text-xs font-bold text-secondary-light dark:text-secondary-dark uppercase mb-4 text-center">Attached Files</p>
                     
                     <div className="max-w-lg mx-auto w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 flex items-center gap-4 hover:border-accent/50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">PDF</div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-primary-light dark:text-primary-dark truncate">
                              Fully Executed {activeTab?.label} Service Agreement.pdf
                           </p>
                           <p className="text-xs text-secondary-light dark:text-secondary-dark">2.4 MB • Uploaded Oct 24, 2024</p>
                        </div>
                        <div className="text-green-500">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                     </div>

                  </div>

                </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionBinder;