import React from 'react';
import { motion } from 'framer-motion';
import { BENEFITS } from '../constants';

const ValueProp: React.FC = () => {
  return (
    <section className="py-32 px-4 bg-white dark:bg-[#020203]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Col: Visual Split */}
        <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl group border border-gray-100 dark:border-white/5">
          {/* Before: Messy Spreadsheet */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gray-50 overflow-hidden flex flex-col">
             <div className="p-2 bg-gray-200 border-b border-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-2 text-[10px] text-gray-500 font-mono">vendor_contracts_final_v3_REAL.xlsx</div>
             </div>
             <div className="flex-1 overflow-hidden relative">
                {/* CSS Grid to simulate messy spreadsheet */}
                <div className="grid grid-cols-12 gap-[1px] bg-gray-300 border border-gray-300 min-w-[600px] transform scale-100 origin-top-left">
                   {Array.from({ length: 144 }).map((_, i) => (
                      <div key={i} className={`bg-white h-8 flex items-center px-1 ${i % 7 === 0 ? 'bg-red-50' : i % 11 === 0 ? 'bg-yellow-50' : ''}`}>
                         <div 
                           className="h-2 rounded-full bg-gray-200"
                           style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }}
                         />
                      </div>
                   ))}
                </div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm border border-white/10">BEFORE: CHAOS</span>
             </div>
          </div>

          {/* After: Clean Dashboard */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#0F172A] overflow-hidden flex flex-col">
             <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-4">
                   <div className="h-2 w-16 bg-accent rounded-full opacity-80"></div>
                   <div className="h-2 w-12 bg-gray-600 rounded-full"></div>
                </div>
                <div className="h-6 w-6 rounded-full bg-accent/20 border border-accent/50"></div>
             </div>
             <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                   <div className="h-8 w-8 rounded bg-green-500/20 mb-3 flex items-center justify-center text-green-400 font-bold text-xs">A+</div>
                   <div className="h-2 w-20 bg-gray-600 rounded mb-2"></div>
                   <div className="h-4 w-12 bg-white rounded opacity-80"></div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                   <div className="h-8 w-8 rounded bg-blue-500/20 mb-3 flex items-center justify-center text-blue-400 font-bold text-xs">7</div>
                   <div className="h-2 w-20 bg-gray-600 rounded mb-2"></div>
                   <div className="h-4 w-12 bg-white rounded opacity-80"></div>
                </div>
                <div className="col-span-2 bg-white/5 rounded-lg p-4 border border-white/5 flex items-center gap-3">
                   <div className="h-8 w-8 rounded bg-purple-500/20"></div>
                   <div className="flex-1">
                      <div className="h-2 w-full bg-gray-700 rounded mb-1"></div>
                      <div className="h-2 w-2/3 bg-gray-700 rounded"></div>
                   </div>
                </div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center bg-accent/10">
                <span className="bg-accent text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-accent/20">AFTER: VNDR</span>
             </div>
          </div>
          
          {/* Divider Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 z-10 shadow-lg" />
        </div>

        {/* Right Col: Benefits */}
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-primary-light dark:text-primary-dark">
            Run your building. <br/>
            <span className="text-secondary-light dark:text-secondary-dark">Don't let it run you.</span>
          </h2>

          <div className="space-y-8">
            {BENEFITS.map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-light dark:text-primary-dark mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-secondary-light dark:text-secondary-dark leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ValueProp;