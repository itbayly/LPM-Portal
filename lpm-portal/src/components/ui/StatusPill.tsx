import { cn } from '../../lib/utils';
import type { PropertyStatus } from '../../dataModel';

interface StatusPillProps {
  status: PropertyStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  
  const getStatusConfig = (s: PropertyStatus) => {
    switch (s) {
      case 'active':
        return {
          label: 'Active',
          style: 'bg-status-activeBg text-status-active border-green-200'
        };
      case 'warning':
        return {
          label: 'Review Needed',
          style: 'bg-status-warningBg text-status-warning border-yellow-200'
        };
      case 'critical':
        return {
          label: 'Critical',
          style: 'bg-status-criticalBg text-status-critical border-red-200'
        };
      case 'missing_data':
        return {
          label: 'Missing Data',
          style: 'bg-slate-100 text-slate-600 border-slate-200'
        };
      case 'no_elevators':
        return {
          label: 'No Elevators',
          style: 'bg-slate-200 text-slate-600 border-slate-300'
        };
      case 'pending_rpm_review':
        return {
          label: 'Pending Review',
          style: 'bg-amber-100 text-amber-700 border-amber-200'
        };
      case 'no_service_contract':
        return {
          label: 'No Contract',
          style: 'bg-status-criticalBg text-status-critical border-red-200'
        };
      default:
        return {
          label: 'Unknown',
          style: 'bg-gray-100 text-gray-500'
        };
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