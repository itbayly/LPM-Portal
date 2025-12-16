import { cn } from '../../lib/utils';
import type { PropertyStatus } from '../../dataModel';

interface StatusPillProps {
  status: PropertyStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  
  const getStatusConfig = (s: PropertyStatus) => {
    switch (s) {
      // --- ACTION REQUIRED (Red/Orange/Rose) ---
      case 'critical_action_required':
      case 'critical': 
        return { label: 'Critical Action', style: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse' };
      case 'cancellation_window_open':
        return { label: 'Window Open', style: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' };
      case 'service_contract_needed':
      case 'no_service_contract': 
        return { label: 'No Contract', style: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
      case 'pending_review':
      case 'pending_rpm_review': 
        return { label: 'Pending Review', style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'missing_data':
        return { label: 'Missing Data', style: 'bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20 border-dashed' };

      // --- INFORMATIONAL (Blue/Indigo) ---
      case 'add_to_msa':
        return { label: 'Add to MSA', style: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
      case 'notice_due_soon':
      case 'warning': 
        return { label: 'Notice Soon', style: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };

      // --- GOOD / NEUTRAL (Green/Slate) ---
      case 'active_contract':
      case 'active': 
        return { label: 'Active', style: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' };
      case 'on_national_agreement':
        return { label: 'National Agmt', style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'no_elevators':
        return { label: 'No Assets', style: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' };
        
      default:
        return { label: 'Unknown', style: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className={cn(
        "px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border whitespace-nowrap backdrop-blur-sm",
        config.style,
        className
      )}
    >
      {config.label}
    </span>
  );
}