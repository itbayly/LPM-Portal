import { useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Property } from '../../dataModel';

interface FilterBarProps {
  properties: Property[]; // The full dataset to derive options from
  filters: {
    state: string;
    city: string;
    vendor: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export default function FilterBar({ properties, filters, onFilterChange, onClear }: FilterBarProps) {
  
  // 1. DYNAMIC OPTION GENERATION
  const options = useMemo(() => {
    // Get all unique States
    const states = Array.from(new Set(properties.map(p => p.state))).sort();
    
    // Get Cities (filtered by selected State if active)
    const cities = Array.from(new Set(
      properties
        .filter(p => !filters.state || p.state === filters.state)
        .map(p => p.city)
    )).sort();

    // Get Vendors
    const vendors = Array.from(new Set(properties.map(p => p.vendor.name))).sort();

    return { states, cities, vendors };
  }, [properties, filters.state]);

  const Select = ({ label, value, options, field, disabled }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onFilterChange(field, e.target.value)}
        className={cn(
          "h-9 border rounded-sm text-sm px-2 min-w-[140px] outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all",
          disabled ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white border-border text-text-primary"
        )}
      >
        <option value="">All {label}s</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex items-end gap-md p-md bg-slate-50 border border-border rounded-md mb-lg">
      <div className="p-2 bg-white rounded-full border border-border mr-2">
        <Filter className="w-4 h-4 text-text-secondary" />
      </div>
      
      <Select 
        label="State" 
        value={filters.state} 
        options={options.states} 
        field="state" 
        disabled={false} 
      />
      
      <Select 
        label="City" 
        value={filters.city} 
        options={options.cities} 
        field="city" 
        disabled={!filters.state} 
      />

      <Select 
        label="Vendor" 
        value={filters.vendor} 
        options={options.vendors} 
        field="vendor" 
        disabled={false} 
      />

      {(filters.state || filters.city || filters.vendor) && (
        <button 
          onClick={onClear}
          className="ml-auto text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 h-9 px-3 hover:bg-red-50 rounded-sm transition-colors"
        >
          <X className="w-3 h-3" /> Clear All
        </button>
      )}
    </div>
  );
}
