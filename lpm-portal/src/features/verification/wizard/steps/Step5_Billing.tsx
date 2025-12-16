import { DollarSign } from 'lucide-react';
import { BILLING_FREQUENCIES } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';
import { cn } from '../../../../lib/utils';

export default function Step5_Billing({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Price Input */}
      <div>
        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
          Current Monthly Price <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-3 text-text-secondary dark:text-slate-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <input 
            type="number"
            className="w-full bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm pl-11 pr-4 py-3 text-2xl font-mono font-bold text-text-primary dark:text-white outline-none placeholder:text-slate-400/30"
            value={formData.currentPrice}
            onChange={e => setFormData(prev => ({ ...prev, currentPrice: Number(e.target.value) }))}
            placeholder="0.00"
            autoFocus
          />
          <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
          Billing Frequency
        </label>
        <div className="relative group">
          <select 
            className="w-full bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm px-4 py-3 text-sm font-medium text-text-primary dark:text-white outline-none cursor-pointer"
            value={formData.billingFreq}
            onChange={e => setFormData(prev => ({ ...prev, billingFreq: e.target.value as any }))}
          >
            {BILLING_FREQUENCIES.map(f => <option key={f} value={f} className="text-black">{f}</option>)}
          </select>
          <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
        </div>
      </div>

      {/* Price Cap Toggle */}
      <div className="pt-6 border-t border-black/5 dark:border-white/10">
        <label className="flex items-center gap-3 cursor-pointer group mb-4">
          <div className={cn(
            "w-10 h-5 rounded-full relative transition-colors duration-200",
            formData.hasPriceCap ? "bg-brand dark:bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
          )}>
            <div className={cn(
              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200",
              formData.hasPriceCap ? "left-6" : "left-1"
            )} />
            <input 
              type="checkbox" 
              className="hidden"
              checked={formData.hasPriceCap} 
              onChange={e => setFormData(prev => ({ ...prev, hasPriceCap: e.target.checked }))} 
            />
          </div>
          <span className="text-sm font-bold text-text-primary dark:text-white group-hover:text-brand dark:group-hover:text-blue-400 transition-colors">
            Include Price Adjustment Cap?
          </span>
        </label>

        {formData.hasPriceCap && (
          <div className="pl-12 animate-in slide-in-from-top-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
              Cap Amount <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input 
                className="flex-1 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm px-3 py-2 text-sm text-text-primary dark:text-white outline-none"
                placeholder="e.g. 3"
                value={formData.priceCapValue}
                onChange={e => setFormData(prev => ({ ...prev, priceCapValue: e.target.value }))}
              />
              <select 
                className="w-24 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm px-3 py-2 text-sm text-text-primary dark:text-white outline-none"
                value={formData.priceCapUnit}
                onChange={e => setFormData(prev => ({ ...prev, priceCapUnit: e.target.value as any }))}
              >
                <option value="%" className="text-black">%</option>
                <option value="$" className="text-black">$</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}