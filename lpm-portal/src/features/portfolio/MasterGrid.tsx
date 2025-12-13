import { useState, useMemo, useRef, useEffect } from 'react';
import { StatusPill } from '../../components/ui/StatusPill';
import { StarRating } from '../../components/ui/StarRating';
import { 
  ChevronDown, 
  ArrowUpAZ, 
  ArrowDownZA, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Property } from '../../dataModel';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface MasterGridProps {
  onRowClick: (property: Property) => void;
  data?: Property[]; 
}

type SortKey = keyof Property | 'vendor.name' | 'vendor.rating' | 'vendor.currentPrice';

type SortState = {
  key: SortKey;
  direction: 'asc' | 'desc';
};

// --- STATUS MAPPING ---
const STATUS_LABELS: Record<string, string> = {
  'active': 'Active',
  'active_contract': 'Active Contract',
  'warning': 'Review Needed',
  'notice_due_soon': 'Notice Due Soon',
  'critical': 'Critical',
  'critical_action_required': 'Critical Action',
  'missing_data': 'Missing Data',
  'no_elevators': 'No Elevators',
  'pending_review': 'Pending Review',
  'pending_rpm_review': 'Pending Review',
  'no_service_contract': 'No Contract',
  'service_contract_needed': 'No Contract',
  'cancellation_window_open': 'Window Open',
  'add_to_msa': 'Add to MSA',
  'on_national_agreement': 'National Agmt'
};

// --- HELPERS ---
const getValue = (item: Property, path: string) => {
  if (path.includes('.')) {
    const [obj, key] = path.split('.');
    return (item as any)[obj]?.[key];
  }
  return (item as any)[path];
};

const getUniqueValues = (data: Property[], key: string) => {
  const values = new Set<string>();
  data.forEach(item => {
    const val = getValue(item, key);
    if (val !== undefined && val !== null) values.add(String(val));
  });
  return Array.from(values).sort();
};

const formatValue = (key: string, value: string) => {
  if (key === 'status') {
    return STATUS_LABELS[value] || value.replace(/_/g, ' ');
  }
  return value;
};

