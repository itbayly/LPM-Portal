import React, { useState, useEffect } from 'react';
import { 
  X, ChevronRight, ChevronLeft, UploadCloud, DollarSign, 
  FileText, Mail, Copy, Check, Plus, Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { StarRating } from '../../components/ui/StarRating';
import { useAuth } from '../auth/AuthContext';
import type { Property, Contact } from '../../dataModel';

interface VerificationWizardProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

const VENDORS = ["Schindler", "Otis", "TK Elevator", "KONE", "Other"];
const BILLING_FREQUENCIES = ["Monthly", "Quarterly", "Semi-Annual", "Annual"];

const CHECKLIST_ITEMS = [
  "Fully Executed Service Contract",
  "Current Monthly Price",
  "Billing Frequency",
  "Current contract end date",
  "Account/Contract Number and Bill To Number",
  "Assigned point of contact"
];

export default function VerificationWizard({ property, isOpen, onClose, onComplete }: VerificationWizardProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showEmailScreen, setShowEmailScreen] = useState(false);

  // -- STATE MANAGEMENT --
  
  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Contact State (for Step 8)
  const [tempContact, setTempContact] = useState<Partial<Contact>>({ name: '', role: '', phone: '', email: '' });
  const [isAddingContact, setIsAddingContact] = useState(false);

  // Helper to parse terms
  const parseTerm = (val: string | undefined) => {
    if (!val) return { num: 5, unit: "Years" };
    const num = parseInt(val);
    const unit = val.toLowerCase().includes('month') ? "Months" : "Years";
    return { num: isNaN(num) ? 5 : num, unit };
  };

  // Main Form Data
  const [formData, setFormData] = useState({
    // Step 1 & 2
    hasElevators: null as boolean | null,
    hasProvider: null as boolean | null,

    // Step 4: Vendor
    vendorName: property.vendor?.name || "",
    vendorOther: "",
    unitCount: property.unitCount || 1,
    ratingRaw: property.vendor?.rating || 0,
    onNationalContract: property.onNationalContract || false,
    accountNumber: property.vendor?.accountNumber || "",
    billTo: property.billTo || "",
    buildingId: property.buildingId || "",
    serviceInstructions: property.vendor?.serviceInstructions || "",

    // Step 5: Billing
    currentPrice: property.vendor?.currentPrice || 0,
    billingFreq: property.vendor?.billingFrequency || "Monthly",

    // Step 6: Contract Terms
    contractStart: property.contractStartDate || "",
    contractEnd: property.contractEndDate || "",
    
    initialTermNum: parseTerm(property.initialTerm).num,
    initialTermUnit: parseTerm(property.initialTerm).unit,
    
    autoRenews: property.autoRenews !== false, // Default to true unless explicitly false
    renewalTermNum: parseTerm(property.renewalTerm).num,
    renewalTermUnit: parseTerm(property.renewalTerm).unit,
    
    calculatedEnd: "",
    overrideEndDate: false,

    // Step 7: Cancellation
    noticeDaysMin: 90,
    noticeDaysMax: 120,
    hasPenalty: !!property.earlyTerminationPenalty,
    penaltyType: "percentage" as "percentage" | "fixed",
    penaltyValue: property.earlyTerminationPenalty || "",

    // Step 8: Contacts
    contacts: property.contacts || [],

    // Step 9: Files
    files: [] as File[]
  });

  // -- SMART RESUME LOGIC --
  useEffect(() => {
    if (isOpen) {
      // If we have Vendor & Units but NO Contract Date, skip to Step 3 (Checklist)
      if (property.vendor?.name && property.unitCount && !property.contractStartDate) {
        setFormData(prev => ({
          ...prev,
          hasElevators: true,
          hasProvider: true
        }));
        setStep(3);
      }
    }
  }, [isOpen, property]);

  // -- DATE CALCULATOR (Step 6) --
  useEffect(() => {
    if (formData.contractStart && !formData.overrideEndDate) {
      const start = new Date(formData.contractStart);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        
        // Add Term
        if (formData.initialTermUnit === "Years") {
          end.setFullYear(end.getFullYear() + Number(formData.initialTermNum));
        } else {
          end.setMonth(end.getMonth() + Number(formData.initialTermNum));
        }

        // Subtract 1 Day (Coverage Logic)
        end.setDate(end.getDate() - 1);

        setFormData(prev => ({ 
          ...prev, 
          calculatedEnd: end.toISOString().split('T')[0],
          contractEnd: end.toISOString().split('T')[0] // Auto-set display value
        }));
      }
    }
  }, [formData.contractStart, formData.initialTermNum, formData.initialTermUnit, formData.overrideEndDate]);

  // -- HANDLERS --

  const handleCopyEmail = () => {
    const addressString = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
    const text = `Subject: Request for Elevator Service Agreement - ${property.name}

Hi,

Could you please provide the following information for ${property.name} (${addressString}):

1. Copy of the fully executed service agreement
2. Current monthly price
3. Billing Frequency
4. Current contract end date
5. Our Account/Contract Number and Bill To Number
6. Confirm our assigned point of contact

Thanks,
${profile?.name || "Property Manager"}`;

    navigator.clipboard.writeText(text);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).slice(0, 3 - formData.files.length);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  const handleAddContact = () => {
    if (!tempContact.name || !tempContact.email) return;
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name: tempContact.name!,
      role: tempContact.role || 'Point of Contact',
      phone: tempContact.phone || '',
      email: tempContact.email!
    };
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
    setTempContact({ name: '', role: '', phone: '', email: '' });
    setIsAddingContact(false);
  };

  const handleDeleteContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== id)
    }));
  };

  // -- NAVIGATION LOGIC --

  const handleNext = () => {
    // STEP 1: No Elevators -> Exit
    if (step === 1 && formData.hasElevators === false) {
      if(confirm("Confirming: This property has NO elevators? This will clear existing vendor data.")) {
        onComplete({ status: 'no_elevators', clearData: true });
      }
      return;
    }

    // STEP 2: No Provider -> Exit to RPM Review
    if (step === 2 && formData.hasProvider === false) {
      alert("This property will be flagged for Regional PM review.");
      onComplete({ status: 'pending_review' });
      return;
    }

    // STEP 3: Checklist Gate
    if (step === 3) {
      if (checkedItems.length < CHECKLIST_ITEMS.length) {
        // Missing items -> Show Email Screen
        setShowEmailScreen(true);
        return;
      }
    }

    // STEP 8: Contact Validation
    if (step === 8) {
      if (formData.contacts.length === 0 && !isAddingContact) {
        alert("Please add at least one point of contact.");
        setIsAddingContact(true);
        return;
      }
      // If user typed in box but didn't click "Add", try to add it for them
      if (isAddingContact && tempContact.name) {
        handleAddContact();
      }
    }

    // FINAL STEP
    if (step === 10) {
      let finalStatus = 'active_contract';
      if (formData.vendorName === 'Schindler' && formData.onNationalContract) {
        finalStatus = 'on_national_agreement';
      }
      
      // Auto-Renew Logic cleanup
      const renewalVal = formData.autoRenews 
        ? `${formData.renewalTermNum} ${formData.renewalTermUnit}`
        : "0 Years";

      onComplete({ 
        ...formData, 
        initialTerm: `${formData.initialTermNum} ${formData.initialTermUnit}`,
        renewalTerm: renewalVal,
        cancellationWindow: formData.autoRenews ? `${formData.noticeDaysMax} - ${formData.noticeDaysMin} Days` : "N/A",
        status: finalStatus 
      });
      return;
    }

    setStep(s => s + 1);
  };

  const handleSavePartial = () => {
    // Saves Step 1 & 2 data (Vendor/Units) but keeps status 'missing_data'
    onComplete({
      ...formData,
      status: 'missing_data'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[700px] h-[700px] rounded-lg shadow-lvl3 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-border bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Data Verification</h2>
            <p className="text-sm text-text-secondary">Step {step} of 10</p>
          </div>
          <button onClick={onClose}><X className="w-6 h-6 text-text-secondary hover:text-text-primary" /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* STEP 1: ELEVATORS */}
          {step === 1 && (
            <div className="space-y-6">
              <label className="text-lg font-bold text-text-primary block">Does this property have elevators on site?</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setFormData({...formData, hasElevators: true})}
                  className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasElevators === true ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
                >
                  Yes
                </button>
                <button 
                  onClick={() => setFormData({...formData, hasElevators: false})}
                  className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasElevators === false ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
                >
                  No
                </button>
              </div>

              {formData.hasElevators && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">Number of Elevators</label>
                  <input 
                    type="number"
                    className="w-full p-3 border border-border rounded-md focus:border-brand outline-none"
                    value={formData.unitCount}
                    onChange={e => setFormData({...formData, unitCount: Number(e.target.value)})}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PROVIDER */}
          {step === 2 && (
            <div className="space-y-6">
              <label className="text-lg font-bold text-text-primary block">Do you have a current Service Provider?</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setFormData({...formData, hasProvider: true})}
                  className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasProvider === true ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
                >
                  Yes
                </button>
                <button 
                  onClick={() => setFormData({...formData, hasProvider: false})}
                  className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasProvider === false ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
                >
                  No
                </button>
              </div>

              {formData.hasProvider && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">Vendor Name</label>
                    <select 
                      className="w-full p-3 border border-border rounded-md bg-white focus:border-brand outline-none"
                      value={formData.vendorName}
                      onChange={e => setFormData({...formData, vendorName: e.target.value})}
                    >
                      <option value="">Select Vendor...</option>
                      {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">Current Rating</label>
                    <div className="p-3 border border-border rounded-md bg-slate-50 flex justify-center">
                      <StarRating value={formData.ratingRaw} onChange={v => setFormData({...formData, ratingRaw: v})} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: DOCUMENT CHECKLIST OR EMAIL */}
          {step === 3 && (
            <>
              {!showEmailScreen ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-text-primary">Do you have all of the information below?</h3>
                  <div className="space-y-2">
                    {CHECKLIST_ITEMS.map(item => (
                      <label key={item} className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-slate-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
                          checked={checkedItems.includes(item)}
                          onChange={(e) => {
                            if (e.target.checked) setCheckedItems([...checkedItems, item]);
                            else setCheckedItems(checkedItems.filter(i => i !== item));
                          }}
                        />
                        <span className="text-sm font-medium text-text-primary">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-6 animate-in fade-in">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5" /> Missing Information
                  </h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Since you don't have all the required documents, please email your account manager. We will save your progress.
                  </p>
                  
                  <button 
                    onClick={handleCopyEmail}
                    className="w-full py-2 bg-white border border-blue-200 rounded text-sm font-bold text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors mb-4"
                  >
                    {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {emailCopied ? "Copied to Clipboard!" : "Copy Draft Email"}
                  </button>

                  <button
                    onClick={handleSavePartial}
                    className="w-full py-3 bg-brand text-white font-bold rounded-md shadow-sm hover:bg-brand-dark"
                  >
                    Save & Exit (Pending Data)
                  </button>
                </div>
              )}
            </>
          )}

          {/* STEP 4: VENDOR DETAILS */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-md border border-border flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-text-secondary uppercase">Current Vendor</span>
                  <p className="font-bold text-text-primary">{formData.vendorName}</p>
                </div>
                <StarRating value={formData.ratingRaw} readonly />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Account Number <span className="text-red-500">*</span></label>
                  <input className="w-full p-2 border border-border rounded-md" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Bill To # (Optional)</label>
                  <input className="w-full p-2 border border-border rounded-md" value={formData.billTo} onChange={e => setFormData({...formData, billTo: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Building ID (Optional)</label>
                  <input className="w-full p-2 border border-border rounded-md" value={formData.buildingId} onChange={e => setFormData({...formData, buildingId: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">How to Place Service Call (Optional)</label>
                  <input className="w-full p-2 border border-border rounded-md" value={formData.serviceInstructions} onChange={e => setFormData({...formData, serviceInstructions: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BILLING */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">Current Monthly Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary" />
                  <input 
                    type="number"
                    className="w-full pl-10 p-3 border border-border rounded-md focus:border-brand outline-none"
                    value={formData.currentPrice}
                    onChange={e => setFormData({...formData, currentPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">Billing Frequency</label>
                <select 
                  className="w-full p-3 border border-border rounded-md bg-white focus:border-brand outline-none"
                  value={formData.billingFreq}
                  onChange={e => setFormData({...formData, billingFreq: e.target.value as any})}
                >
                  {BILLING_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* STEP 6: TERMS */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Original Start Date</label>
                  <input type="date" className="w-full p-2 border border-border rounded-md" 
                    value={formData.contractStart} onChange={e => setFormData({...formData, contractStart: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Initial Term Length</label>
                  <div className="flex gap-2">
                    <input type="number" className="flex-1 p-2 border border-border rounded-md" 
                      value={formData.initialTermNum} onChange={e => setFormData({...formData, initialTermNum: Number(e.target.value)})} />
                    <select className="w-24 p-2 border border-border rounded-md bg-white"
                      value={formData.initialTermUnit} onChange={e => setFormData({...formData, initialTermUnit: e.target.value})}>
                      <option>Years</option>
                      <option>Months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Auto-Renew Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-border">
                <span className="font-bold text-sm text-text-primary">Does this contract auto-renew?</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFormData({...formData, autoRenews: true})}
                    className={cn("px-3 py-1 rounded text-sm font-bold", formData.autoRenews ? "bg-brand text-white" : "bg-white border text-text-secondary")}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, autoRenews: false})}
                    className={cn("px-3 py-1 rounded text-sm font-bold", !formData.autoRenews ? "bg-brand text-white" : "bg-white border text-text-secondary")}
                  >
                    No
                  </button>
                </div>
              </div>

              {formData.autoRenews && (
                <div className="animate-in fade-in">
                  <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Renewal Term Length</label>
                  <div className="flex gap-2">
                    <input type="number" className="flex-1 p-2 border border-border rounded-md" 
                      value={formData.renewalTermNum} onChange={e => setFormData({...formData, renewalTermNum: Number(e.target.value)})} />
                    <select className="w-24 p-2 border border-border rounded-md bg-white"
                      value={formData.renewalTermUnit} onChange={e => setFormData({...formData, renewalTermUnit: e.target.value})}>
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
                    <button onClick={() => setFormData({...formData, overrideEndDate: true})} className="text-xs text-brand font-bold hover:underline">
                      Override Calculation
                    </button>
                  )}
                </div>
                <input 
                  type="date" 
                  className={cn("w-full p-2 border rounded-md", !formData.overrideEndDate ? "bg-slate-100 text-slate-600" : "bg-white border-brand")}
                  value={formData.contractEnd} 
                  disabled={!formData.overrideEndDate}
                  onChange={e => setFormData({...formData, contractEnd: e.target.value})} 
                />
                {!formData.overrideEndDate && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Auto-calculated: Start Date + Initial Term - 1 Day
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: TERMINATION */}
          {step === 7 && (
            <div className="space-y-6">
              {formData.autoRenews && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Not Before (Days)</label>
                    <input type="number" className="w-full p-2 border border-border rounded-md" 
                      value={formData.noticeDaysMax} onChange={e => setFormData({...formData, noticeDaysMax: Number(e.target.value)})} />
                    <p className="text-[10px] text-slate-400 mt-1">Leave blank if contract doesn't specify.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary mb-1 block">Not Less Than (Days)</label>
                    <input type="number" className="w-full p-2 border border-border rounded-md" 
                      value={formData.noticeDaysMin} onChange={e => setFormData({...formData, noticeDaysMin: Number(e.target.value)})} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <label className="flex items-center gap-2 font-bold text-text-primary cursor-pointer mb-3">
                  <input type="checkbox" className="rounded text-brand focus:ring-brand" 
                    checked={formData.hasPenalty} onChange={e => setFormData({...formData, hasPenalty: e.target.checked})} />
                  Is there a penalty for early termination?
                </label>

                {formData.hasPenalty && (
                  <div className="pl-6 space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="ptype" className="text-brand focus:ring-brand"
                          checked={formData.penaltyType === 'percentage'} onChange={() => setFormData({...formData, penaltyType: 'percentage'})} />
                        <span className="text-sm">% of Remaining Term</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="ptype" className="text-brand focus:ring-brand"
                          checked={formData.penaltyType === 'fixed'} onChange={() => setFormData({...formData, penaltyType: 'fixed'})} />
                        <span className="text-sm">Fixed Buyout ($)</span>
                      </label>
                    </div>
                    <input 
                      type={formData.penaltyType === 'fixed' ? "number" : "text"}
                      className="w-full p-2 border border-border rounded-md focus:border-brand outline-none"
                      placeholder={formData.penaltyType === 'fixed' ? "e.g. 5000" : "e.g. 50"}
                      value={formData.penaltyValue}
                      onChange={e => setFormData({...formData, penaltyValue: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: CONTACTS */}
          {step === 8 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-text-primary">Confirm Point of Contact</h3>
              
              {/* Existing List */}
              {formData.contacts.length > 0 && !isAddingContact && (
                <div className="space-y-2">
                  {formData.contacts.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-md">
                      <div>
                        <p className="font-bold text-sm text-text-primary">{c.name}</p>
                        <p className="text-xs text-text-secondary">{c.role} • {c.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteContact(c.id)} className="p-2 text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsAddingContact(true)}
                    className="w-full py-2 border-2 border-dashed border-border rounded-md text-brand font-bold text-sm hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Another Contact
                  </button>
                </div>
              )}

              {/* Add Form (Shows if no contacts OR user clicks add) */}
              {(formData.contacts.length === 0 || isAddingContact) && (
                <div className="bg-slate-50 p-4 rounded-md border border-border space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold uppercase text-text-secondary">New Contact</h4>
                    {formData.contacts.length > 0 && (
                      <button onClick={() => setIsAddingContact(false)} className="text-xs text-slate-500 hover:text-slate-800">Cancel</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-text-secondary block mb-1">Name</label>
                      <input className="w-full p-2 border rounded-md" placeholder="Jane Doe" 
                        value={tempContact.name} onChange={e => setTempContact({...tempContact, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-secondary block mb-1">Role</label>
                      <input className="w-full p-2 border rounded-md" placeholder="Property Manager" 
                        value={tempContact.role} onChange={e => setTempContact({...tempContact, role: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-secondary block mb-1">Email</label>
                      <input className="w-full p-2 border rounded-md" placeholder="jane@email.com" 
                        value={tempContact.email} onChange={e => setTempContact({...tempContact, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-secondary block mb-1">Phone</label>
                      <input className="w-full p-2 border rounded-md" placeholder="(555) 123-4567" 
                        value={tempContact.phone} onChange={e => setTempContact({...tempContact, phone: e.target.value})} />
                    </div>
                  </div>
                  <button 
                    onClick={handleAddContact}
                    disabled={!tempContact.name || !tempContact.email}
                    className="w-full py-2 bg-brand text-white font-bold rounded-md disabled:opacity-50"
                  >
                    Save Contact
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 9: UPLOAD */}
          {step === 9 && (
            <div className="space-y-6 text-center">
              <div 
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-300 rounded-lg h-64 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-text-primary">Drag & Drop Contract PDF</p>
                <p className="text-sm text-text-secondary">or click to browse (Max 3 files)</p>
              </div>

              {formData.files.length > 0 && (
                <div className="space-y-2 text-left">
                  <h4 className="text-xs font-bold uppercase text-text-secondary">Attached Files:</h4>
                  {formData.files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white border border-border rounded-md">
                      <FileText className="w-4 h-4 text-brand" />
                      <span className="text-sm truncate flex-1">{f.name}</span>
                      <button onClick={() => setFormData(prev => ({...prev, files: prev.files.filter((_, idx) => idx !== i)}))}>
                        <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 10: CONFIRM */}
          {step === 10 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-6 rounded-md text-center">
                <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-green-900">Ready to Save</h3>
                <p className="text-green-800 text-sm">Please confirm the details below are correct.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="block text-xs font-bold text-text-secondary uppercase">Vendor</span>
                  <span className="block font-medium">{formData.vendorName === 'Other' ? formData.vendorOther : formData.vendorName}</span>
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
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-border bg-slate-50 flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-medium">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div></div>}

          {!showEmailScreen && (
            <button 
              onClick={handleNext}
              className="px-6 py-2 bg-brand text-white rounded-md font-bold shadow-sm hover:bg-brand-dark flex items-center gap-2"
            >
              {step === 10 
                ? (property.status === 'active_contract' || property.status === 'on_national_agreement' ? "Update Information" : "Verify & Complete")
                : "Next"}
              {step < 10 && <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
