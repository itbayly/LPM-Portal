import { useState } from 'react';
import { useProperties } from '../../hooks/useProperties';
import { Trash2, Database, ShieldAlert, X, ChevronRight } from 'lucide-react';

export default function AdminTools() {
  // The 'clearDatabase' function is assumed to now accept { documents: boolean }
  const { seedDatabase, clearDatabase, loading } = useProperties(); 
  const [isOpen, setIsOpen] = useState(true);
  const [showNukeOptions, setShowNukeOptions] = useState(false);

  // Helper to call clearDatabase and close the options panel
  const handleClear = (options: { properties: boolean, users: boolean, documents?: boolean }) => {
    clearDatabase(options);
    setShowNukeOptions(false);
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
      >
        <ShieldAlert className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-slate-900 text-white p-4 rounded-lg shadow-2xl z-50 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-yellow-400" /> 
          Developer Controls
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <button 
          onClick={seedDatabase}
          disabled={loading}
          className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          Seed Hierarchy Data (50)
        </button>

        {/* Nuke Button (Toggles Options) */}
        {!showNukeOptions ? (
          <button 
            onClick={() => setShowNukeOptions(true)}
            disabled={loading}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-900 border border-red-800 rounded-md text-xs font-bold text-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Nuke Database...
          </button>
        ) : (
          <div className="space-y-2 p-2 bg-red-950/30 rounded border border-red-900/50 animate-in slide-in-from-top-2">
            <p className="text-[10px] text-red-300 font-bold uppercase tracking-wider mb-1">Select Data to Clear:</p>
            
            <button 
              onClick={() => handleClear({ properties: true, users: false })}
              className="w-full text-left px-2 py-1.5 hover:bg-red-900/50 rounded text-xs text-red-100 flex items-center justify-between"
            >
              Properties Only <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <button 
              onClick={() => handleClear({ properties: false, users: true })}
              className="w-full text-left px-2 py-1.5 hover:bg-red-900/50 rounded text-xs text-red-100 flex items-center justify-between"
            >
              Users Only <ChevronRight className="w-3 h-3 opacity-50" />
            </button>
            
            {/* NEW BUTTON: Nuke All Documents */}
            <button 
              onClick={() => handleClear({ properties: false, users: false, documents: true })}
              className="w-full text-left px-2 py-1.5 hover:bg-red-900/50 rounded text-xs text-red-100 flex items-center justify-between"
            >
              All Documents Only <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            {/* UPDATED BUTTON: NUKE EVERYTHING (includes documents: true) */}
            <button 
              onClick={() => handleClear({ properties: true, users: true, documents: true })}
              className="w-full text-left px-2 py-1.5 bg-red-600 hover:bg-red-500 rounded text-xs text-white font-bold flex items-center justify-between shadow-sm mt-1"
            >
              NUKE EVERYTHING <Trash2 className="w-3 h-3" />
            </button>

            <button 
              onClick={() => setShowNukeOptions(false)}
              className="w-full text-center py-1 text-[10px] text-slate-400 hover:text-white mt-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      <p className="mt-3 text-[10px] text-slate-500 text-center">
        Use this to reset data structure for RBAC testing.
      </p>
    </div>
  );
}