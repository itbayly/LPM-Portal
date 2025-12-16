import { cn } from '../../../../lib/utils';
import { StarRating } from '../../../../components/ui/StarRating';
import { VENDORS } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';
import { ShieldCheck, ShieldAlert, ChevronDown } from 'lucide-react';

export default function Step2_Provider({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center">
        <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">Service Coverage</h3>
        <p className="text-sm text-text-secondary dark:text-slate-400">Is there an active maintenance contract in place?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setFormData(prev => ({ ...prev, hasProvider: true }))}
          className={cn(
            "relative p-6 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300", 
            formData.hasProvider === true 
              ? "bg-brand/10 border-brand/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
              : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10"
          )}
        >
          <ShieldCheck className={cn("w-8 h-8", formData.hasProvider === true ? "text-brand dark:text-blue-400" : "text-slate-400")} />
          <span className={cn("font-bold text-sm", formData.hasProvider === true ? "text-brand dark:text-blue-400" : "text-text-secondary dark:text-slate-400")}>YES</span>
        </button>
        <button 
          onClick={() => setFormData(prev => ({ ...prev, hasProvider: false }))}
          className={cn(
            "relative p-6 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300", 
            formData.hasProvider === false 
              ? "bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]" 
              : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10"
          )}
        >
          <ShieldAlert className={cn("w-8 h-8", formData.hasProvider === false ? "text-orange-500" : "text-slate-400")} />
          <span className={cn("font-bold text-sm", formData.hasProvider === false ? "text-orange-500" : "text-text-secondary dark:text-slate-400")}>NO</span>
        </button>
      </div>

      {formData.hasProvider && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
              Vendor Identity
            </label>
            <div className="relative group">
              <select 
                className="w-full bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm outline-none text-sm font-medium text-text-primary dark:text-white px-4 py-3 appearance-none cursor-pointer"
                value={formData.vendorName}
                onChange={e => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
              >
                <option value="" className="text-black">Select Vendor...</option>
                {VENDORS.map(v => <option key={v} value={v} className="text-black">{v}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-text-secondary dark:text-slate-400 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
            </div>
            
            {formData.vendorName === 'Other' && (
              <div className="mt-2 relative">
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm outline-none text-sm font-medium text-text-primary dark:text-white px-4 py-3"
                  placeholder="Enter Vendor Name..."
                  value={formData.vendorOther}
                  onChange={e => setFormData(prev => ({ ...prev, vendorOther: e.target.value }))}
                />
              </div>
            )}
          </div>
          
          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider">Performance Rating</span>
            <StarRating value={formData.ratingRaw} onChange={v => setFormData(prev => ({ ...prev, ratingRaw: v }))} />
          </div>
        </div>
      )}
    </div>
  );
}