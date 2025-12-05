import React, { useState } from 'react';
import { StatusPill } from '../../components/ui/StatusPill';
import { StarRating } from '../../components/ui/StarRating';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Property } from '../../dataModel';
import { generateMockProperties } from '../../lib/mockData';

interface MasterGridProps {
  onRowClick: (property: Property) => void;
  data?: Property[]; 
}

export default function MasterGrid({ onRowClick, data }: MasterGridProps) {
  const properties = data || generateMockProperties(50);
  
  // Pagination State 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = properties.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-full bg-surface rounded-md shadow-lvl1 border border-border overflow-hidden flex flex-col h-full">
      {/* Scrollable Table Area */}
      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-left border-collapse">
          {/* Sticky Header [cite: 25, 156] */}
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border w-[120px]">Status</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border min-w-[180px]">Property Name</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border min-w-[140px]">Street Address</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">City</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">State</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">Zip</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border text-center">Units</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">Vendor</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border w-[120px]">Rating</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border text-right">Price/Mo</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border text-right">End Date</th>
              <th className="py-3 px-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">Notice Window</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.map((prop) => (
              <tr 
                key={prop.id} 
                onClick={() => onRowClick(prop)}
                className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer h-[56px]"
              >
                {/* Status Indicator [cite: 26] */}
                <td className="py-3 px-4"><StatusPill status={prop.status} /></td>
                
                {/* Property Name [cite: 27] */}
                <td className="py-3 px-4 text-[13px] font-bold text-text-primary">{prop.name}</td>
                
                {/* Street Address [cite: 28] */}
                <td className="py-3 px-4 text-[13px] text-text-secondary">{prop.address}</td>
                
                {/* City [cite: 29] */}
                <td className="py-3 px-4 text-[13px] text-text-secondary">{prop.city}</td>
                
                {/* State [cite: 30] */}
                <td className="py-3 px-4 text-[13px] text-text-secondary">{prop.state}</td>
                
                {/* Zip [cite: 31] */}
                <td className="py-3 px-4 text-[13px] text-text-secondary font-mono">{prop.zip}</td>
                
                {/* Unit Count [cite: 32] */}
                <td className="py-3 px-4 text-[13px] text-text-primary text-center">{prop.unitCount}</td>
                
                {/* Current Vendor [cite: 33] */}
                <td className="py-3 px-4 text-[13px] font-medium text-text-primary">{prop.vendor.name}</td>
                
                {/* Vendor Rating [cite: 34] */}
                <td className="py-3 px-4">
                  <div className="pointer-events-none scale-75 origin-left">
                    <StarRating value={prop.vendor.rating} readonly />
                  </div>
                </td>
                
                {/* Current Price [cite: 36] */}
                <td className="py-3 px-4 text-[13px] font-mono text-text-primary text-right">
                  ${prop.vendor.currentPrice.toLocaleString()}
                </td>
                
                {/* End Date [cite: 37] */}
                <td className="py-3 px-4 text-[13px] text-text-primary text-right tabular-nums">
                  {prop.contractEndDate}
                </td>

                {/* Notice Window [cite: 38] */}
                <td className="py-3 px-4 text-[13px] text-text-secondary">
                  {prop.cancellationWindow}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer  */}
      <div className="border-t border-border p-3 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Rows per page:</span>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-border rounded px-2 py-1 text-xs font-medium focus:border-brand outline-none"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-4">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, properties.length)} of {properties.length}
          </span>
        </div>

        <div className="flex gap-1">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}