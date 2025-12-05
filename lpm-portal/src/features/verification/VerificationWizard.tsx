import React, { useState, useEffect } from 'react';
import { X, ChevronRight, UploadCloud, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StarRating } from '../../components/ui/StarRating'; // Reusing your component
import type { Property } from '../../dataModel';

interface VerificationWizardProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

type Step = 'core' | 'dates' | 'exit';

export default function VerificationWizard({ property, isOpen, onClose, onComplete }: VerificationWizardProps) {
  const [step, setStep] = useState<Step>('core');
  
  // -- FORM STATE --
  const [formData, setFormData] = useState({
    // Core [PRD View C.2]
    vendorName: property.vendor.name,
    unitCount: property.unitCount || 1,
    ratingRaw: property.vendor.rating || 10, // 1-10 scale
    currentPrice: property.vendor.currentPrice,
    
    // Term Logic [PRD View C.3]
    contractStart: property.contractStartDate,
    initialTerm: 5, // Years
    renewalTerm: 5, // Years
    calculatedEnd: '', // Derived state

    // Cancellation [PRD View C.4]
    noticeDaysMin: 90,  // "Not less than Y days"
    noticeDaysMax: 120, // "Not before X days"
    penalty: 'Liquidated Damages: 50% of remaining term',
    file: null as File | null
  });

  // -- TERM LOGIC CALCULATOR [PRD View C.3.b] --
  // Automatically calculates the current contract end date based on history
  useEffect(() => {
    if (!formData.contractStart) return;

    const start = new Date(formData.contractStart);
    const now = new Date();
    let end = new Date(start);
    
    // Add initial term
    end.setFullYear(end.getFullYear() + formData.initialTerm);

    // If initial term passed, keep adding renewal terms until we reach the future
    while (end < now) {
      end.setFullYear(end.getFullYear() + formData.renewalTerm);
    }

    setFormData(prev => ({ ...prev, calculatedEnd: end.toISOString().split('T')[0] }));
  }, [formData.contractStart, formData.initialTerm, formData.renewalTerm]);


  // -- HANDLERS --
  const handleNext = () => {
    if (step === 'core') setStep('dates');
    else if (step === 'dates') setStep('exit');
    else onComplete(formData);
  };

const handleBack = () => {
    if (step === 'exit') setStep('dates');
    else if (step === 'dates') setStep('core');
    else onClose();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  if (!isOpen) return null;

  // -- RENDER HELPERS --
  const StepDot = ({ active, completed }: { active: boolean; completed: boolean }) => (
    <div className={cn(
      "w-2 h-2 rounded-full transition-colors duration-300",
      active || completed ? "bg-brand" : "bg-slate-200"
    )} />
  );

  const StepLine = ({ active }: { active: boolean }) => (
    <div className={cn(
      "h-[2px] w-16 transition-colors duration-300",
      active ? "bg-brand" : "bg-slate-200"
    )} />
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      
      <div className="bg-surface w-full max-w-[640px] max-h-[90vh] rounded-lg shadow-lvl3 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER & STEPPER [PRD View C.1] */}
        <div className="p-lg border-b border-border flex flex-col items-center relative bg-slate-50/50 rounded-t-lg">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-slate-200 rounded-full text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg font-bold text-text-primary mb-md">Verify Contract Data</h2>
          
          <div className="flex items-center gap-2">
            <StepDot active={step === 'core'} completed={step !== 'core'} />
            <StepLine active={step !== 'core'} />
            <StepDot active={step === 'dates'} completed={step === 'exit'} />
            <StepLine active={step === 'exit'} />
            <StepDot active={step === 'exit'} completed={false} />
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-xl">
          
          {/* --- STEP 1: CORE DATA [PRD View C.2] --- */}
          {step === 'core' && (
            <div className="space-y-lg">
              <div className="text-center mb-lg">
                <h3 className="text-md font-semibold text-text-primary">1. Core Identity</h3>
                <p className="text-sm text-text-secondary">Confirm the vendor and asset details.</p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="space-y-xs">
                  <label className="text-[11px] font-bold text-text-primary uppercase">Vendor Name</label>
                  <select 
                    className="w-full h-10 border border-border rounded-sm px-3 text-sm focus:border-brand outline-none bg-white"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                  >
                    <option>Otis</option>
                    <option>Kone</option>
                    <option>Schindler</option>
                    <option>ThyssenKrupp</option>
                    <option>Local Independent</option>
                    <option>Other...</option>
                  </select>
                </div>

                <div className="space-y-xs">
                   <label className="text-[11px] font-bold text-text-primary uppercase">Unit Count</label>
                   <input 
                      type="number"
                      className="w-full h-10 border border-border rounded-sm px-3 text-sm focus:border-brand outline-none"
                      value={formData.unitCount}
                      onChange={(e) => setFormData({...formData, unitCount: Number(e.target.value)})}
                   />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-text-primary uppercase flex justify-between">
                  <span>Vendor Rating</span>
                  <span className={cn(
                    "text-xs",
                    formData.ratingRaw >= 8 ? "text-green-600" : 
                    formData.ratingRaw >= 6 ? "text-yellow-600" : "text-red-500"
                  )}>
                    {formData.ratingRaw > 0 ? (formData.ratingRaw / 2).toFixed(1) + " Stars" : "Not Rated"}
                  </span>
                </label>
                
                <div className="flex items-center justify-center p-4 bg-slate-50 border border-border rounded-sm">
                  <StarRating 
                    value={formData.ratingRaw} 
                    onChange={(val) => setFormData({...formData, ratingRaw: val})} 
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-text-primary uppercase">Monthly Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                  <input 
                    type="number" 
                    className="w-full h-10 border border-border rounded-sm pl-9 pr-3 text-sm focus:border-brand outline-none"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData({...formData, currentPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 2: TERM LOGIC [PRD View C.3] --- */}
          {step === 'dates' && (
            <div className="space-y-lg">
              <div className="text-center mb-lg">
                <h3 className="text-md font-semibold text-text-primary">2. Term Logic</h3>
                <p className="text-sm text-text-secondary">Define the contract lifecycle.</p>
              </div>

              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-text-primary uppercase">Original Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                  <input 
                    type="date"
                    className="w-full h-10 border border-border rounded-sm pl-9 pr-3 text-sm focus:border-brand outline-none"
                    value={formData.contractStart}
                    onChange={(e) => setFormData({...formData, contractStart: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="space-y-xs">
                  <label className="text-[11px] font-bold text-text-primary uppercase">Initial Term</label>
                  <select 
                    className="w-full h-10 border border-border rounded-sm px-3 text-sm focus:border-brand outline-none bg-white"
                    value={formData.initialTerm}
                    onChange={(e) => setFormData({...formData, initialTerm: Number(e.target.value)})}
                  >
                    <option value={1}>1 Year</option>
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years</option>
                    <option value={10}>10 Years</option>
                  </select>
                </div>

                <div className="space-y-xs">
                  <label className="text-[11px] font-bold text-text-primary uppercase">Renewal Term</label>
                  <select 
                    className="w-full h-10 border border-border rounded-sm px-3 text-sm focus:border-brand outline-none bg-white"
                    value={formData.renewalTerm}
                    onChange={(e) => setFormData({...formData, renewalTerm: Number(e.target.value)})}
                  >
                    <option value={1}>1 Year (Auto)</option>
                    <option value={3}>3 Years (Auto)</option>
                    <option value={5}>5 Years (Auto)</option>
                  </select>
                </div>
              </div>

              {/* Logic Preview Box */}
              <div className="p-md bg-blue-50 border-l-4 border-brand rounded-r-sm flex gap-md items-start">
                <AlertCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase mb-1">System Calculation</p>
                  <p className="text-sm text-blue-800">
                    Based on these terms, the current contract is active until <strong>{formData.calculatedEnd}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 3: CANCELLATION [PRD View C.4] --- */}
          {step === 'exit' && (
            <div className="space-y-lg">
              <div className="text-center mb-lg">
                <h3 className="text-md font-semibold text-text-primary">3. Cancellation & Upload</h3>
                <p className="text-sm text-text-secondary">Digitize the exit clauses.</p>
              </div>

              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-text-primary uppercase">Notice Window Logic</label>
                <div className="flex items-center gap-md bg-slate-50 p-3 border border-border rounded-sm">
                  <div className="flex-1">
                     <span className="text-xs text-text-secondary block mb-1">Not Before (Days)</span>
                     <input 
                       type="number"
                       className="w-full h-8 border border-border rounded-sm px-2 text-sm"
                       value={formData.noticeDaysMax}
                       onChange={(e) => setFormData({...formData, noticeDaysMax: Number(e.target.value)})}
                     />
                  </div>
                  <span className="text-text-secondary font-bold">-</span>
                  <div className="flex-1">
                     <span className="text-xs text-text-secondary block mb-1">Not Less Than (Days)</span>
                     <input 
                       type="number"
                       className="w-full h-8 border border-border rounded-sm px-2 text-sm"
                       value={formData.noticeDaysMin}
                       onChange={(e) => setFormData({...formData, noticeDaysMin: Number(e.target.value)})}
                     />
                  </div>
                </div>
                <p className="text-xs text-text-secondary italic mt-1">
                  "Provide notice between {formData.noticeDaysMax} and {formData.noticeDaysMin} days prior to expiration."
                </p>
              </div>

              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-text-primary uppercase">Early Termination Penalty</label>
                <textarea 
                  className="w-full h-20 border border-border rounded-sm p-3 text-sm focus:border-brand outline-none resize-none"
                  value={formData.penalty}
                  onChange={(e) => setFormData({...formData, penalty: e.target.value})}
                />
              </div>

              {/* PDF Upload Area */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className={cn(
                  "border-2 border-dashed rounded-md p-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer h-32",
                  formData.file ? "border-green-400 bg-green-50" : "border-border hover:bg-slate-50"
                )}
              >
                {formData.file ? (
                  <>
                    <div className="p-2 bg-green-100 rounded-full mb-sm text-green-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-green-800">{formData.file.name}</p>
                    <p className="text-xs text-green-600">Ready to upload</p>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-slate-100 rounded-full mb-sm text-text-secondary">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">Drag & drop Contract PDF</p>
                    <p className="text-xs text-text-secondary">or click to browse</p>
                  </>
                )}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER [PRD View C.2 - Buttons] */}
        <div className="p-md border-t border-border bg-slate-50 flex justify-end gap-sm rounded-b-lg">
          <button 
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {step === 'core' ? 'Cancel' : 'Back'}
          </button>
          <button 
            onClick={handleNext}
            className="px-6 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-bold rounded-sm shadow-sm flex items-center gap-2 transition-all"
          >
            {step === 'exit' ? 'Save & Lock Data' : (
              <>
                Next <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}