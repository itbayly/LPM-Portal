import { cn } from '../../../../lib/utils';
import type { StepProps } from '../wizardConfig';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Step1_Elevators({ formData, setFormData }: StepProps) {
  
  const handleNoClick = () => {
    setFormData(prev => ({ ...prev, hasElevators: false }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center">
        <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">Vertical Transportation Check</h3>
        <p className="text-sm text-text-secondary dark:text-slate-400">Does this asset have elevators or escalators on site?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setFormData(prev => ({ ...prev, hasElevators: true }))}
          className={cn(
            "relative p-6 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300 group", 
            formData.hasElevators === true 
              ? "bg-brand/10 border-brand/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
              : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10"
          )}
        >
          <CheckCircle2 className={cn("w-8 h-8", formData.hasElevators === true ? "text-brand dark:text-blue-400" : "text-slate-400")} />
          <span className={cn("font-bold text-sm", formData.hasElevators === true ? "text-brand dark:text-blue-400" : "text-text-secondary dark:text-slate-400")}>YES</span>
        </button>

        <button 
          onClick={handleNoClick}
          className={cn(
            "relative p-6 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300 group", 
            formData.hasElevators === false 
              ? "bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
              : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10"
          )}
        >
          <XCircle className={cn("w-8 h-8", formData.hasElevators === false ? "text-red-500" : "text-slate-400")} />
          <span className={cn("font-bold text-sm", formData.hasElevators === false ? "text-red-500" : "text-text-secondary dark:text-slate-400")}>NO</span>
        </button>
      </div>

      {formData.hasElevators && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
            Unit Count
          </label>
          <div className="relative flex items-center bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm">
            <input 
              type="number"
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-text-primary dark:text-white px-4 py-3 placeholder:text-slate-400/50"
              value={formData.unitCount}
              onChange={e => setFormData(prev => ({ ...prev, unitCount: Number(e.target.value) }))}
              placeholder="e.g. 4"
              autoFocus
            />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand dark:bg-blue-400" />
          </div>
        </div>
      )}
    </div>
  );
}