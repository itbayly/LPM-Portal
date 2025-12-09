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
  
  // Count "Action Required" (Sum of all urgent statuses)
  // We include legacy statuses here just in case data hasn't fully migrated yet
  const actionRequiredCount = properties.filter(p => 
    [
      // New Statuses
      'missing_data', 
      'pending_review', 
      'critical_action_required', 
      'cancellation_window_open', 
      'add_to_msa', 
      'service_contract_needed',
      // Legacy Fallbacks
      'critical',
      'pending_rpm_review',
      'no_service_contract'
    ].includes(p.status)
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
    <div className="flex items-center bg-slate-50 border border-border rounded-md shadow-sm h-12 px-2 w-fit">
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
        value={nationalCount} 
        icon={CheckCircle2} 
        color="text-status-active" 
        filter="on_national_agreement" 
      />
      <Divider />
      <KPI 
        label="Action Required" 
        value={actionRequiredCount} 
        icon={AlertCircle} 
        color="text-status-critical" 
        filter="action_required" 
      />
    </div>
  );
}
