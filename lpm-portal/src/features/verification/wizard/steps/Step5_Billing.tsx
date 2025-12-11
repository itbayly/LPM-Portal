import { DollarSign } from 'lucide-react';
import { BILLING_FREQUENCIES } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';

export default function Step5_Billing({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">
          Current Monthly Price <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary" />
          <input 
            type="number"
            className="w-full pl-10 p-3 border border-border rounded-md focus:border-brand outline-none"
            value={formData.currentPrice}
            onChange={e => setFormData(prev => ({ ...prev, currentPrice: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">Billing Frequency</label>
        <select 
          className="w-full p-3 border border-border rounded-md bg-white focus:border-brand outline-none"
          value={formData.billingFreq}
          onChange={e => setFormData(prev => ({ ...prev, billingFreq: e.target.value as any }))}
        >
          {BILLING_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Price Adjustment Cap */}
      <div className="pt-4 border-t border-border">
        <label className="flex items-center gap-2 font-bold text-text-primary cursor-pointer mb-3">
          <input 
            type="checkbox" 
            className="rounded text-brand focus:ring-brand" 
            checked={formData.hasPriceCap} 
            onChange={e => setFormData(prev => ({ ...prev, hasPriceCap: e.target.checked }))} 
          />
          Is there a price adjustment cap?
        </label>

        {formData.hasPriceCap && (
          <div className="pl-6 animate-in slide-in-from-top-2">
            <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">
              Cap Amount / Percentage <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input 
                className="flex-1 p-2 border border-border rounded-md focus:border-brand outline-none"
                placeholder="e.g. 3 or 500"
                value={formData.priceCapValue}
                onChange={e => setFormData(prev => ({ ...prev, priceCapValue: e.target.value }))}
              />
              <select 
                className="w-20 p-2 border border-border rounded-md bg-white"
                value={formData.priceCapUnit}
                onChange={e => setFormData(prev => ({ ...prev, priceCapUnit: e.target.value as any }))}
              >
                <option value="%">%</option>
                <option value="$">$</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}