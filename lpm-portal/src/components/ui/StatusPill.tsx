import React from 'react';
import { cn } from '../../lib/utils';
import type { PropertyStatus } from '../../dataModel'; // Note the "type" keyword

interface StatusPillProps {
  status: PropertyStatus;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  
  const getStyle = (s: PropertyStatus) => {
    switch (s) {
      case 'active':
        return "bg-status-activeBg text-status-activeSx border-green-200";
      case 'warning':
        return "bg-status-warningBg text-status-warning border-blue-200";
      case 'critical':
        return "bg-status-criticalBg text-status-criticalSx border-red-200";
      case 'missing_data':
      default:
        return "bg-gray-100 text-gray-500Sx border-gray-200";
    }
  };

  const getLabel = (s: PropertyStatus) => {
    switch (s) {
      case 'active': return "Active";
      case 'warning': return "Review";
      case 'critical': return "Critical";
      case 'missing_data': return "Missing Data";
      default: return "Unknown";
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-boldSx border",
      getStyle(status)
    )}>
      <span className={cn(
        "w-2 h-2 rounded-full mr-2",
        status === 'active' && "bg-status-active",
        status === 'warning' && "bg-status-warning",
        status === 'critical' && "bg-status-critical",
        status === 'missing_data' && "bg-gray-400"
      )} />
      {getLabel(status)}
    </span>
  );
};