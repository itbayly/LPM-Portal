import { 
  Building2, Thermometer, ShieldCheck, Zap, Lock, 
  ArrowUpRight, SearchX
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Property } from '../../dataModel';

interface MatrixViewProps {
  data: Property[];
  onRowClick: (property: Property) => void;
  isFiltered?: boolean;
}

// DEFINING THE COLUMNS
const COLUMNS = [
  { id: 'elevator', label: 'Vertical', icon: Building2 },
  { id: 'hvac', label: 'HVAC', icon: Thermometer },
  { id: 'fire', label: 'Fire Safety', icon: ShieldCheck },
  { id: 'elec', label: 'Utilities', icon: Zap },
  { id: 'security', label: 'Access', icon: Lock },
];

export default function MatrixView({ data, onRowClick, isFiltered }: MatrixViewProps) {
  
  // --- HELPER: MOCK STATUS GENERATOR ---
  // In real app, this pulls from prop.contracts array
  const getCellStatus = (propId: string, colId: string, realStatus: string) => {
    // 1. Use real data for Elevators
    if (colId === 'elevator') {
      if (['active_contract', 'on_national_agreement', 'active'].includes(realStatus)) return 'good';
      if (['notice_due_soon', 'warning', 'pending_review'].includes(realStatus)) return 'warning';
      return 'critical'; // missing, etc.
    }

    // 2. Mock others deterministically based on ID characters
    const charCode = propId.charCodeAt(propId.length - 1) + colId.charCodeAt(0);
    if (charCode % 5 === 0) return 'critical'; // 20% chance of critical
    if (charCode % 7 === 0) return 'warning';  // ~14% chance of warning
    if (charCode % 3 === 0) return 'empty';    // ~33% chance of empty
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
      case 'warning': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]';
      case 'critical': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
      default: return 'bg-slate-300 dark:bg-slate-700'; // Empty
    }
  };

  if (data.length === 0) {
    if (isFiltered) {
      return (
        <div className="w-full glass-panel rounded-xl overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 items-center justify-center">
           <div className="flex flex-col items-center opacity-50">
              <SearchX className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-text-primary dark:text-white">No Matching Results</p>
           </div>
        </div>
      );
    }
    // Zero state handled by parent if needed, or fallback here
    return null; 
  }

  return (
    <div className="w-full glass-panel rounded-xl overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="overflow-auto flex-1 relative scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
        <table className="w-full text-left border-collapse">
          
          {/* HEADER */}
          <thead className="sticky top-0 z-20 bg-[#F2F4F6] dark:bg-[#0A0A0C] shadow-sm ring-1 ring-black/5 dark:ring-white/5">
            <tr>
              <th className="py-4 px-4 min-w-[200px] text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 border-b border-black/5 dark:border-white/5">
                Asset Identity
              </th>
              {COLUMNS.map(col => (
                <th key={col.id} className="py-4 px-2 text-center w-[120px] border-b border-black/5 dark:border-white/5 group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="flex flex-col items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <col.icon className="w-4 h-4 text-brand dark:text-blue-400" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-primary dark:text-white">
                      {col.label}
                    </span>
                  </div>
                </th>
              ))}
              <th className="py-4 px-4 w-[60px] border-b border-black/5 dark:border-white/5"></th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {data.map((prop) => (
              <tr 
                key={prop.id} 
                onClick={() => onRowClick(prop)}
                className="group cursor-pointer hover:bg-brand/5 dark:hover:bg-white/5 transition-colors duration-200"
              >
                {/* Identity Column */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary dark:text-white group-hover:text-brand dark:group-hover:text-blue-400 transition-colors">
                      {prop.name}
                    </span>
                    <span className="text-[10px] text-text-secondary dark:text-slate-500 font-mono truncate max-w-[180px]">
                      {prop.address}
                    </span>
                  </div>
                </td>

                {/* Matrix Columns */}
                {COLUMNS.map(col => {
                  const status = getCellStatus(prop.id, col.id, prop.status);
                  return (
                    <td key={col.id} className="py-3 px-2 text-center">
                      <div className="flex justify-center group/cell relative">
                        {/* THE STATUS DOT */}
                        <div className={cn(
                          "w-3 h-3 rounded-full transition-all duration-300 group-hover/cell:scale-125",
                          getStatusColor(status)
                        )} />

                        {/* Hover Tooltip (Only if not empty) */}
                        {status !== 'empty' && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 bg-black/90 dark:bg-white/90 backdrop-blur-md p-2 rounded-lg opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                            <p className="text-[9px] font-bold text-white dark:text-black uppercase tracking-wider mb-0.5">
                              {col.label}
                            </p>
                            <p className="text-[10px] text-slate-300 dark:text-slate-600 truncate">
                              {col.id === 'elevator' ? prop.vendor?.name : 'Vendor TBD'}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}

                {/* Action Column */}
                <td className="py-3 px-4 text-center">
                  <button className="text-slate-400 hover:text-brand dark:hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}