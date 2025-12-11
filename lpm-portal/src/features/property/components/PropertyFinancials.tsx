import { useState } from 'react';
import { DollarSign, Edit2, X } from 'lucide-react';
import { BILLING_FREQUENCIES } from '../../verification/wizard/wizardConfig';
import type { Property } from '../../../dataModel';

interface Props {
  property: Property;
  onUpdate: (id: string, data: Partial<Property>) => void;
}

// Helper to format YYYY-MM-DD to MM/DD/YYYY
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "-";
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
};

// Helper to parse "5 Years" -> { num: 5, unit: "Years" }
const parseTerm = (val: string | undefined) => {
  if (!val) return { num: "" as any, unit: "Years" };
  const num = parseInt(val);
  const unit = val.toLowerCase().includes('month') ? "Months" : "Years";
  return { num: isNaN(num) ? "" : num, unit };
};

export default function PropertyFinancials({ property, onUpdate }: Props) {
  const vendor = property.vendor || {};
  const price = typeof vendor.currentPrice === 'number' ? vendor.currentPrice : 0;
  const priceCapDisplay = property.priceCap ? property.priceCap.replace(' Max', '') : null;

  // -- EDIT STATE --
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    currentPrice: price,
    billingFreq: vendor.billingFrequency || 'Monthly',
    priceCapValue: property.priceCap ? property.priceCap.replace(/[^0-9.]/g, '') : '',
    priceCapUnit: property.priceCap && property.priceCap.includes('$') ? '$' : '%',
    contractStart: property.contractStartDate || '',
    contractEnd: property.contractEndDate || '',
    
    // Split Term State
    initialTermNum: parseTerm(property.initialTerm).num,
    initialTermUnit: parseTerm(property.initialTerm).unit,
    renewalTermNum: parseTerm(property.renewalTerm).num,
    renewalTermUnit: parseTerm(property.renewalTerm).unit,
    
    autoRenews: property.autoRenews ?? false
  });

  const handleEditClick = () => {
    setFormData({
      currentPrice: price,
      billingFreq: vendor.billingFrequency || 'Monthly',
      priceCapValue: property.priceCap ? property.priceCap.replace(/[^0-9.]/g, '') : '',
      priceCapUnit: property.priceCap && property.priceCap.includes('$') ? '$' : '%',
      contractStart: property.contractStartDate || '',
      contractEnd: property.contractEndDate || '',
      
      initialTermNum: parseTerm(property.initialTerm).num,
      initialTermUnit: parseTerm(property.initialTerm).unit,
      renewalTermNum: parseTerm(property.renewalTerm).num,
      renewalTermUnit: parseTerm(property.renewalTerm).unit,
      
      autoRenews: property.autoRenews ?? false
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    // Format Price Cap
    const finalPriceCap = formData.priceCapValue 
      ? (formData.priceCapUnit === '%' ? `${formData.priceCapValue}%` : `$${formData.priceCapValue}`)
      : undefined;

    // Combine Terms
    const finalInitialTerm = formData.initialTermNum ? `${formData.initialTermNum} ${formData.initialTermUnit}` : "";
    const finalRenewalTerm = formData.autoRenews && formData.renewalTermNum 
      ? `${formData.renewalTermNum} ${formData.renewalTermUnit}` 
      : (formData.autoRenews ? "0 Years" : "");

    onUpdate(property.id, {
      contractStartDate: formData.contractStart,
      contractEndDate: formData.contractEnd,
      initialTerm: finalInitialTerm,
      renewalTerm: finalRenewalTerm,
      autoRenews: formData.autoRenews,
      priceCap: finalPriceCap,
      vendor: {
        ...property.vendor,
        currentPrice: Number(formData.currentPrice),
        billingFrequency: formData.billingFreq as any
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-surface rounded-md shadow-lvl1 border border-border p-xl relative">
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-sm">
          <DollarSign className="w-5 h-5 text-brand" /> Financial Overview
        </h2>
        <button 
          onClick={handleEditClick}
          className="text-text-secondary hover:text-brand transition-colors p-1"
          title="Edit Financials"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-6 gap-x-xl gap-y-lg">
        
        {/* Row 1: Monthly Price & Annual Spend */}
        <div className="col-span-3">
          <label className="text-[11px] font-bold text-text-secondary uppercase block">Monthly Base Price</label>
          <span className="text-2xl font-mono text-text-primary block mt-1">
            ${price.toLocaleString()}
          </span>
        </div>
        <div className="col-span-3">
          <label className="text-[11px] font-bold text-text-secondary uppercase block">Annual Spend</label>
          <span className="text-xl font-mono text-text-secondary block mt-1">
            ${(price * 12).toLocaleString()}
          </span>
        </div>
        
        {/* Row 2: Cap, Freq, Invoice */}
        <div className="col-span-2">
          <label className="text-[11px] font-bold text-text-secondary uppercase block">Price Adjustment Cap</label>
          <span className="text-sm font-bold text-brand block mt-1">{priceCapDisplay || "None"}</span>
        </div>
        <div className="col-span-2">
          <label className="text-[11px] font-bold text-text-secondary uppercase block">Billing Frequency</label>
          <span className="text-sm text-text-primary block mt-1">{vendor.billingFrequency || "-"}</span>
        </div>
        <div className="col-span-2">
          <label className="text-[11px] font-bold text-text-secondary uppercase block">Next Invoice Date</label>
          <span className="text-sm text-slate-400 italic block mt-1">Pending...</span>
        </div>

        {/* Divider */}
        <div className="col-span-6 border-t border-dashed border-slate-200 my-1"></div>

        {/* Row 3: Dates & Terms (4 Columns) */}
        <div className="col-span-6 flex justify-between gap-4">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-text-secondary uppercase block">Contract Start</label>
            <span className="text-sm text-text-primary block mt-1">{formatDate(property.contractStartDate)}</span>
          </div>
          
          <div className="flex-1">
            <label className="text-[11px] font-bold text-text-secondary uppercase block">Current Term End</label>
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-sm font-bold text-text-primary">{formatDate(property.contractEndDate)}</span>
              {property.autoRenews !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase w-fit ${
                  property.autoRenews 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {property.autoRenews ? "Auto-Renews" : "Does Not Auto-Renew"}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <label className="text-[11px] font-bold text-text-secondary uppercase block">Initial Term</label>
            <span className="text-sm text-text-primary block mt-1">{property.initialTerm || "-"}</span>
          </div>

          {/* Conditional Renewal Term */}
          {property.autoRenews !== false && (
            <div className="flex-1">
              <label className="text-[11px] font-bold text-text-secondary uppercase block">Renewal Term</label>
              <span className="text-sm text-text-primary block mt-1">{property.renewalTerm || "-"}</span>
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-text-primary">Edit Financials</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Price & Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Monthly Price</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-border rounded text-sm focus:border-brand outline-none"
                    value={formData.currentPrice}
                    onChange={e => setFormData({...formData, currentPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Frequency</label>
                  <select 
                    className="w-full p-2 border border-border rounded text-sm bg-white focus:border-brand outline-none"
                    value={formData.billingFreq}
                    onChange={e => setFormData({...formData, billingFreq: e.target.value as any})}
                  >
                    {BILLING_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Price Cap */}
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Price Adjustment Cap</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 p-2 border border-border rounded text-sm focus:border-brand outline-none"
                    placeholder="e.g. 3 or 500"
                    value={formData.priceCapValue}
                    onChange={e => setFormData({...formData, priceCapValue: e.target.value})}
                  />
                  <select 
                    className="w-20 p-2 border border-border rounded-md bg-white text-sm"
                    value={formData.priceCapUnit}
                    onChange={e => setFormData({...formData, priceCapUnit: e.target.value as any})}
                  >
                    <option value="%">%</option>
                    <option value="$">$</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Contract Start</label>
                  <input 
                    type="date"
                    className="w-full p-2 border border-border rounded text-sm focus:border-brand outline-none"
                    value={formData.contractStart}
                    onChange={e => setFormData({...formData, contractStart: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Contract End</label>
                  <input 
                    type="date"
                    className="w-full p-2 border border-border rounded text-sm focus:border-brand outline-none"
                    value={formData.contractEnd}
                    onChange={e => setFormData({...formData, contractEnd: e.target.value})}
                  />
                </div>
              </div>

              {/* Terms Inputs */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Initial Term</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      className="flex-1 p-2 border border-border rounded text-sm focus:border-brand outline-none"
                      value={formData.initialTermNum}
                      onChange={e => setFormData({...formData, initialTermNum: Number(e.target.value)})}
                    />
                    <select 
                      className="w-32 p-2 border border-border rounded-md bg-white text-sm"
                      value={formData.initialTermUnit}
                      onChange={e => setFormData({...formData, initialTermUnit: e.target.value})}
                    >
                      <option>Years</option>
                      <option>Months</option>
                    </select>
                  </div>
                </div>
                
                {formData.autoRenews && (
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Renewal Term</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        className="flex-1 p-2 border border-border rounded text-sm focus:border-brand outline-none"
                        value={formData.renewalTermNum}
                        onChange={e => setFormData({...formData, renewalTermNum: Number(e.target.value)})}
                      />
                      <select 
                        className="w-32 p-2 border border-border rounded-md bg-white text-sm"
                        value={formData.renewalTermUnit}
                        onChange={e => setFormData({...formData, renewalTermUnit: e.target.value})}
                      >
                        <option>Years</option>
                        <option>Months</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto Renew */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded text-brand focus:ring-brand w-4 h-4"
                    checked={formData.autoRenews}
                    onChange={e => setFormData({...formData, autoRenews: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-text-primary">Does this contract Auto-Renew?</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-brand text-white text-sm font-bold rounded shadow-sm hover:bg-brand-dark"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}