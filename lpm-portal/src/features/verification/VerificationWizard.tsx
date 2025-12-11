import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { uploadFileToStorage } from '../../lib/storage';
import type { Property, PropertyDocument } from '../../dataModel';

// --- MODULAR IMPORTS ---
import { 
  CHECKLIST_ITEMS, 
  parseTerm 
} from './wizard/wizardConfig';

// Import TYPE explicitly to satisfy TypeScript strict mode
import type { WizardFormData } from './wizard/wizardConfig';

import Step1_Elevators from './wizard/steps/Step1_Elevators';
import Step2_Provider from './wizard/steps/Step2_Provider';
import Step3_Checklist from './wizard/steps/Step3_Checklist';
import Step4_VendorDetails from './wizard/steps/Step4_VendorDetails';
import Step5_Billing from './wizard/steps/Step5_Billing';
import Step6_Terms from './wizard/steps/Step6_Terms';
import Step7_Termination from './wizard/steps/Step7_Termination';
import Step8_Contacts from './wizard/steps/Step8_Contacts';
import Step9_Upload from './wizard/steps/Step9_Upload';
import Step10_Confirm from './wizard/steps/Step10_Confirm';

interface VerificationWizardProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export default function VerificationWizard({ property, isOpen, onClose, onComplete }: VerificationWizardProps) {
  const { profile } = useAuth();
  
