import { StarRating } from '../../../components/ui/StarRating';
import { cn } from '../../../lib/utils';
import type { Property } from '../../../dataModel';

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
    <div className="bg-surface rounded-md shadow-lvl1 p-lg border border-border">
      <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-md">Current Vendor</h3>
      
      <div className="mb-lg">
        <div className="flex items-start justify-between">
          <span className="text-lg font-bold text-brand block">{vendor.name || "No Vendor Selected"}</span>
          {vendor.name === 'Schindler' && (
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide",
              property.onNationalContract ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"
            )}>
              {property.onNationalContract ? "National Agreement" : "Not on Agreement"}
            </span>
          )}
        </div>
        <StarRating value={vendor.rating || 0} onChange={(val) => updateVendor('rating', val)} />
      </div>

      <div className="space-y-md">
        <div>
          <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">Account Number</label>
          <input 
            type="text" 
            className="w-full text-sm font-mono bg-slate-50 p-2 rounded-sm border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none" 
            value={vendor.accountNumber || ""} 
            onChange={(e) => updateVendor('accountNumber', e.target.value)} 
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">Bill To #</label>
          <input 
            type="text" 
            className="w-full text-sm font-mono bg-slate-50 p-2 rounded-sm border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none" 
            value={property.billTo || ""} 
            onChange={(e) => updateField('billTo', e.target.value)} 
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">Building ID #</label>
          <input 
            type="text" 
            className="w-full text-sm font-mono bg-slate-50 p-2 rounded-sm border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none" 
            value={property.buildingId || ""} 
            onChange={(e) => updateField('buildingId', e.target.value)} 
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">How To Place a Service Call</label>
          <textarea 
            className="w-full text-sm bg-slate-50 p-2 rounded-sm border border-border min-h-[80px] focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-y" 
            value={vendor.serviceInstructions || ""} 
            onChange={(e) => updateVendor('serviceInstructions', e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
}