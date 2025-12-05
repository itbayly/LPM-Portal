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
  const active = properties.filter(p => p.status === 'active').length;
  
  // "Action Required" = Critical + Missing Data + Review (Warning)
  const actionRequired = properties.filter(p => 
    ['critical', 'missing_data', 'warning'].includes(p.status)
  ).length;

  const KPI = ({ label, value, icon: Icon, color, filter }: any) => {
    const isActive = activeFilter === filter;
    
    return (
      <button
        onClick={() => onFilterChange(filter)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all hover:bg-slate-100 border border-transparent whitespace-nowrap",
          isActive ? "bg-white border-border shadow-sm" : "opacity-60 hover:opacity-100"
        )}
      >
        <div className={cn("p-1 rounded-full", isActive ? "bg-slate-100" : "bg-transparent")}>
           <Icon className={cn("w-3.5 h-3.5", color)} />
        </div>
        <span className={cn("text-xs font-semibold uppercase tracking-wide", isActive ? "text-text-primary" : "text-text-secondary")}>
          {label}: <span className={cn("ml-1 font-bold tabular-nums text-sm", color)}>{value}</span>
        </span>
      </button>
    );
  };

  const Divider = () => <div className="h-4 w-[1px] bg-border mx-1" />;

  return (
    <div className="flex items-center bg-slate-50 border border-border rounded-md shadow-sm h-12 px-2 mb-4 w-fit">
      <KPI 
        label="Full Portfolio" 
        value={total} 
        icon={Building2} 
        color="text-brand" 
        filter="all" 
      />
      <Divider />
      <KPI 
        label="On National Agreement" 
        value={active} 
        icon={CheckCircle2} 
        color="text-status-active" 
        filter="active" 
      />
      <Divider />
      <KPI 
        label="Action Required" 
        value={actionRequired} 
        icon={AlertCircle} 
        color="text-status-critical" 
        filter="action_required" 
      />
    </div>
  );
}
