import { cn } from '../../lib/utils';
import type { PropertyStatus } from '../../dataModel';

interface StatusPillProps {
  status: PropertyStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  
  const getStatusConfig = (s: PropertyStatus) => {
    switch (s) {
      // --- ACTION REQUIRED ---
      case 'missing_data':
        return { label: 'Missing Data', style: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'pending_review':
        return { label: 'Pending Review', style: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'critical_action_required':
        return { label: 'Critical Action Required', style: 'bg-red-100 text-red-700 border-red-200 font-bold' };
      case 'cancellation_window_open':
        return { label: 'Cancellation Window Open', style: 'bg-red-50 text-red-600 border-red-200 border-dashed animate-pulse' };
      case 'add_to_msa':
        return { label: 'Add to MSA', style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case 'service_contract_needed':
        return { label: 'Service Contract Needed', style: 'bg-rose-100 text-rose-700 border-rose-200' };

      // --- NO ACTION / INFO ---
      case 'notice_due_soon':
        return { label: 'Notice Due Soon', style: 'bg-yellow-50 text-yellow-600 border-yellow-200' };
      case 'active_contract':
        return { label: 'Active Contract', style: 'bg-blue-50 text-blue-700 border-blue-200' }; // Changed to Blue
      case 'on_national_agreement':
        return { label: 'On National Agreement', style: 'bg-green-100 text-green-700 border-green-200' }; // Green
      case 'no_elevators':
        return { label: 'No Elevators', style: 'bg-slate-50 text-slate-400 border-slate-200' };
        
      default:
        return { label: 'Unknown', style: 'bg-gray-100 text-gray-500' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize whitespace-nowrap",
        config.style,
        className
      )}
    >
      {config.label}
    </span>
  );
}
