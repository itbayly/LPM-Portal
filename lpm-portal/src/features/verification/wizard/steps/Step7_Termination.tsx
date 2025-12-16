import type { StepProps } from '../wizardConfig';
import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export default function Step7_Termination({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {formData.autoRenews && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand dark:text-blue-400 mb-2">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Notice Window</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
                Not Before (Days)
              </label>
              <div className="relative flex items-center bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm">
                <input 
                  type="number" 
                  className="w-full bg-transparent border-none outline-none text-sm px-3 py-2.5 text-text-primary dark:text-white placeholder:text-slate-400/50"
                  placeholder="e.g. 120"
                  value={formData.noticeDaysMax} 
                  onChange={e => setFormData(prev => ({ ...prev, noticeDaysMax: e.target.value }))} 
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>
            
            <div className="group">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
                Not Less Than (Days)
              </label>
              <div className="relative flex items-center bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm">
                <input 
                  type="number" 
                  className="w-full bg-transparent border-none outline-none text-sm px-3 py-2.5 text-text-primary dark:text-white placeholder:text-slate-400/50"
                  placeholder="e.g. 90"
                  value={formData.noticeDaysMin} 
                  onChange={e => setFormData(prev => ({ ...prev, noticeDaysMin: e.target.value }))} 
                />
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-black/5 dark:border-white/10">
        <label className="flex items-center gap-3 cursor-pointer group mb-4">
          <div className={cn(
            "w-10 h-5 rounded-full relative transition-colors duration-200",
            formData.hasPenalty ? "bg-red-500" : "bg-slate-300 dark:bg-slate-600"
          )}>
            <div className={cn(
              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200",
              formData.hasPenalty ? "left-6" : "left-1"
            )} />
            <input 
              type="checkbox" 
              className="hidden"
              checked={formData.hasPenalty} 
              onChange={e => setFormData(prev => ({ ...prev, hasPenalty: e.target.checked }))} 
            />
          </div>
          <span className="text-sm font-bold text-text-primary dark:text-white group-hover:text-red-500 transition-colors flex items-center gap-2">
            Is there an Early Termination Penalty?
            {formData.hasPenalty && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </span>
        </label>

        {formData.hasPenalty && (
          <div className="pl-12 animate-in slide-in-from-top-2">
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="ptype" 
                  className="accent-red-500"
                  checked={formData.penaltyType === 'percentage'} 
                  onChange={() => setFormData(prev => ({ ...prev, penaltyType: 'percentage' }))} 
                />
                <span className="text-xs text-text-secondary dark:text-slate-400 font-medium">% of Remaining Term</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="ptype" 
                  className="accent-red-500"
                  checked={formData.penaltyType === 'fixed'} 
                  onChange={() => setFormData(prev => ({ ...prev, penaltyType: 'fixed' }))} 
                />
                <span className="text-xs text-text-secondary dark:text-slate-400 font-medium">Fixed Buyout ($)</span>
              </label>
            </div>
            
            <div className="relative group max-w-[200px]">
              <input 
                type="number"
                className="w-full bg-red-500/5 border-b border-red-500/30 rounded-t-sm px-3 py-2 text-sm text-red-600 dark:text-red-400 font-bold placeholder:text-red-300 outline-none focus:bg-red-500/10 transition-colors"
                placeholder={formData.penaltyType === 'fixed' ? "5000" : "50"}
                value={formData.penaltyValue}
                onChange={e => setFormData(prev => ({ ...prev, penaltyValue: e.target.value }))}
              />
              <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-red-500 transition-all duration-300 group-focus-within:w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}