export default function MasterGrid({ onRowClick, data = [] }: MasterGridProps) {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<SortState | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [openMenuColumn, setOpenMenuColumn] = useState<string | null>(null);

  // --- FILTERING ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (item.status === 'no_elevators') return false; // Default Hide
      return Object.entries(activeFilters).every(([key, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        const itemValue = String(getValue(item, key));
        return selectedValues.includes(itemValue);
      });
    });
  }, [data, activeFilters]);

  // --- SORTING ---
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = getValue(a, String(sortConfig.key));
      const bValue = getValue(b, String(sortConfig.key));
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // --- HANDLERS ---
  const handleSort = (key: SortKey, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setOpenMenuColumn(null);
  };

  const applyFilter = (key: string, selectedValues: string[] | null) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (selectedValues === null) delete next[key];
      else next[key] = selectedValues;
      return next;
    });
    setOpenMenuColumn(null);
    setCurrentPage(1);
  };

  // --- SUB-COMPONENT: HEADER MENU (Glassmorphic) ---
  const HeaderMenu = ({ columnKey, options, onClose }: { columnKey: string, options: string[], onClose: () => void }) => {
    const initialSelection = activeFilters[columnKey] || options;
    const [selected, setSelected] = useState<string[]>(initialSelection);
    const [search, setSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const filteredOptions = options.filter(opt => {
      const displayVal = formatValue(columnKey, opt).toLowerCase();
      return displayVal.includes(search.toLowerCase());
    });
    
    const isAllSelected = filteredOptions.every(opt => selected.includes(opt));

    const toggleOption = (opt: string) => {
      if (selected.includes(opt)) setSelected(selected.filter(s => s !== opt));
      else setSelected([...selected, opt]);
    };

    const toggleSelectAll = () => {
      if (isAllSelected) setSelected(selected.filter(s => !filteredOptions.includes(s)));
      else {
        const newSelected = new Set([...selected, ...filteredOptions]);
        setSelected(Array.from(newSelected));
      }
    };

    return (
      <div 
        className="absolute top-full left-0 mt-2 w-64 bg-white/90 dark:bg-[#0A0A0C]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-md shadow-2xl z-50 text-sm flex flex-col animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sort Section */}
        <div className="p-2 border-b border-black/5 dark:border-white/5 space-y-1">
          <button 
            onClick={() => handleSort(columnKey as SortKey, 'asc')}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm text-text-primary dark:text-white transition-colors"
          >
            <ArrowUpAZ className="w-4 h-4 text-text-secondary dark:text-slate-400" />
            <span>Sort Ascending</span>
          </button>
          <button 
            onClick={() => handleSort(columnKey as SortKey, 'desc')}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm text-text-primary dark:text-white transition-colors"
          >
            <ArrowDownZA className="w-4 h-4 text-text-secondary dark:text-slate-400" />
            <span>Sort Descending</span>
          </button>
        </div>

        {/* Search Slot */}
        <div className="p-3 border-b border-black/5 dark:border-white/5">
          <div className="relative bg-black/5 dark:bg-white/5 rounded-sm">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter..." 
              className="w-full pl-8 pr-3 py-2 bg-transparent text-xs text-text-primary dark:text-white font-mono placeholder:text-slate-400 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              autoFocus
            />
            {/* Animated Bottom Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: isSearchFocused ? "100%" : "0%" }}
                className="h-full mx-auto bg-brand dark:bg-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Options List */}
        <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <label className="flex items-center gap-2 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-sm group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isAllSelected ? 'bg-brand border-brand dark:bg-cyan-500 dark:border-cyan-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-brand dark:group-hover:border-cyan-400'}`}>
              {isAllSelected && <div className="w-2 h-2 bg-white rounded-[1px]" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden"
              checked={isAllSelected}
              onChange={toggleSelectAll}
            />
            <span className="font-mono text-[10px] uppercase tracking-wide text-text-secondary dark:text-slate-400 group-hover:text-text-primary dark:group-hover:text-white">Select All</span>
          </label>
          
          {filteredOptions.map(opt => {
            const isChecked = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-sm group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-brand border-brand dark:bg-cyan-500 dark:border-cyan-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-brand dark:group-hover:border-cyan-400'}`}>
                  {isChecked && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={isChecked}
                  onChange={() => toggleOption(opt)}
                />
                <span className="text-xs text-text-primary dark:text-slate-300 truncate">{formatValue(columnKey, opt)}</span>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-black/5 dark:border-white/5 flex justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <button 
            onClick={() => applyFilter(columnKey, null)} 
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={() => applyFilter(columnKey, selected.length === options.length ? null : selected)}
            className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white bg-brand dark:bg-cyan-600 hover:bg-brand-dark dark:hover:bg-cyan-500 rounded-sm shadow-sm transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  // --- SUB-COMPONENT: HEADER CELL ---
  const HeaderCell = ({ label, columnKey, width }: { label: string, columnKey: string, width?: string }) => {
    const isSorted = sortConfig?.key === columnKey;
    const isFiltered = activeFilters[columnKey] !== undefined;
    const isOpen = openMenuColumn === columnKey;
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          if (isOpen) setOpenMenuColumn(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
      <th 
        className={cn(
          "py-3 px-4 text-left border-b border-black/5 dark:border-white/5 select-none relative group cursor-pointer transition-colors", 
          width,
          (isSorted || isFiltered || isOpen) ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
        )}
        onClick={() => setOpenMenuColumn(isOpen ? null : columnKey)}
      >
        <div className="flex items-center justify-between gap-2" ref={menuRef}>
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary dark:text-slate-400 opacity-80 group-hover:opacity-100 transition-opacity truncate">
            {label}
          </span>
          
          <div className="flex items-center gap-1">
            {isFiltered && <div className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-cyan-400" />}
            
            {isSorted && (
              sortConfig?.direction === 'asc' 
                ? <ArrowUp className="w-3 h-3 text-brand dark:text-cyan-400" /> 
                : <ArrowDown className="w-3 h-3 text-brand dark:text-cyan-400" />
            )}

            <div className={cn(
              "transition-opacity duration-200",
              isOpen || isSorted || isFiltered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <ChevronDown className="w-3 h-3 text-text-secondary dark:text-slate-500" />
            </div>
          </div>

          {isOpen && (
            <HeaderMenu 
              columnKey={columnKey} 
              options={getUniqueValues(data, columnKey)} 
              onClose={() => setOpenMenuColumn(null)} 
            />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="w-full bg-white/50 dark:bg-[#0A0A0C]/50 backdrop-blur-md rounded-lg shadow-sm border border-white/20 dark:border-white/10 overflow-hidden flex flex-col h-full transition-colors duration-300">
      
      {/* GRID BODY */}
      <div className="overflow-auto flex-1 relative min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20 bg-[#F4F5F7] dark:bg-[#0A0A0C] shadow-sm">
            <tr>
              <HeaderCell label="Status" columnKey="status" width="w-[140px]" />
              <HeaderCell label="Property Name" columnKey="name" width="min-w-[180px]" />
              <HeaderCell label="Address" columnKey="address" width="min-w-[140px]" />
              <HeaderCell label="City" columnKey="city" />
              <HeaderCell label="State" columnKey="state" />
              <HeaderCell label="Zip" columnKey="zip" />
              <HeaderCell label="Units" columnKey="unitCount" />
              <HeaderCell label="Vendor" columnKey="vendor.name" />
              <HeaderCell label="Rating" columnKey="vendor.rating" width="w-[120px]" />
              <HeaderCell label="Price/Mo" columnKey="vendor.currentPrice" />
              <HeaderCell label="End Date" columnKey="contractEndDate" />
              <HeaderCell label="Notice" columnKey="cancellationWindow" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {currentData.map((prop) => (
              <tr 
                key={prop.id} 
                onClick={() => onRowClick(prop)} 
                className="group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
              >
                <td className="py-3 px-4"><StatusPill status={prop.status} /></td>
                <td className="py-3 px-4 text-xs font-bold text-text-primary dark:text-white group-hover:text-brand dark:group-hover:text-cyan-400 transition-colors">{prop.name}</td>
                <td className="py-3 px-4 text-xs text-text-secondary dark:text-slate-400">{prop.address}</td>
                <td className="py-3 px-4 text-xs text-text-secondary dark:text-slate-400">{prop.city}</td>
                <td className="py-3 px-4 text-xs text-text-secondary dark:text-slate-400">{prop.state}</td>
                <td className="py-3 px-4 text-xs font-mono text-text-secondary dark:text-slate-500">{prop.zip}</td>
                <td className="py-3 px-4 text-xs font-mono text-text-primary dark:text-slate-300 text-center">{prop.unitCount}</td>
                <td className="py-3 px-4 text-xs font-medium text-text-primary dark:text-slate-200">{prop.vendor.name}</td>
                <td className="py-3 px-4"><div className="pointer-events-none scale-75 origin-left"><StarRating value={prop.vendor.rating} readonly /></div></td>
                <td className="py-3 px-4 text-xs font-mono text-text-primary dark:text-white text-right">${prop.vendor.currentPrice.toLocaleString()}</td>
                <td className="py-3 px-4 text-xs font-mono text-text-primary dark:text-slate-300 text-right">{prop.contractEndDate}</td>
                <td className="py-3 px-4 text-xs text-text-secondary dark:text-slate-400">{prop.cancellationWindow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER PAGINATION */}
      <div className="border-t border-black/5 dark:border-white/5 p-3 bg-white/50 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-xs text-text-secondary dark:text-slate-500">
          <span className="uppercase tracking-wide opacity-70">Rows per page:</span>
          <select 
            value={itemsPerPage} 
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
            className="bg-transparent border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs font-mono focus:border-brand dark:focus:border-cyan-500 outline-none text-text-primary dark:text-white cursor-pointer"
          >
            <option value={25} className="text-black">25</option>
            <option value={50} className="text-black">50</option>
            <option value={100} className="text-black">100</option>
          </select>
          <span className="ml-4 tabular-nums">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} <span className="opacity-50 mx-1">/</span> {sortedData.length}
          </span>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)} 
            disabled={currentPage === 1} 
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-text-primary dark:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)} 
            disabled={currentPage === totalPages} 
            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-text-primary dark:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}