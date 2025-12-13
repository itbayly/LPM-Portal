import React from 'react';
import { motion } from 'framer-motion';

const ProblemGrid: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-black/5 dark:bg-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-6 text-primary-light dark:text-primary-dark"
            >
              The $50,000 mistake hiding in your filing cabinet.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-secondary-light dark:text-secondary-dark leading-relaxed"
            >
              Auto-renews happen because you got busy. VNDR watches the dates so you don't have to. 
              Stop relying on sticky notes and memory.
            </motion.p>
          </div>

          {/* Masonry Visuals */}
          <div className="lg:col-span-7 h-[600px] relative order-1 lg:order-2">
            
            {/* Card 1: The Contract */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: -2 }}
              viewport={{ once: true }}
              className="absolute top-10 left-0 md:left-10 w-64 md:w-80 h-96 bg-[#fdfbf7] shadow-lg rounded-sm p-6 transform -rotate-2 z-10 border border-gray-200"
            >
              <div className="w-full h-full text-[6px] text-gray-400 overflow-hidden font-mono leading-relaxed select-none">
                <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-widest">Service Agreement</h3>
                {Array.from({ length: 40 }).map((_, i) => (
                   <p key={i} className="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. {i % 5 === 0 && <span className="font-bold text-red-800 bg-red-100">AUTO-RENEWAL CLAUSE</span>}</p>
                ))}
              </div>
              {/* Coffee Stain */}
              <div className="absolute bottom-10 right-8 w-24 h-24 rounded-full border-[10px] border-[#8b5a2b]/20 blur-sm coffee-stain pointer-events-none" />
            </motion.div>

            {/* Card 2: Sticky Note */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 5 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="absolute top-0 right-4 md:right-20 w-48 h-48 bg-[#fef08a] shadow-md transform rotate-3 z-20 flex items-center justify-center p-4"
            >
              <p className="font-hand text-2xl text-gray-800 rotate-[-5deg] leading-tight">
                Call Vendor - expired last week?? <br/> 😡
              </p>
            </motion.div>

            {/* Card 3: Text Message */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-20 right-0 md:right-10 w-72 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl z-30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-secondary-light dark:text-secondary-dark">MESSAGES</span>
                <span className="text-xs text-secondary-light dark:text-secondary-dark">11:42 PM</span>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none p-3 text-sm text-primary-light dark:text-primary-dark">
                  AC is down, who is our service provider?? I can't find the contract.
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemGrid;