import { CheckCircle2 } from 'lucide-react';
import type { StepProps } from '../wizardConfig';

export default function Step10_Confirm({ formData }: StepProps) {
  
  const DataRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-baseline border-b border-black/5 dark:border-white/5 pb-2">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500">{label}</span>
      <span className="text-sm font-medium text-text-primary dark:text-white font-mono text-right">{value}</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-text-primary dark:text-white">Verification Complete</h3>
        <p className="text-sm text-text-secondary dark:text-slate-400 max-w-xs mt-1">
          Review the manifest below. If correct, submit to lock this data into the ledger.
        </p>
      </div>
      
      <div className="bg-black/5 dark:bg-white/5 rounded-xl p-6 border border-black/5 dark:border-white/5 space-y-4">
        <DataRow label="Service Provider" value={formData.vendorName === 'Other' ? formData.vendorOther : formData.vendorName} />
        <DataRow label="Monthly Cost" value={`$${Number(formData.currentPrice).toLocaleString()}`} />
        <DataRow label="Billing Cycle" value={formData.billingFreq} />
        <DataRow label="Term Length" value={`${formData.initialTermNum} ${formData.initialTermUnit}`} />
        <DataRow label="Contract End" value={formData.contractEnd} />
        
        {formData.hasPriceCap && (
          <DataRow 
            label="Price Cap" 
            value={formData.priceCapUnit === '$' ? `$${formData.priceCapValue}` : `${formData.priceCapValue}%`} 
          />
        )}
      </div>

      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-text-secondary dark:text-slate-500 opacity-50">
          Ready for Ingestion
        </p>
      </div>
    </div>
  );
}