import { Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Property, FilterType } from '../../dataModel';

interface MetricsHUDProps {
  properties: Property[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function MetricsHUD({ properties, activeFilter, onFilterChange }: MetricsHUDProps) {
  // 1. Calculate Counts
  const total = properties.length;
  
  // Count "On National Agreement"
  const nationalCount = properties.filter(p => p.status === 'on_national_agreement').length;
  
  // Count "Action Required"
  const actionRequiredCount = properties.filter(p => 
    [
      'missing_data', 
      'pending_review', 
      'critical_action_required', 
      'cancellation_window_open', 
      'add_to_msa', 
      'service_contract_needed',
      'critical',
      'pending_rpm_review',
      'no_service_contract'
    ].includes(p.status)
  ).length;

  const KPI = ({ label, value, icon: Icon, activeColor, filter }: any) => {
    const isActive = activeFilter === filter;
    
    return (
      <button
        onClick={() => onFilterChange(filter)}
        className={cn(
          "group relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden",
          isActive 
            ? "bg-black/5 dark:bg-white/10 shadow-inner" 
            : "hover:bg-black/5 dark:hover:bg-white/5"
        )}
      >
        {/* Active Indicator Line */}
        {isActive && (
          <div className={cn("absolute left-0 top-2 bottom-2 w-1 rounded-r-full", activeColor)} />
        )}

        <div className={cn(
          "p-1.5 rounded-md transition-colors", 
          isActive ? "bg-white dark:bg-white/10 shadow-sm" : "bg-transparent group-hover:bg-white/50 dark:group-hover:bg-white/5"
        )}>
           <Icon className={cn("w-4 h-4", isActive ? "text-text-primary dark:text-white" : "text-text-secondary dark:text-slate-400")} />
        </div>
        
        <div className="flex flex-col items-start leading-none">
          <span className={cn(
            "text-[10px] font-sans font-bold uppercase tracking-widest mb-1", 
            isActive ? "text-text-primary dark:text-white" : "text-text-secondary dark:text-slate-500"
          )}>
            {label}
          </span>
          <span className={cn(
            "text-sm font-bold font-sans tabular-nums",
            isActive ? "text-text-primary dark:text-white" : "text-text-secondary dark:text-slate-400"
          )}>
            {value}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-white/40 dark:bg-[#0A0A0C]/40 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-xl shadow-glass dark:shadow-glass-dark">
      <KPI 
        label="Total Assets" 
        value={total} 
        icon={Building2} 
        activeColor="bg-brand dark:bg-blue-400" 
        filter="all" 
      />
      
      <div className="w-[1px] h-8 bg-black/5 dark:bg-white/5" />
      
      <KPI 
        label="National" 
        value={nationalCount} 
        icon={CheckCircle2} 
        activeColor="bg-green-500" 
        filter="on_national_agreement" 
      />
      
      <div className="w-[1px] h-8 bg-black/5 dark:bg-white/5" />
      
      <KPI 
        label="Action Reqd" 
        value={actionRequiredCount} 
        icon={AlertCircle} 
        activeColor="bg-red-500" 
        filter="action_required" 
      />
    </div>
  );
}