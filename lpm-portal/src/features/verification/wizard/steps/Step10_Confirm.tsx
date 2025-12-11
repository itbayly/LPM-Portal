import { Check } from 'lucide-react';
import type { StepProps } from '../wizardConfig';

export default function Step10_Confirm({ formData }: StepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-green-50 border border-green-200 p-6 rounded-md text-center">
        <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-green-900">Ready to Save</h3>
        <p className="text-green-800 text-sm">Please confirm the details below are correct.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <span className="block text-xs font-bold text-text-secondary uppercase">Vendor</span>
          <span className="block font-medium">
            {formData.vendorName === 'Other' ? formData.vendorOther : formData.vendorName}
          </span>
        </div>
        <div>
          <span className="block text-xs font-bold text-text-secondary uppercase">Price</span>
          <span className="block font-medium">${formData.currentPrice} / {formData.billingFreq}</span>
        </div>
        <div>
          <span className="block text-xs font-bold text-text-secondary uppercase">Term</span>
          <span className="block font-medium">{formData.initialTermNum} {formData.initialTermUnit}</span>
        </div>
        <div>
          <span className="block text-xs font-bold text-text-secondary uppercase">End Date</span>
          <span className="block font-medium">{formData.contractEnd}</span>
        </div>
        {formData.hasPriceCap && (
          <div>
            <span className="block text-xs font-bold text-text-secondary uppercase">Price Cap</span>
            <span className="block font-medium text-brand">
              {formData.priceCapUnit === '$' ? `$${formData.priceCapValue}` : `${formData.priceCapValue}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}