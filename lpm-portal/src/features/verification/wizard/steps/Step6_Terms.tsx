import { cn } from '../../../../lib/utils';
import { formatDateInput } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';

export default function Step6_Terms({ formData, setFormData }: StepProps) {
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setFormData(prev => ({ ...prev, contractStart: formatted }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">
            Original Start Date <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            placeholder="MM/DD/YYYY"
            className="w-full p-2 border border-border rounded-md" 
            value={formData.contractStart} 
            onChange={handleDateChange} 
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">
            Initial Term Length <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              className="p-2 border border-border rounded-md w-full" 
              value={formData.initialTermNum} 
              onChange={e => setFormData(prev => ({ ...prev, initialTermNum: Number(e.target.value) }))} 
            />
            <select 
              className="p-2 border border-border rounded-md bg-white w-full"
              value={formData.initialTermUnit} 
              onChange={e => setFormData(prev => ({ ...prev, initialTermUnit: e.target.value }))}
            >
              <option>Years</option>
              <option>Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auto-Renew Toggle */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-border">
        <span className="font-bold text-sm text-text-primary">
          Does this contract auto-renew? <span className="text-red-500">*</span>
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setFormData(prev => ({ ...prev, autoRenews: true }))}
            className={cn("px-3 py-1 rounded text-sm font-bold", formData.autoRenews === true ? "bg-brand text-white" : "bg-white border text-text-secondary")}
          >
            Yes
          </button>
          <button 
            onClick={() => setFormData(prev => ({ ...prev, autoRenews: false }))}
            className={cn("px-3 py-1 rounded text-sm font-bold", formData.autoRenews === false ? "bg-brand text-white" : "bg-white border text-text-secondary")}
          >
            No
          </button>
        </div>
      </div>

      {formData.autoRenews && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">
            Renewal Term Length <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input 
              type="number" 
              className="flex-1 p-2 border border-border rounded-md" 
              value={formData.renewalTermNum} 
              onChange={e => setFormData(prev => ({ ...prev, renewalTermNum: Number(e.target.value) }))} 
            />
            <select 
              className="w-24 p-2 border border-border rounded-md bg-white"
              value={formData.renewalTermUnit} 
              onChange={e => setFormData(prev => ({ ...prev, renewalTermUnit: e.target.value }))}
            >
              <option>Years</option>
              <option>Months</option>
            </select>
          </div>
        </div>
      )}

      {/* End Date with Override */}
      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-bold uppercase text-text-secondary">Current End Date</label>
          {!formData.overrideEndDate && (
            <button 
              onClick={() => setFormData(prev => ({ ...prev, overrideEndDate: true }))} 
              className="text-xs text-brand font-bold hover:underline"
            >
              Override Calculation
            </button>
          )}
        </div>
        <input 
          type="date" 
          className={cn("w-full p-2 border rounded-md", !formData.overrideEndDate ? "bg-slate-100 text-slate-600" : "bg-white border-brand")}
          value={formData.contractEnd} 
          disabled={!formData.overrideEndDate}
          onChange={e => setFormData(prev => ({ ...prev, contractEnd: e.target.value }))} 
        />
      </div>
    </div>
  );
}