import { useState } from 'react';
import { useProperties } from '../../hooks/useProperties';
import { Trash2, Database, ShieldAlert, X } from 'lucide-react';

export default function AdminTools() {
  const { seedDatabase, clearDatabase, loading } = useProperties();
  const [isOpen, setIsOpen] = useState(true); // Default open for visibility

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

        <button 
          onClick={clearDatabase}
          disabled={loading}
          className="w-full flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-900 border border-red-800 rounded-md text-xs font-bold text-red-100 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Nuke Database (Clear All)
        </button>
      </div>
      
      <p className="mt-3 text-[10px] text-slate-500 text-center">
        Use this to reset data structure for RBAC testing.
      </p>
    </div>
  );
}