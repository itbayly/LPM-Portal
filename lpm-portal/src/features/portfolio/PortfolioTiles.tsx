import { Building2, MapPin, ArrowRight, AlertCircle, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Property } from '../../dataModel';

interface PortfolioTilesProps {
  data: Property[];
  onCardClick: (property: Property) => void;
  onAddProperty: () => void;
}

export default function PortfolioTiles({ data, onCardClick, onAddProperty }: PortfolioTilesProps) {

  // --- HELPER: DETERMINE DOT COLOR ---
  const getHealthStatus = (status: string) => {
    // RED: Critical Action Needed
    if ([
      'missing_data', 
      'critical', 
      'critical_action_required', 
      'cancellation_window_open',
      'no_service_contract',
      'service_contract_needed'
    ].includes(status)) {
      return { color: 'bg-red-500', shadow: 'shadow-red-500/50', icon: AlertCircle, label: 'Action Required' };
    }
    
    // YELLOW: Warning / Review
    if ([
      'notice_due_soon', 
      'warning', 
      'pending_review',
      'pending_rpm_review'
    ].includes(status)) {
      return { color: 'bg-yellow-500', shadow: 'shadow-yellow-500/50', icon: AlertTriangle, label: 'Review Needed' };
    }

    // GREEN: Good
    return { color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50', icon: CheckCircle2, label: 'Operational' };
  };

  // --- EMPTY STATE: HERO VIEW ---
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in zoom-in-95 duration-500">
        <div className="glass-panel p-12 rounded-2xl text-center max-w-lg border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden group">
          
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-brand/10 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-white/10">
            <Building2 className="w-10 h-10 text-brand dark:text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-2">
            Set up your first property
          </h2>
          
          <p className="text-text-secondary dark:text-slate-400 mb-8 leading-relaxed">
            Your portfolio is currently empty. Add your first building to unlock the Command Center and start tracking contracts.
          </p>

          <button 
            onClick={onAddProperty}
            className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-brand/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Add First Asset
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD GRID STATE ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {data.map((prop) => {
        const health = getHealthStatus(prop.status);
        const monthlySpend = prop.vendor?.currentPrice || 0;
        const activeContracts = prop.vendor?.name ? 1 : 0; 

        return (
          <div 
            key={prop.id}
            onClick={() => onCardClick(prop)}
            className="glass-panel p-0 rounded-xl cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden flex flex-col h-[220px]"
          >
            {/* 1. STATUS STRIP (Top) */}
            <div className="p-5 flex justify-between items-start relative z-10">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-white dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 flex items-center justify-center shadow-sm">
                <Building2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>

              <div className="flex items-center gap-2 bg-white/50 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 dark:border-white/5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">
                  {health.label}
                </span>
                <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", health.color, health.shadow)} />
              </div>
            </div>

            {/* 2. VITALS (Middle) */}
            <div className="px-5 flex-1">
              <h3 className="text-lg font-bold text-text-primary dark:text-white truncate pr-4 group-hover:text-brand dark:group-hover:text-blue-400 transition-colors">
                {prop.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 opacity-70" />
                <span className="truncate">{prop.address}, {prop.city}</span>
              </div>
            </div>

            {/* 3. METRICS FOOTER (Bottom) */}
            <div className="px-5 py-4 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between mt-auto">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 block mb-0.5">
                  Contracts
                </span>
                <span className="text-sm font-medium text-text-primary dark:text-white">
                  {activeContracts} Active
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 block mb-0.5">
                  Monthly
                </span>
                <span className="text-sm font-mono font-bold text-text-primary dark:text-white">
                  ${monthlySpend.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Hover Effect: Glow Blob */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-brand/10 dark:bg-blue-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        );
      })}

      {/* QUICK ADD BUTTON (Grid Slot) */}
      <button 
        onClick={onAddProperty}
        className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-center p-6 opacity-60 hover:opacity-100 hover:border-brand/30 dark:hover:border-blue-400/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all h-[220px] group"
      >
        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
          <Plus className="w-6 h-6 text-text-secondary dark:text-slate-500 group-hover:text-brand dark:group-hover:text-blue-400" />
        </div>
        <span className="text-sm font-bold text-text-secondary dark:text-slate-500 group-hover:text-text-primary dark:group-hover:text-white">Add Another Asset</span>
      </button>
    </div>
  );
}