  // -- GLOBAL STATE --
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  
  // Step 3 Specific State
  const [emailCopied, setEmailCopied] = useState(false);
  const [showEmailScreen, setShowEmailScreen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // -- MAIN FORM DATA --
  const [formData, setFormData] = useState<WizardFormData>({
    // Triage
    hasElevators: null,
    hasProvider: null,

    // Vendor
    vendorName: property.vendor?.name || "",
    vendorOther: "",
    unitCount: property.unitCount || "" as any,
    ratingRaw: property.vendor?.rating || 0,
    onNationalContract: property.onNationalContract || false,
    accountNumber: property.vendor?.accountNumber || "",
    billTo: property.billTo || "",
    buildingId: property.buildingId || "",
    serviceInstructions: property.vendor?.serviceInstructions || "",

    // Billing
    currentPrice: property.vendor?.currentPrice || "" as any,
    billingFreq: property.vendor?.billingFrequency || "Monthly",
    hasPriceCap: !!property.priceCap,
    priceCapValue: property.priceCap ? property.priceCap.replace(/[^0-9.]/g, '') : "",
    priceCapUnit: property.priceCap && property.priceCap.includes('$') ? '$' : '%',

    // Terms
    contractStart: "",
    contractEnd: property.contractEndDate || "",
    initialTermNum: parseTerm(property.initialTerm).num,
    initialTermUnit: parseTerm(property.initialTerm).unit,
    
    autoRenews: null,
    renewalTermNum: parseTerm(property.renewalTerm).num,
    renewalTermUnit: parseTerm(property.renewalTerm).unit,
    
    calculatedEnd: "",
    overrideEndDate: false,

    // Termination
    noticeDaysMin: "" as any,
    noticeDaysMax: "" as any,
    hasPenalty: !!property.earlyTerminationPenalty,
    penaltyType: "percentage",
    penaltyValue: property.earlyTerminationPenalty ? property.earlyTerminationPenalty.replace(/[^0-9.]/g, '') : "",

    // Arrays
    contacts: property.contacts || [],
    files: []
  });

  // -- EFFECTS --

  // 1. Smart Resume
  useEffect(() => {
    if (isOpen) {
      if (property.vendor?.name && property.unitCount && !property.contractStartDate) {
        setFormData(prev => ({
          ...prev,
          hasElevators: true,
          hasProvider: true,
          unitCount: property.unitCount
        }));
        setStep(3);
      }
    }
  }, [isOpen, property]);

  // 2. Date Calculator
  useEffect(() => {
    if (formData.contractStart.length === 10 && !formData.overrideEndDate && formData.initialTermNum) {
      const parts = formData.contractStart.split('/');
      const start = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      
      if (!isNaN(start.getTime())) {
        let end = new Date(start);
        
        // Initial Term
        if (formData.initialTermUnit === "Years") {
          end.setFullYear(end.getFullYear() + Number(formData.initialTermNum));
        } else {
          end.setMonth(end.getMonth() + Number(formData.initialTermNum));
        }
        end.setDate(end.getDate() - 1);

        // Auto-Renew Projection
        if (formData.autoRenews && formData.renewalTermNum) {
          const now = new Date();
          let safety = 0;
          while (end < now && safety < 50) {
             const currentEnd = new Date(end); 
             currentEnd.setDate(currentEnd.getDate() + 1); 
             
             if (formData.renewalTermUnit === "Years") {
               currentEnd.setFullYear(currentEnd.getFullYear() + Number(formData.renewalTermNum));
             } else {
               currentEnd.setMonth(currentEnd.getMonth() + Number(formData.renewalTermNum));
             }
             
             currentEnd.setDate(currentEnd.getDate() - 1); 
             end = currentEnd;
             safety++;
          }
        }

        setFormData(prev => ({ 
          ...prev, 
          calculatedEnd: end.toISOString().split('T')[0],
          contractEnd: end.toISOString().split('T')[0] 
        }));
      }
    }
  }, [
    formData.contractStart, 
    formData.initialTermNum, 
    formData.initialTermUnit, 
    formData.renewalTermNum, 
    formData.renewalTermUnit,
    formData.autoRenews,
    formData.overrideEndDate
  ]);

  // -- HANDLERS --

  const handleCopyEmail = () => {
    const addressString = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
    const userName = profile?.name || profile?.role || "Property Manager";
    
    const text = `Hi,

Could you please provide the following information for ${property.name} (${addressString}):

1. Copy of the fully executed service agreement
2. Current monthly price
3. Billing Frequency
4. Current contract end date
5. Our Account/Contract Number and Bill To Number

Please also confirm that you are still our assigned point of contact.

Thanks,
${userName}`;

    navigator.clipboard.writeText(text);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleSavePartial = () => {
    const finalVendorName = formData.vendorName === 'Other' ? formData.vendorOther : formData.vendorName;
    onComplete({
      ...formData,
      vendorName: finalVendorName,
      status: 'missing_data'
    });
  };

  // -- VALIDATION LOGIC --
  const isStepValid = () => {
    if (step === 1) {
      if (formData.hasElevators === null) return false;
      if (formData.hasElevators === true && !formData.unitCount) return false;
    }
    if (step === 2) {
      if (formData.hasProvider === null) return false;
      if (formData.hasProvider === true) {
        if (!formData.vendorName) return false;
        if (formData.vendorName === 'Other' && !formData.vendorOther) return false;
      }
    }
    if (step === 5) {
      if (!formData.currentPrice) return false;
      if (formData.hasPriceCap && !formData.priceCapValue) return false;
    }
    if (step === 6) {
      if (formData.contractStart.length !== 10) return false; 
      if (!formData.initialTermNum) return false;
      if (formData.autoRenews === null) return false;
      if (formData.autoRenews === true && !formData.renewalTermNum) return false;
    }
    return true;
  };

  // -- NAVIGATION --
  const handleNext = async () => {
    // Logic Gates
    if (step === 1 && formData.hasElevators === false) {
      if(confirm("Confirming: This property has NO elevators? This will clear existing vendor data.")) {
        onComplete({ status: 'no_elevators', clearData: true });
      }
      return;
    }
    if (step === 2 && formData.hasProvider === false) {
      alert("This property will be flagged for Regional PM review.");
      onComplete({ status: 'pending_review' });
      return;
    }
    if (step === 3 && checkedItems.length < CHECKLIST_ITEMS.length) {
      setShowEmailScreen(true);
      return;
    }
    if (step === 6) {
      const parts = formData.contractStart.split('/');
      const start = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      const limit = new Date();
      limit.setFullYear(limit.getFullYear() + 1);
      if (start > limit) {
        alert("Start date cannot be more than 12 months in the future.");
        return;
      }
    }
    if (step === 8 && formData.contacts.length === 0) {
      alert("Please add at least one point of contact.");
      return;
    }

    // FINAL SUBMISSION
    if (step === 10) {
      setIsUploading(true);
      const uploadedDocs: PropertyDocument[] = [];

      try {
        for (const file of formData.files) {
          const path = `properties/${property.id}/${Date.now()}_${file.name}`;
          const url = await uploadFileToStorage(file, path);
          
          uploadedDocs.push({
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
            name: file.name,
            url: url,
            type: file.type,
            storagePath: path,
            uploadedBy: profile?.name || 'Unknown',
            uploadedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error(err);
        alert("Failed to upload documents. Please try again.");
        setIsUploading(false);
        return;
      }

      const finalVendorName = formData.vendorName === 'Other' ? formData.vendorOther : formData.vendorName;
      let finalStatus = 'active_contract';
      if (finalVendorName === 'Schindler' && formData.onNationalContract) {
        finalStatus = 'on_national_agreement';
      }

      onComplete({ 
        ...formData, 
        vendorName: finalVendorName, 
        initialTerm: `${formData.initialTermNum} ${formData.initialTermUnit}`,
        renewalTerm: formData.autoRenews ? `${formData.renewalTermNum} ${formData.renewalTermUnit}` : "0 Years",
        cancellationWindow: formData.autoRenews && formData.noticeDaysMax ? `${formData.noticeDaysMax} - ${formData.noticeDaysMin} Days` : "N/A",
        status: finalStatus,
        priceCap: formData.hasPriceCap 
          ? (formData.priceCapUnit === '%' ? `${formData.priceCapValue}%` : `$${formData.priceCapValue}`)
          : undefined,
        penaltyValue: formData.hasPenalty
          ? (formData.penaltyType === 'percentage' ? `${formData.penaltyValue}%` : `$${formData.penaltyValue}`)
          : undefined,
        newDocuments: uploadedDocs 
      });
      setIsUploading(false);
      return;
    }

    setStep(s => s + 1);
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
          {!showEmailScreen && (
            <button onClick={onClose}><X className="w-6 h-6 text-text-secondary hover:text-text-primary" /></button>
          )}
        </div>

        {/* BODY (RENDER STEP COMPONENTS) */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && <Step1_Elevators formData={formData} setFormData={setFormData} />}
          {step === 2 && <Step2_Provider formData={formData} setFormData={setFormData} />}
          {step === 3 && (
            <Step3_Checklist 
              formData={formData} 
              setFormData={setFormData}
              showEmailScreen={showEmailScreen}
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              handleCopyEmail={handleCopyEmail}
              handleSavePartial={handleSavePartial}
              emailCopied={emailCopied}
            />
          )}
          {step === 4 && <Step4_VendorDetails formData={formData} setFormData={setFormData} />}
          {step === 5 && <Step5_Billing formData={formData} setFormData={setFormData} />}
          {step === 6 && <Step6_Terms formData={formData} setFormData={setFormData} />}
          {step === 7 && <Step7_Termination formData={formData} setFormData={setFormData} />}
          {step === 8 && <Step8_Contacts formData={formData} setFormData={setFormData} />}
          {step === 9 && <Step9_Upload formData={formData} setFormData={setFormData} />}
          {step === 10 && <Step10_Confirm formData={formData} setFormData={setFormData} />}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-border bg-slate-50 flex justify-between items-center">
          {step > 1 && !showEmailScreen ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-medium">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div></div>}

          {!showEmailScreen && (
            <button 
              onClick={handleNext}
              disabled={!isStepValid() || isUploading}
              className="px-6 py-2 bg-brand text-white rounded-md font-bold shadow-sm hover:bg-brand-dark flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>Uploading... <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : step === 10 ? (
                (property.status === 'active_contract' || property.status === 'on_national_agreement' ? "Update Information" : "Verify & Complete")
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}