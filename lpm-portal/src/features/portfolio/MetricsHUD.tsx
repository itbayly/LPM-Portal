import React from 'react';
import { Building2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Property, FilterType } from '../../dataModel'; // Imported from central data model

interface MetricsHUDProps {
  properties: Property[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function MetricsHUD({ properties, activeFilter, onFilterChange }: MetricsHUDProps) {
  // 1. Calculate Live Metrics
  const totalSites = properties.length;
  const critical = properties.filter(p => p.status === 'critical').length;
  const active = properties.filter(p => p.status === 'active').length;
  const missingData = properties.filter(p => p.status === 'missing_data').length;

  // 2. Helper for Interactive Card
  const StatCard = ({ label, value, icon: Icon, colorClass, bgClass, filterType }: any) => {
    const isActive = activeFilter === filterType;
    
    return (
      <button 
        onClick={() => onFilterChange(filterType)}
        className={cn(
          "flex-1 bg-surface rounded-md shadow-lvl1 border p-md flex items-center gap-md text-left transition-all duration-200",
          "hover:shadow-lvl2 hover:-translate-y-0.5",
          isActive ? "border-brand ring-1 ring-brand bg-blue-50/30" : "border-border"
        )}
      >
        <div className={cn("p-3 rounded-full", bgClass)}>
          <Icon className={cn("w-6 h-6", colorClass)} />
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{value}</p>
          <p className={cn("text-xs font-semibold uppercase tracking-wide", isActive ? "text-brand" : "text-text-secondary")}>
            {label}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="flex gap-lg mb-lg">
      <StatCard 
        label="Total Locations" 
        value={totalSites} 
        icon={Building2} 
        colorClass="text-brand" 
        bgClass="bg-blue-50"
        filterType="all"
      />
      <StatCard 
        label="Operational (Active)" 
        value={active} 
        icon={CheckCircle2} 
        colorClass="text-status-active" 
        bgClass="bg-status-activeBg"
        filterType="active"
      />
      <StatCard 
        label="Critical Action" 
        value={critical} 
        icon={AlertCircle} 
        colorClass="text-status-critical" 
        bgClass="bg-status-criticalBg"
        filterType="critical"
      />
      <StatCard 
        label="Data Missing" 
        value={missingData} 
        icon={Clock} 
        colorClass="text-slate-500" 
        bgClass="bg-slate-100"
        filterType="missing_data"
      />
    </div>
  );
}