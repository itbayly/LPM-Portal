import React, { useState, useEffect } from 'react';
import { 
  X, ChevronRight, ChevronLeft, UploadCloud, DollarSign, 
  FileText, AlertCircle, Mail, Copy, Check 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { StarRating } from '../../components/ui/StarRating';
import { useAuth } from '../auth/AuthContext';
import type { Property } from '../../dataModel';

interface VerificationWizardProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

const VENDORS = ["Schindler", "Otis", "TK Elevator", "KONE", "Other"];
const BILLING_FREQUENCIES = ["Monthly", "Quarterly", "Semi-Annual", "Annual"];

export default function VerificationWizard({ property, isOpen, onClose, onComplete }: VerificationWizardProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [emailCopied, setEmailCopied] = useState(false);

  // Helper to parse "5 Years" or "5" into number/unit
  const parseTerm = (val: string | undefined) => {
    if (!val) return { num: 5, unit: "Years" };
    const num = parseInt(val);
    const unit = val.toLowerCase().includes('month') ? "Months" : "Years";
    return { num: isNaN(num) ? 5 : num, unit };
  };

  // -- FORM STATE --
  const [formData, setFormData] = useState({
    // Screen 1: Triage
    hasElevators: null as boolean | null,
    hasProvider: null as boolean | null,

    // Screen 2: Docs
    hasContract: null as boolean | null,

    // Screen 3: Vendor
    vendorName: property.vendor?.name || "",
    vendorOther: "",
    unitCount: property.unitCount || 1,
    ratingRaw: property.vendor?.rating || 0,

    // Screen 4: Billing
    currentPrice: property.vendor?.currentPrice || 0,
    billingFreq: property.vendor?.billingFrequency || "Monthly",

    // Screen 5: Terms
    contractStart: property.contractStartDate || "",
    contractEnd: property.contractEndDate || "",
    
    // Auto-populate split fields
    initialTermNum: parseTerm(property.initialTerm).num,
    initialTermUnit: parseTerm(property.initialTerm).unit,
    renewalTermNum: parseTerm(property.renewalTerm).num,
    renewalTermUnit: parseTerm(property.renewalTerm).unit,
    
    calculatedEnd: "",

    // Screen 6: Cancellation
    noticeDaysMin: 90,
    noticeDaysMax: 120,
    hasPenalty: false,
    penaltyType: "percentage" as "percentage" | "fixed",
    penaltyValue: "",

    // Screen 7: Files
    files: [] as File[]
  });

  // -- CALCULATORS --
  useEffect(() => {
    if (formData.contractStart) {
      const start = new Date(formData.contractStart);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        
        if (formData.initialTermUnit === "Years") {
          end.setFullYear(end.getFullYear() + Number(formData.initialTermNum));
        } else {
          end.setMonth(end.getMonth() + Number(formData.initialTermNum));
        }

        const now = new Date();
        let safety = 0;
        while (end < now && safety < 50) {
           if (formData.renewalTermUnit === "Years") {
             end.setFullYear(end.getFullYear() + Number(formData.renewalTermNum));
           } else {
             end.setMonth(end.getMonth() + Number(formData.renewalTermNum));
           }
           safety++;
        }

        setFormData(prev => ({ ...prev, calculatedEnd: end.toISOString().split('T')[0] }));
      }
    }
  }, [formData.contractStart, formData.initialTermNum, formData.initialTermUnit, formData.renewalTermNum, formData.renewalTermUnit]);

  // -- HANDLERS --
  const handleCopyEmail = () => {
    const addressString = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
    
    // UPDATED: Item 5 now says "Our Account..."
    const text = `Subject: Request for Elevator Service Agreement - ${property.name}

Hi,

Could you please provide the following information for ${property.name} (${addressString}):

1. Copy of the fully executed service agreement
2. Current monthly price
3. Billing Frequency
4. Current contract end date
5. Our Account/Contract Number and Bill To Number

Please also confirm that you are still our assigned point of contact.

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

  // -- LOGIC GATES --
  const handleNoElevators = () => {
    if(confirm("Confirming: This property has NO elevators? This will clear existing vendor data.")) {
      onComplete({ status: 'no_elevators', clearData: true });
    }
  };

  const handleNoProvider = () => {
    alert("This property will be flagged for Regional PM review.");
    onComplete({ status: 'pending_rpm_review' });
  };

  const handleEmailSentExit = () => {
    // In a real app, this would write a "snooze" date to the DB
    alert("System updated: We will remind you to check for the contract again in 7 days.");
    onClose();
  };

  const handleNext = () => {
    if (step === 8) {
      onComplete({ ...formData, status: 'active' });
      return;
    }
    setStep(s => s + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[700px] h-[650px] rounded-lg shadow-lvl3 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-border bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Data Verification</h2>
            <p className="text-sm text-text-secondary">Step {step} of 8</p>
          </div>
          <button onClick={onClose}><X className="w-6 h-6 text-text-secondary hover:text-text-primary" /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* SCREEN 1: TRIAGE */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-lg font-bold text-text-primary block">Does this property have elevators on site?</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setFormData({...formData, hasElevators: true})}
                    className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasElevators === true ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={handleNoElevators}
                    className="flex-1 py-4 border-2 rounded-md font-bold transition-all border-border hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    No
                  </button>
                </div>
              </div>

              {formData.hasElevators && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <label className="text-lg font-bold text-text-primary block">Do you have a current service provider?</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setFormData({...formData, hasProvider: true}); setStep(2); }}
                      className="flex-1 py-4 border-2 rounded-md font-bold transition-all border-border hover:border-brand hover:text-brand"
                    >
                      Yes
                    </button>
                    <button 
                      onClick={handleNoProvider}
                      className="flex-1 py-4 border-2 rounded-md font-bold transition-all border-border hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 2: DOC CHECK */}
          {step === 2 && (
            <div className="space-y-6">
              <label className="text-lg font-bold text-text-primary block">Do you have a copy of the fully executed service agreement?</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setFormData({...formData, hasContract: true})}
                  className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasContract === true ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
                >
                  Yes, I have it
                </button>
                <button 
                  onClick={() => setFormData({...formData, hasContract: false})}
                  className={cn("flex-1 py-4 border-2 rounded-md font-bold transition-all", formData.hasContract === false ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300")}
                >
                  No, I need to request it
                </button>
              </div>

              {formData.hasContract === false && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mt-4 animate-in fade-in">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5" /> Action Required: Email Account Manager
                  </h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Please email <strong>{property.accountManager?.name || "your rep"}</strong> ({property.accountManager?.email || "email unknown"}) to request the missing data.
                  </p>
                  
                  <button 
                    onClick={handleCopyEmail}
                    className="w-full py-2 bg-white border border-blue-200 rounded text-sm font-bold text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
                  >
                    {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {emailCopied ? "Copied to Clipboard!" : "Copy Draft Email"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: VENDOR INFO */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-text-secondary">Vendor Name</label>
                <select 
                  className="w-full p-3 border border-border rounded-md bg-white focus:border-brand outline-none"
                  value={formData.vendorName}
                  onChange={e => setFormData({...formData, vendorName: e.target.value})}
                >
                  <option value="">Select Vendor...</option>
                  {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {formData.vendorName === 'Other' && (
                  <input 
                    className="w-full p-3 border border-border rounded-md mt-2 focus:border-brand outline-none"
                    placeholder="Type vendor name..."
                    value={formData.vendorOther}
                    onChange={e => setFormData({...formData, vendorOther: e.target.value})}
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-text-secondary">Number of Elevators</label>
                <input 
                  type="number"
                  className="w-full p-3 border border-border rounded-md focus:border-brand outline-none"
                  value={formData.unitCount}
                  onChange={e => setFormData({...formData, unitCount: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-text-secondary">Current Vendor Rating</label>
                <div className="p-4 bg-slate-50 border border-border rounded-md flex justify-center">
                  <StarRating value={formData.ratingRaw} onChange={v => setFormData({...formData, ratingRaw: v})} />
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: BILLING */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-text-secondary">Current Monthly Price</label>
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

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-text-secondary">Billing Frequency</label>
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

          {/* SCREEN 5: CONTRACT TERMS */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary">Original Start Date</label>
                  <input type="date" className="w-full p-3 border border-border rounded-md text-sm" 
                    value={formData.contractStart} onChange={e => setFormData({...formData, contractStart: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary">Current End Date</label>
                  <input type="date" className="w-full p-3 border border-border rounded-md text-sm" 
                    value={formData.contractEnd} onChange={e => setFormData({...formData, contractEnd: e.target.value})} />
                </div>
              </div>

              {formData.contractEnd && formData.calculatedEnd && formData.contractEnd !== formData.calculatedEnd && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>
                    System calculates end date as <strong>{formData.calculatedEnd}</strong> based on terms. Please confirm your entry is correct.
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary">Initial Term</label>
                <div className="flex gap-2">
                  <input type="number" className="flex-1 p-3 border border-border rounded-md" 
                    value={formData.initialTermNum} onChange={e => setFormData({...formData, initialTermNum: Number(e.target.value)})} />
                  <select className="w-32 p-3 border border-border rounded-md bg-white"
                    value={formData.initialTermUnit} onChange={e => setFormData({...formData, initialTermUnit: e.target.value})}>
                    <option>Years</option>
                    <option>Months</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary">Renewal Term</label>
                <div className="flex gap-2">
                  <input type="number" className="flex-1 p-3 border border-border rounded-md" 
                    value={formData.renewalTermNum} onChange={e => setFormData({...formData, renewalTermNum: Number(e.target.value)})} />
                  <select className="w-32 p-3 border border-border rounded-md bg-white"
                    value={formData.renewalTermUnit} onChange={e => setFormData({...formData, renewalTermUnit: e.target.value})}>
                    <option>Years</option>
                    <option>Months</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 6: CANCELLATION */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary">Not Before (Days)</label>
                  <input type="number" className="w-full p-3 border border-border rounded-md" 
                    value={formData.noticeDaysMax} onChange={e => setFormData({...formData, noticeDaysMax: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary">Not Less Than (Days)</label>
                  <input type="number" className="w-full p-3 border border-border rounded-md" 
                    value={formData.noticeDaysMin} onChange={e => setFormData({...formData, noticeDaysMin: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <label className="flex items-center gap-2 font-bold text-text-primary cursor-pointer">
                  <input type="checkbox" className="rounded text-brand focus:ring-brand" 
                    checked={formData.hasPenalty} onChange={e => setFormData({...formData, hasPenalty: e.target.checked})} />
                  Is there a penalty for early termination?
                </label>

                {formData.hasPenalty && (
                  <div className="pl-6 space-y-4 animate-in slide-in-from-top-2">
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
                      className="w-full p-3 border border-border rounded-md focus:border-brand outline-none"
                      placeholder={formData.penaltyType === 'fixed' ? "e.g. 5000" : "e.g. 50"}
                      value={formData.penaltyValue}
                      onChange={e => setFormData({...formData, penaltyValue: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 7: UPLOAD */}
          {step === 7 && (
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

          {/* SCREEN 8: CONFIRM */}
          {step === 8 && (
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
                  <span className="block text-xs font-bold text-text-secondary uppercase">Cancellation</span>
                  <span className="block font-medium">{formData.noticeDaysMax}-{formData.noticeDaysMin} Days Notice</span>
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

          <button 
            onClick={step === 2 && formData.hasContract === false ? handleEmailSentExit : handleNext}
            className={cn(
              "px-6 py-2 rounded-md font-bold shadow-sm flex items-center gap-2 transition-all",
              step === 2 && formData.hasContract === false 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-brand hover:bg-brand-dark text-white"
            )}
          >
            {step === 2 && formData.hasContract === false ? "Email Sent - Exit" : step === 8 ? "Save & Complete" : "Next"}
            {step < 8 && formData.hasContract !== false && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
