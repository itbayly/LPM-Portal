import { Building2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Property, FilterType } from '../../dataModel';

interface MetricsHUDProps {
  properties: Property[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function MetricsHUD({ properties, activeFilter, onFilterChange }: MetricsHUDProps) {
  // Calculate Counts
  const total = properties.length;
  const critical = properties.filter(p => p.status === 'critical').length;
  const active = properties.filter(p => p.status === 'active').length;
  const missing = properties.filter(p => p.status === 'missing_data').length;

  const KPI = ({ label, value, icon: Icon, color, filter }: any) => {
    const isActive = activeFilter === filter;
    
    return (
      <button
        onClick={() => onFilterChange(filter)}
        className={cn(
          // Added 'whitespace-nowrap' to prevent long labels from breaking the layout
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
        label="Cancellation Notice Due" 
        value={critical} 
        icon={AlertCircle} 
        color="text-status-critical" 
        filter="critical" 
      />
      <Divider />
      <KPI 
        label="Missing Data" 
        value={missing} 
        icon={Clock} 
        color="text-slate-500" 
        filter="missing_data" 
      />
    </div>
  );
}
