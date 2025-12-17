import { StarRating } from '../../../components/ui/StarRating';
import { cn } from '../../../lib/utils';
import type { Property } from '../../../dataModel';
import { Briefcase, Hash, Phone, FileText, Building } from 'lucide-react';

interface Props {
  property: Property;
  onUpdate: (id: string, data: Partial<Property>) => void;
}

export default function PropertyVendorCard({ property, onUpdate }: Props) {
  const vendor = property.vendor || {};

  const updateVendor = (field: string, value: any) => {
    onUpdate(property.id, { vendor: { ...property.vendor, [field]: value } });
  };

  const updateField = (field: keyof Property, value: any) => {
    onUpdate(property.id, { [field]: value });
  };

  return (
    <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xs font-bold text-brand dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Current Vendor
          </h3>
          <div className="text-lg font-bold text-text-primary dark:text-white">
            {vendor.name || "No Vendor Selected"}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {vendor.name === 'Schindler' && (
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase tracking-wide",
              property.onNationalContract 
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" 
                : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-transparent"
            )}>
              {property.onNationalContract ? "National Agreement" : "Off-Contract"}
            </span>
          )}
          <StarRating value={vendor.rating || 0} onChange={(val) => updateVendor('rating', val)} />
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputSlot 
          label="Account Number" 
          icon={Hash}
          value={vendor.accountNumber} 
          onChange={(e: any) => updateVendor('accountNumber', e.target.value)} 
        />
        <InputSlot 
          label="Bill To Number" 
          icon={FileText}
          value={property.billTo} 
          onChange={(e: any) => updateField('billTo', e.target.value)} 
        />
        <div className="md:col-span-2">
          <InputSlot 
            label="Building ID" 
            icon={Building} 
            value={property.buildingId} 
            onChange={(e: any) => updateField('buildingId', e.target.value)} 
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
            Service Instructions
          </label>
          <div className="relative bg-black/5 dark:bg-black/20 border-b border-black/10 dark:border-white/10 rounded-t-sm group">
             <div className="absolute top-3 left-3 text-text-secondary dark:text-slate-500">
                <Phone className="w-3.5 h-3.5" />
             </div>
             <textarea 
               className="w-full bg-transparent border-none outline-none text-xs font-medium text-text-primary dark:text-slate-200 px-3 py-2.5 pl-9 min-h-[80px] resize-y placeholder:text-slate-400/50 block" 
               value={vendor.serviceInstructions || ""} 
               onChange={(e) => updateVendor('serviceInstructions', e.target.value)} 
             />
             <div className="absolute bottom-[-1px] left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MOVED OUTSIDE ---
const InputSlot = ({ label, value, onChange, icon: Icon }: any) => (
  <div className="group">
    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
      {label}
    </label>
    <div className="relative flex items-center bg-black/5 dark:bg-black/20 border-b border-black/10 dark:border-white/10 rounded-t-sm transition-colors focus-within:bg-black/10 dark:focus-within:bg-white/5">
      <div className="pl-3 text-text-secondary dark:text-slate-500">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <input 
        type="text" 
        className="w-full bg-transparent border-none outline-none text-xs font-medium text-text-primary dark:text-slate-200 px-3 py-2.5 placeholder:text-slate-400/50" 
        value={value || ""} 
        onChange={onChange}
        spellCheck={false}
      />
      {/* Animated Focus Line */}
      <div className="absolute bottom-[-1px] left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
    </div>
  </div>
);