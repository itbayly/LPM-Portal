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

interface MasterGridProps {
  onRowClick: (property: Property) => void;
  data?: Property[]; 
}

type SortKey = keyof Property | 'vendor.name' | 'vendor.rating' | 'vendor.currentPrice';

type SortState = {
  key: SortKey;
  direction: 'asc' | 'desc';
};

// --- HELPER FUNCTIONS ---

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

export default function MasterGrid({ onRowClick, data = [] }: MasterGridProps) {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortState | null>(null);

  // Filtering State
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  
  // Menu State
  const [openMenuColumn, setOpenMenuColumn] = useState<string | null>(null);

  // --- 1. FILTERING ENGINE ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Default Filter: Hide "No Elevators" unless explicitly asked for (via future toggle)
      if (item.status === 'no_elevators') return false;

      // Check every active filter
      return Object.entries(activeFilters).every(([key, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        const itemValue = String(getValue(item, key));
        return selectedValues.includes(itemValue);
      });
    });
  }, [data, activeFilters]);

  // --- 2. SORTING ENGINE ---
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

  // --- 3. PAGINATION ENGINE ---
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSort = (key: SortKey, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setOpenMenuColumn(null);
  };

  const applyFilter = (key: string, selectedValues: string[] | null) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (selectedValues === null) {
        delete next[key];
      } else {
        next[key] = selectedValues;
      }
      return next;
    });
    setOpenMenuColumn(null);
    setCurrentPage(1);
  };

  // --- INTERNAL COMPONENT: EXCEL HEADER MENU ---
  const HeaderMenu = ({ columnKey, options, onClose }: { columnKey: string, options: string[], onClose: () => void }) => {
    const initialSelection = activeFilters[columnKey] || options;
    const [selected, setSelected] = useState<string[]>(initialSelection);
    const [search, setSearch] = useState('');

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
    const isAllSelected = filteredOptions.every(opt => selected.includes(opt));

    const toggleOption = (opt: string) => {
      if (selected.includes(opt)) {
        setSelected(selected.filter(s => s !== opt));
      } else {
        setSelected([...selected, opt]);
      }
    };

    const toggleSelectAll = () => {
      if (isAllSelected) {
        setSelected(selected.filter(s => !filteredOptions.includes(s)));
      } else {
        const newSelected = new Set([...selected, ...filteredOptions]);
        setSelected(Array.from(newSelected));
      }
    };

    return (
      <div 
        className="absolute top-full left-0 mt-1 w-64 bg-white border border-border rounded-md shadow-lvl3 z-50 text-sm flex flex-col animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sort Section */}
        <div className="p-2 border-b border-border space-y-1">
          <button 
            onClick={() => handleSort(columnKey as SortKey, 'asc')}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-sm text-text-primary transition-colors"
          >
            <ArrowUpAZ className="w-4 h-4 text-text-secondary" />
            <span>Sort A to Z</span>
          </button>
          <button 
            onClick={() => handleSort(columnKey as SortKey, 'desc')}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-sm text-text-primary transition-colors"
          >
            <ArrowDownZA className="w-4 h-4 text-text-secondary" />
            <span>Sort Z to A</span>
          </button>
        </div>

        {/* Filter Search */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-8 pr-3 py-1.5 border border-border rounded-sm text-xs focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Checkbox List */}
        <div className="max-h-48 overflow-y-auto p-1 bg-slate-50/50">
          <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 cursor-pointer rounded-sm">
            <input 
              type="checkbox" 
              className="rounded border-slate-300 text-brand focus:ring-brand accent-brand"
              checked={isAllSelected}
              onChange={toggleSelectAll}
            />
            <span className="font-medium text-xs">(Select All)</span>
          </label>
          
          {filteredOptions.map(opt => (
            <label key={opt} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 cursor-pointer rounded-sm">
              <input 
                type="checkbox" 
                className="rounded border-slate-300 text-brand focus:ring-brand accent-brand"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
              />
              <span className="text-xs truncate">{opt}</span>
            </label>
          ))}
          
          {filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-xs text-text-secondary text-center italic">No matches</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t border-border flex justify-between bg-white rounded-b-md">
          <button 
            onClick={() => applyFilter(columnKey, null)} 
            className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-slate-100 rounded-sm border border-transparent"
            >
              Cancel
            </button>
            <button 
              onClick={() => applyFilter(columnKey, selected.length === options.length ? null : selected)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded-sm shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- HEADER CELL COMPONENT ---
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
          "py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border select-none relative group cursor-pointer hover:bg-slate-100 transition-colors", 
          width,
          (isSorted || isFiltered || isOpen) && "bg-slate-100 text-text-primary"
        )}
        onClick={() => setOpenMenuColumn(isOpen ? null : columnKey)}
      >
        <div className="flex items-center justify-between gap-1" ref={menuRef}>
          <span className="truncate">{label}</span>
          
          <div className="flex items-center">
            {isSorted && (
              sortConfig?.direction === 'asc' 
                ? <ArrowUp className="w-3 h-3 text-brand mr-1" /> 
                : <ArrowDown className="w-3 h-3 text-brand mr-1" />
            )}
            
            {isFiltered && <Filter className="w-3 h-3 text-brand fill-brand mr-1" />}

            <div className={cn(
              "p-0.5 rounded-sm transition-opacity",
              isOpen || isSorted || isFiltered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
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
    <div className="w-full bg-surface rounded-md shadow-lvl1 border border-border overflow-hidden flex flex-col h-full">
      <div className="overflow-auto flex-1 relative min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <HeaderCell label="Status" columnKey="status" width="w-[120px]" />
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
          <tbody className="divide-y divide-gray-100">
            {currentData.map((prop) => (
              <tr key={prop.id} onClick={() => onRowClick(prop)} className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer h-[56px]">
                <td className="py-3 px-4"><StatusPill status={prop.status} /></td>
                <td className="py-3 px-4 text-[13px] font-bold text-text-primary">{prop.name}</td>
                <td className="py-3 px-4 text-[13px] text-text-secondary">{prop.address}</td>
                <td className="py-3 px-4 text-[13px] text-text-secondary">{prop.city}</td>
                <td className="py-3 px-4 text-[13px] text-text-secondary">{prop.state}</td>
                <td className="py-3 px-4 text-[13px] text-text-secondary font-mono">{prop.zip}</td>
                <td className="py-3 px-4 text-[13px] text-text-primary text-center">{prop.unitCount}</td>
                <td className="py-3 px-4 text-[13px] font-medium text-text-primary">{prop.vendor.name}</td>
                <td className="py-3 px-4"><div className="pointer-events-none scale-75 origin-left"><StarRating value={prop.vendor.rating} readonly /></div></td>
                <td className="py-3 px-4 text-[13px] font-mono text-text-primary text-right">${prop.vendor.currentPrice.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] text-text-primary text-right tabular-nums">{prop.contractEndDate}</td>
                <td className="py-3 px-4 text-[13px] text-text-secondary">{prop.cancellationWindow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border p-3 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Rows per page:</span>
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-border rounded px-2 py-1 text-xs font-medium focus:border-brand outline-none">
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-4">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
