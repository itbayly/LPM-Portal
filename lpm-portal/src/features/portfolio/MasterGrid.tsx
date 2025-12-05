import { useState, useMemo } from 'react';
import { StatusPill } from '../../components/ui/StatusPill';
import { StarRating } from '../../components/ui/StarRating';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import type { Property } from '../../dataModel';
import { cn } from '../../lib/utils'; // Make sure utils is imported

interface MasterGridProps {
  onRowClick: (property: Property) => void;
  data?: Property[]; 
}

type SortConfig = {
  key: keyof Property | 'vendor.name' | 'vendor.rating' | 'vendor.currentPrice';
  direction: 'asc' | 'desc';
} | null;

export default function MasterGrid({ onRowClick, data = [] }: MasterGridProps) {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Sorting Logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a: any, b: any) => {
      let aValue = a;
      let bValue = b;

      // Handle nested paths
      if (sortConfig.key.includes('.')) {
        const [obj, key] = sortConfig.key.split('.');
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
  }, [data, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: SortConfig['key']) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ active }: { active: boolean }) => (
    <ArrowUpDown className={cn("w-3 h-3 ml-1 transition-opacity", active ? "opacity-100 text-brand" : "opacity-0 group-hover:opacity-30")} />
  );

  return (
    <div className="w-full bg-surface rounded-md shadow-lvl1 border border-border overflow-hidden flex flex-col h-full">
      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th onClick={() => handleSort('status')} className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border w-[120px] cursor-pointer group hover:bg-slate-100 select-none">
                <div className="flex items-center">Status <SortIcon active={sortConfig?.key === 'status'} /></div>
              </th>
              <th onClick={() => handleSort('name')} className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border min-w-[180px] cursor-pointer group hover:bg-slate-100 select-none">
                <div className="flex items-center">Property Name <SortIcon active={sortConfig?.key === 'name'} /></div>
              </th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border min-w-[140px]">Street Address</th>
              <th onClick={() => handleSort('city')} className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border cursor-pointer group hover:bg-slate-100 select-none">
                <div className="flex items-center">City <SortIcon active={sortConfig?.key === 'city'} /></div>
              </th>
              <th onClick={() => handleSort('state')} className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border cursor-pointer group hover:bg-slate-100 select-none">
                <div className="flex items-center">State <SortIcon active={sortConfig?.key === 'state'} /></div>
              </th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">Zip</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border text-center">Units</th>
              <th onClick={() => handleSort('vendor.name')} className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border cursor-pointer group hover:bg-slate-100 select-none">
                <div className="flex items-center">Vendor <SortIcon active={sortConfig?.key === 'vendor.name'} /></div>
              </th>
              <th onClick={() => handleSort('vendor.rating')} className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border w-[120px] cursor-pointer group hover:bg-slate-100 select-none">
                <div className="flex items-center">Rating <SortIcon active={sortConfig?.key === 'vendor.rating'} /></div>
              </th>
              <th onClick={() => handleSort('vendor.currentPrice')} className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border text-right cursor-pointer group hover:bg-slate-100 select-none">
                <div className="flex items-center justify-end">Price/Mo <SortIcon active={sortConfig?.key === 'vendor.currentPrice'} /></div>
              </th>
              <th onClick={() => handleSort('contractEndDate')} className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border text-right cursor-pointer group hover:bg-slate-100 select-none">
                <div className="flex items-center justify-end">End Date <SortIcon active={sortConfig?.key === 'contractEndDate'} /></div>
              </th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">Notice Window</th>
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
