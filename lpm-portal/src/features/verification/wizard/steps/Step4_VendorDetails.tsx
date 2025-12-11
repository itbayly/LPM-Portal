import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { StarRating } from '../../../../components/ui/StarRating';
import { VENDORS } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';

export default function Step4_VendorDetails({ formData, setFormData }: StepProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* EDITABLE VENDOR BLOCK */}
      <div className="bg-slate-50 p-4 rounded-md border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-text-secondary uppercase">Current Vendor</span>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
          >
            {isEditing ? "Done" : "Edit"} <Edit2 className="w-3 h-3" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4 animate-in fade-in">
            <select 
              className="w-full p-2 border border-border rounded-md bg-white focus:border-brand outline-none text-sm"
              value={formData.vendorName}
              onChange={e => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
            >
              {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            
            {formData.vendorName === 'Other' && (
              <input 
                className="w-full p-2 border border-border rounded-md focus:border-brand outline-none"
                placeholder="Enter Vendor Name..."
                value={formData.vendorOther}
                onChange={e => setFormData(prev => ({ ...prev, vendorOther: e.target.value }))}
              />
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm">Rating:</span>
              <StarRating value={formData.ratingRaw} onChange={v => setFormData(prev => ({ ...prev, ratingRaw: v }))} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="font-bold text-text-primary">
              {formData.vendorName === 'Other' ? formData.vendorOther : formData.vendorName}
            </p>
            <StarRating value={formData.ratingRaw} readonly />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Account Number (Optional)</label>
          <input 
            className="w-full p-2 border border-border rounded-md" 
            value={formData.accountNumber} 
            onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))} 
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Bill To # (Optional)</label>
          <input 
            className="w-full p-2 border border-border rounded-md" 
            value={formData.billTo} 
            onChange={e => setFormData(prev => ({ ...prev, billTo: e.target.value }))} 
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Building ID (Optional)</label>
          <input 
            className="w-full p-2 border border-border rounded-md" 
            value={formData.buildingId} 
            onChange={e => setFormData(prev => ({ ...prev, buildingId: e.target.value }))} 
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">How to Place Service Call (Optional)</label>
          <input 
            className="w-full p-2 border border-border rounded-md" 
            value={formData.serviceInstructions} 
            onChange={e => setFormData(prev => ({ ...prev, serviceInstructions: e.target.value }))} 
          />
        </div>
      </div>
    </div>
  );
}