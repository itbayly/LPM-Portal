import { useState } from 'react';
import { useProperties } from '../../hooks/useProperties';
import { Trash2, Database, ShieldAlert, X, ChevronRight, Terminal } from 'lucide-react';
// REMOVED UNUSED 'cn' IMPORT

export default function AdminTools() {
  const { seedDatabase, clearDatabase, loading } = useProperties(); 
  const [isOpen, setIsOpen] = useState(false);
  const [showNukeOptions, setShowNukeOptions] = useState(false);

  const handleClear = (options: { properties: boolean, users: boolean, documents?: boolean }) => {
    clearDatabase(options);
    setShowNukeOptions(false);
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black/80 dark:bg-white/10 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-[100] backdrop-blur-md border border-white/10"
        title="Developer Console"
      >
        <Terminal className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-72 bg-[#0A0A0C]/95 backdrop-blur-xl text-white p-4 rounded-xl shadow-2xl z-[100] border border-white/10 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-brand dark:text-blue-400" /> 
          System Override
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <button 
          onClick={seedDatabase}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono text-slate-300 transition-colors disabled:opacity-50 group border border-transparent hover:border-white/5"
        >
          <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
             <Database className="w-3.5 h-3.5" />
          </div>
          <span>Inject Seed Data (50)</span>
        </button>

        {/* Nuke Button */}
        {!showNukeOptions ? (
          <button 
            onClick={() => setShowNukeOptions(true)}
            disabled={loading}
            className="w-full flex items-center gap-3 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 transition-colors disabled:opacity-50"
          >
            <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
               <Trash2 className="w-3.5 h-3.5" />
            </div>
            <span>Purge Database...</span>
          </button>
        ) : (
          <div className="space-y-1 p-2 bg-red-950/30 rounded-lg border border-red-900/50 animate-in slide-in-from-top-2">
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2 pl-1">Select Target:</p>
            
            <button 
              onClick={() => handleClear({ properties: true, users: false })}
              className="w-full text-left px-2 py-1.5 hover:bg-red-900/50 rounded text-xs text-red-200 flex items-center justify-between font-mono"
            >
              Properties Only <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button 
              onClick={() => handleClear({ properties: false, users: true })}
              className="w-full text-left px-2 py-1.5 hover:bg-red-900/50 rounded text-xs text-red-200 flex items-center justify-between font-mono"
            >
              Users Only <ChevronRight className="w-3 h-3 opacity-50" />
            </button>
            
            <button 
              onClick={() => handleClear({ properties: false, users: false, documents: true })}
              className="w-full text-left px-2 py-1.5 hover:bg-red-900/50 rounded text-xs text-red-200 flex items-center justify-between font-mono"
            >
              Documents Only <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <div className="h-[1px] bg-red-900/50 my-1" />

            <button 
              onClick={() => handleClear({ properties: true, users: true, documents: true })}
              className="w-full text-left px-2 py-2 bg-red-600 hover:bg-red-500 rounded text-xs text-white font-bold flex items-center justify-between shadow-sm font-mono mt-1"
            >
              TOTAL WIPE <ShieldAlert className="w-3 h-3" />
            </button>

            <button 
              onClick={() => setShowNukeOptions(false)}
              className="w-full text-center py-1.5 text-[10px] text-slate-500 hover:text-slate-300 mt-1 uppercase tracking-wider"
            >
              Abort
            </button>
          </div>
        )}
      </div>
      
      <p className="mt-4 text-[10px] text-slate-600 text-center font-mono">
        ENV: DEVELOPMENT // V.0.9.2
      </p>
    </div>
  );
}