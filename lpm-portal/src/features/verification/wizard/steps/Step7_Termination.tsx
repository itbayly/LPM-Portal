import type { StepProps } from '../wizardConfig';

export default function Step7_Termination({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {formData.autoRenews && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Not Before (Days)</label>
            <input 
              type="number" 
              className="w-full p-2 border border-border rounded-md" 
              placeholder="e.g. 120"
              value={formData.noticeDaysMax} 
              onChange={e => setFormData(prev => ({ ...prev, noticeDaysMax: e.target.value }))} 
            />
            <p className="text-[10px] text-slate-400 mt-1">Leave blank if contract doesn't specify.</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Not Less Than (Days)</label>
            <input 
              type="number" 
              className="w-full p-2 border border-border rounded-md" 
              placeholder="e.g. 90"
              value={formData.noticeDaysMin} 
              onChange={e => setFormData(prev => ({ ...prev, noticeDaysMin: e.target.value }))} 
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <label className="flex items-center gap-2 font-bold text-text-primary cursor-pointer mb-3">
          <input 
            type="checkbox" 
            className="rounded text-brand focus:ring-brand" 
            checked={formData.hasPenalty} 
            onChange={e => setFormData(prev => ({ ...prev, hasPenalty: e.target.checked }))} 
          />
          Is there a penalty for early termination?
        </label>

        {formData.hasPenalty && (
          <div className="pl-6 space-y-3 animate-in slide-in-from-top-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="ptype" 
                  className="text-brand focus:ring-brand"
                  checked={formData.penaltyType === 'percentage'} 
                  onChange={() => setFormData(prev => ({ ...prev, penaltyType: 'percentage' }))} 
                />
                <span className="text-sm">% of Remaining Term</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="ptype" 
                  className="text-brand focus:ring-brand"
                  checked={formData.penaltyType === 'fixed'} 
                  onChange={() => setFormData(prev => ({ ...prev, penaltyType: 'fixed' }))} 
                />
                <span className="text-sm">Fixed Buyout ($)</span>
              </label>
            </div>
            <input 
              type={formData.penaltyType === 'fixed' ? "number" : "text"}
              className="w-full p-2 border border-border rounded-md focus:border-brand outline-none"
              placeholder={formData.penaltyType === 'fixed' ? "e.g. 5000" : "e.g. 50"}
              value={formData.penaltyValue}
              onChange={e => setFormData(prev => ({ ...prev, penaltyValue: e.target.value }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}