import { ArrowLeft, Building2, AlertTriangle, ShieldCheck } from 'lucide-react'; // REMOVED CheckCircle2
import { StatusPill } from '../../../components/ui/StatusPill';
import type { LegacyProperty } from '../../../dataModel';
import { cn } from '../../../lib/utils';

interface PropertyHeaderProps {
  property: LegacyProperty;
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
    <div className="flex flex-col gap-4 mb-6 shrink-0">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 hover:text-brand dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Back to Grid
        </button>
        <span className="text-text-secondary/20 dark:text-slate-700">/</span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500">
          {property.hierarchy?.market || "Unknown Market"}
        </span>
      </div>

      {/* Main Glass Header */}
      <div className="glass-panel p-1 rounded-xl flex items-center justify-between min-h-[80px]">
        
        <div className="flex items-center gap-6 px-6 py-2">
          {/* Icon Box */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-white dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 shadow-sm flex items-center justify-center">
            <Building2 className="w-6 h-6 text-text-primary dark:text-white opacity-80" />
          </div>

          {/* Title Block */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-text-primary dark:text-white tracking-tight leading-none">
                {property.name || "Unnamed Property"}
              </h1>
              <div className="flex gap-2">
                <StatusPill status={property.status} />
                {property.unitCount > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 text-[10px] font-mono font-bold text-text-secondary dark:text-slate-300 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-blue-400" />
                    {property.unitCount} UNITS
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-text-secondary dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                ID: <span className="font-mono text-text-primary dark:text-slate-300">{property.buildingId || "N/A"}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-current opacity-30" />
              <span>{property.address}, {property.city}, {property.state} {property.zip}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pr-2">
          <button 
            onClick={onVerify} 
            className={cn(
              "h-10 px-5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm",
              isVerified 
                ? "bg-white dark:bg-white/10 border border-border dark:border-white/10 text-text-primary dark:text-white hover:bg-slate-50 dark:hover:bg-white/20" 
                : "bg-brand hover:bg-brand-dark text-white shadow-brand/20"
            )}
          >
            {isVerified ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {isVerified ? "Update Data" : "Verify Asset"}
          </button>
        </div>

      </div>
    </div>
  );
}