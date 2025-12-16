import { useState } from 'react';
import { Edit2, Hash, FileText, Building, Phone } from 'lucide-react';
import { StarRating } from '../../../../components/ui/StarRating';
import { VENDORS } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';

export default function Step4_VendorDetails({ formData, setFormData }: StepProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* VENDOR CARD */}
      <div className="glass-panel p-5 rounded-xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest">Selected Vendor</span>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-[10px] font-bold text-brand dark:text-blue-400 hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            {isEditing ? "Confirm" : "Change"} <Edit2 className="w-3 h-3" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4 animate-in fade-in">
            <select 
              className="w-full p-2 bg-white dark:bg-black/40 border border-border dark:border-white/10 rounded-md text-sm text-text-primary dark:text-white outline-none"
              value={formData.vendorName}
              onChange={e => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
            >
              {VENDORS.map(v => <option key={v} value={v} className="text-black">{v}</option>)}
            </select>
            
            {formData.vendorName === 'Other' && (
              <input 
                className="w-full p-2 bg-white dark:bg-black/40 border border-border dark:border-white/10 rounded-md text-sm text-text-primary dark:text-white outline-none"
                placeholder="Enter Vendor Name..."
                value={formData.vendorOther}
                onChange={e => setFormData(prev => ({ ...prev, vendorOther: e.target.value }))}
              />
            )}

            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-text-secondary dark:text-slate-400">Rating:</span>
              <StarRating value={formData.ratingRaw} onChange={v => setFormData(prev => ({ ...prev, ratingRaw: v }))} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-text-primary dark:text-white">
              {formData.vendorName === 'Other' ? formData.vendorOther : formData.vendorName}
            </p>
            <StarRating value={formData.ratingRaw} readonly />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <InputSlot label="Account Number" icon={Hash} value={formData.accountNumber} onChange={(e: any) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))} />
        </div>
        <InputSlot label="Bill To #" icon={FileText} value={formData.billTo} onChange={(e: any) => setFormData(prev => ({ ...prev, billTo: e.target.value }))} />
        <InputSlot label="Building ID" icon={Building} value={formData.buildingId} onChange={(e: any) => setFormData(prev => ({ ...prev, buildingId: e.target.value }))} />
        <div className="col-span-2">
          <InputSlot label="Service Instructions" icon={Phone} value={formData.serviceInstructions} onChange={(e: any) => setFormData(prev => ({ ...prev, serviceInstructions: e.target.value }))} />
        </div>
      </div>
    </div>
  );
}

// --- HELPER INPUT SLOT (Moved Outside) ---
const InputSlot = ({ label, value, onChange, icon: Icon }: any) => (
  <div className="group">
    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
      {label}
    </label>
    <div className="relative flex items-center bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm">
      {Icon && <div className="pl-3 text-text-secondary dark:text-slate-500"><Icon className="w-3.5 h-3.5" /></div>}
      <input 
        className="w-full bg-transparent border-none outline-none text-sm px-3 py-2.5 text-text-primary dark:text-white placeholder:text-slate-400/50"
        value={value || ""}
        onChange={onChange}
        placeholder="Optional"
      />
      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
    </div>
  </div>
);