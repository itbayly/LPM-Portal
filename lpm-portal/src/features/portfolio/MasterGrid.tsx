import { useState, useMemo, useRef, useEffect } from 'react';
import { StatusPill } from '../../components/ui/StatusPill';
import { StarRating } from '../../components/ui/StarRating';
import { ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';
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

// Helper to get unique values for a column
const getUniqueValues = (data: Property[], key: string) => {
  const values = new Set<string>();
  data.forEach(item => {
    let val: any = item;
    if (key.includes('.')) {
      const [obj, k] = key.split('.');
      val = val[obj][k];
    } else {
      val = val[key as keyof Property];
    }
    if (val) values.add(String(val));
  });
  return Array.from(values).sort();
};

export default function MasterGrid({ onRowClick, data = [] }: MasterGridProps) {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortState | null>(null);

  // Filtering State: { city: "Chicago", state: "NY" }
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null);

  // 1. FILTERING LOGIC
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(activeFilters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        
        let itemValue: any = item;
        if (key.includes('.')) {
          const [obj, k] = key.split('.');
          itemValue = itemValue[obj][k];
        } else {
          itemValue = itemValue[key as keyof Property];
        }
        
        return String(itemValue) === filterValue;
      });
    });
  }, [data, activeFilters]);

  // 2. SORTING LOGIC (Applied to filtered data)
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      let aValue = a;
      let bValue = b;

      if (String(sortConfig.key).includes('.')) {
        const [obj, key] = (sortConfig.key as string).split('.');
        aValue = a[obj][key];
        bValue = b[obj][key];
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 3. PAGINATION LOGIC
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleFilter = (columnKey: string, value: string | null) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value) next[columnKey] = value;
      else delete next[columnKey];
      return next;
    });
    setOpenFilterColumn(null); // Close dropdown
    setCurrentPage(1); // Reset to page 1
  };

  // --- UI COMPONENTS ---

  const HeaderCell = ({ label, sortKey, filterKey, width }: { label: string, sortKey?: SortKey, filterKey?: string, width?: string }) => {
    const isSorted = sortConfig?.key === sortKey;
    const isFiltered = filterKey ? !!activeFilters[filterKey] : false;
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
          if (openFilterColumn === filterKey) setOpenFilterColumn(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openFilterColumn, filterKey]);

    return (
      <th className={cn("py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border select-none relative group", width)}>
        <div className="flex items-center justify-between gap-2 h-full">
          
          {/* 1. Sortable Label Area */}
          <button 
            onClick={() => sortKey && handleSort(sortKey)}
            className="flex items-center hover:text-text-primary transition-colors flex-1 text-left"
          >
            {label}
            {sortKey && (
              <ArrowUpDown className={cn(
                "w-3 h-3 ml-1 transition-opacity", 
                isSorted ? "opacity-100 text-brand" : "opacity-0 group-hover:opacity-50"
              )} />
            )}
          </button>

          {/* 2. Distinct Filter Trigger */}
          {filterKey && (
            <div className="relative" ref={filterRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setOpenFilterColumn(openFilterColumn === filterKey ? null : filterKey); }}
                className={cn(
                  "p-1.5 rounded-sm transition-all duration-200 border", 
                  isFiltered 
                    ? "bg-brand text-white border-brand shadow-sm"  // Active State (High Vis)
                    : "bg-transparent text-slate-400 border-transparent hover:bg-slate-200 hover:text-slate-700" // Default State
                )}
                title={`Filter by ${label}`}
              >
                <Filter className="w-3 h-3" strokeWidth={isFiltered ? 3 : 2} />
              </button>

              {/* Dropdown Menu */}
              {openFilterColumn === filterKey && (
                <div className="absolute top-8 right-0 w-56 bg-white border border-border shadow-lvl3 rounded-md z-[100] animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                  
                  {/* Dropdown Header */}
                  <div className="p-3 border-b border-border bg-slate-50 flex justify-between items-center rounded-t-md">
                    <span className="text-xs font-bold text-text-primary">Filter {label}</span>
                    {isFiltered && (
                      <button 
                        onClick={() => toggleFilter(filterKey, null)} 
                        className="text-[10px] text-red-600 font-semibold hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                    {getUniqueValues(data, filterKey).map(val => (
                      <button
                        key={val}
                        onClick={() => toggleFilter(filterKey, val)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs rounded-sm transition-colors truncate",
                          activeFilters[filterKey] === val 
                            ? "bg-brand/10 text-brand font-bold" 
                            : "hover:bg-slate-50 text-text-primary"
                        )}
                      >
                        {val}
                      </button>
                    ))}
                    {getUniqueValues(data, filterKey).length === 0 && (
                      <div className="p-3 text-center text-xs text-text-secondary italic">
                        No options found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="w-full bg-surface rounded-md shadow-lvl1 border border-border overflow-hidden flex flex-col h-full">
      <div className="overflow-auto flex-1 relative min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm group">
            <tr>
              <HeaderCell label="Status" sortKey="status" filterKey="status" width="w-[120px]" />
              <HeaderCell label="Property Name" sortKey="name" width="min-w-[180px]" />
              <HeaderCell label="Address" width="min-w-[140px]" />
              <HeaderCell label="City" sortKey="city" filterKey="city" />
              <HeaderCell label="State" sortKey="state" filterKey="state" />
              <HeaderCell label="Zip" filterKey="zip" />
              <HeaderCell label="Units" />
              <HeaderCell label="Vendor" sortKey="vendor.name" filterKey="vendor.name" />
              <HeaderCell label="Rating" sortKey="vendor.rating" width="w-[120px]" />
              <HeaderCell label="Price/Mo" sortKey="vendor.currentPrice" />
              <HeaderCell label="End Date" sortKey="contractEndDate" />
              <HeaderCell label="Notice" />
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
