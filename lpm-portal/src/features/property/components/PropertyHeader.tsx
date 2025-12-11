import { ArrowLeft, Building, CheckCircle2 } from 'lucide-react';
import { StatusPill } from '../../../components/ui/StatusPill';
import type { Property } from '../../../dataModel';

interface PropertyHeaderProps {
  property: Property;
  onBack: () => void;
  onVerify: () => void;
}

export default function PropertyHeader({ property, onBack, onVerify }: PropertyHeaderProps) {
  
  const isVerified = [
    'active_contract', 
    'on_national_agreement', 
    'notice_due_soon', 
    'no_elevators', 
    'cancellation_window_open', 
    'critical_action_required', 
    'add_to_msa', 
    'service_contract_needed'
  ].includes(property.status);

  return (
    <div className="flex items-center gap-md mb-lg shrink-0 pt-1">
      <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-text-secondary">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div>
        {/* Company Mapping Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-text-secondary mb-1">
          <span>{property.hierarchy?.area || "Area"}</span>
          <span className="text-slate-300">/</span>
          <span>{property.hierarchy?.region || "Region"}</span>
          <span className="text-slate-300">/</span>
          <span>{property.hierarchy?.market || "Market"}</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-[28px] font-bold text-text-primary leading-tight">{property.name || "Unnamed Property"}</h1>
          {/* UPDATED: More Prominent Elevator Badge */}
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1.5 shadow-sm">
            <Building className="w-3.5 h-3.5" />
            {property.unitCount || 0} Elevators
          </span>
        </div>
        <p className="text-sm text-text-secondary">
          {property.address}, {property.city}, {property.state} {property.zip}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-md">
        <StatusPill status={property.status} />
        <button onClick={onVerify} className="px-4 py-2 bg-brand text-white rounded-sm text-sm font-medium shadow-sm hover:bg-brand-dark flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {isVerified ? "Update Information" : "Verify Data"}
        </button>
      </div>
    </div>
  );
}