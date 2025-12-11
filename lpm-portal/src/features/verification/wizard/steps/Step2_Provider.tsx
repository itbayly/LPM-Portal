import { cn } from '../../../../lib/utils';
import { StarRating } from '../../../../components/ui/StarRating';
import { VENDORS } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';

export default function Step2_Provider({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <label className="text-lg font-bold text-text-primary block">
        Do you have a current Service Provider? <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-4">
        <button 
          onClick={() => setFormData(prev => ({ ...prev, hasProvider: true }))}
          className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasProvider === true ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
        >
          Yes
        </button>
        <button 
          onClick={() => setFormData(prev => ({ ...prev, hasProvider: false }))}
          className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasProvider === false ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
        >
          No
        </button>
      </div>

      {formData.hasProvider && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full p-3 border border-border rounded-md bg-white focus:border-brand outline-none"
              value={formData.vendorName}
              onChange={e => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
            >
              <option value="">Select Vendor...</option>
              {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            
            {formData.vendorName === 'Other' && (
              <input 
                className="w-full p-3 mt-2 border border-border rounded-md focus:border-brand outline-none"
                placeholder="Enter Vendor Name..."
                value={formData.vendorOther}
                onChange={e => setFormData(prev => ({ ...prev, vendorOther: e.target.value }))}
              />
            )}
          </div>
          <div>
            <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">
              Current Rating (Optional)
            </label>
            <div className="p-3 border border-border rounded-md bg-slate-50 flex justify-center">
              <StarRating value={formData.ratingRaw} onChange={v => setFormData(prev => ({ ...prev, ratingRaw: v }))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}