import { useState, useMemo } from 'react';
import { Building, ArrowLeft, AlertCircle } from 'lucide-react';
import { StatusPill } from '../../components/ui/StatusPill';
import VerificationWizard from '../verification/VerificationWizard';
import { useAuth } from '../auth/AuthContext';
import type { Property } from '../../dataModel';

// --- COMPONENT IMPORTS ---
import PropertyHeader from './components/PropertyHeader';
import PropertyLPMResponsibility from './components/PropertyLPMResponsibility';
import PropertyVendorCard from './components/PropertyVendorCard';
import PropertyFinancials from './components/PropertyFinancials';
import PropertyCancellation from './components/PropertyCancellation';
import PropertyContacts from './components/PropertyContacts';
import PropertyDocuments from './components/PropertyDocuments';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onUpdate: (id: string, data: Partial<Property>) => void;
}

// Helper for date parsing (kept here for banner logic)
const parseDateSafe = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const mm = parseInt(parts[0], 10) - 1;
    const dd = parseInt(parts[1], 10);
    const yyyy = parseInt(parts[2], 10);
    d = new Date(yyyy, mm, dd);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

export default function PropertyDetail({ property, onBack, onUpdate }: PropertyDetailProps) {
  const { profile } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // --- WIZARD COMPLETION LOGIC ---
  const handleVerificationComplete = (data: any) => {
    // 1. Merge new documents if any
    let updatedDocs = property.documents || [];
    if (data.newDocuments && data.newDocuments.length > 0) {
      updatedDocs = [...updatedDocs, ...data.newDocuments];
    }

    // 2. Handle "No Elevators" case
    if (data.status === 'no_elevators' && data.clearData) {
      onUpdate(property.id, {
        status: 'no_elevators',
        unitCount: 0,
        documents: updatedDocs,
        vendor: { ...property.vendor, name: '', currentPrice: 0, rating: 0, accountNumber: '', serviceInstructions: '' },
        contractStartDate: '',
        contractEndDate: '',
        cancellationWindow: '',
        initialTerm: '',
        renewalTerm: '',
        billTo: '',
        buildingId: ''
      });
      setIsWizardOpen(false);
      return;
    }

    // 3. Handle "Pending Review" case
    if (data.status === 'pending_review') {
      onUpdate(property.id, { status: 'pending_review' });
      setIsWizardOpen(false);
      return;
    }

    // 4. Standard Update
    const noticeString = `${data.noticeDaysMax} - ${data.noticeDaysMin} Days`;
    onUpdate(property.id, {
      status: data.status,
      unitCount: data.unitCount,
      // FIX: Ensure AutoRenews boolean is saved so Cancellation Card logic works
      autoRenews: data.autoRenews, 
      contractStartDate: data.contractStart,
      contractEndDate: data.calculatedEnd,
      cancellationWindow: noticeString,
      initialTerm: `${data.initialTermNum} ${data.initialTermUnit}`,
      renewalTerm: `${data.renewalTermNum} ${data.renewalTermUnit}`,
      onNationalContract: data.onNationalContract,
      contacts: data.contacts,
      documents: updatedDocs,
      priceCap: data.priceCap, 
      earlyTerminationPenalty: data.penaltyValue, 
      billTo: data.billTo,
      buildingId: data.buildingId,
      vendor: {
        ...property.vendor,
        name: data.vendorName,
        rating: data.ratingRaw,
        currentPrice: data.currentPrice,
        billingFrequency: data.billingFreq,
        accountNumber: data.accountNumber,
        serviceInstructions: data.serviceInstructions
      }
    });
    setIsWizardOpen(false);
  };

  const confirmNoContract = () => {
    if(confirm("Confirm that this property has NO service contract? This will remove it from compliance lists.")) {
      onUpdate(property.id, { status: 'service_contract_needed' });
    }
  };

  // --- BANNER LOGIC ---
  const showBanner = useMemo(() => {
    if (!property.contractEndDate || !property.cancellationWindow) return false;
    // Don't show banner if it doesn't auto-renew
    if (property.autoRenews === false) return false;

    try {
      const nums = property.cancellationWindow.match(/\d+/g)?.map(Number);
      if (!nums || nums.length === 0) return false;
      const endDate = parseDateSafe(property.contractEndDate);
      if (!endDate) return false;
      
      const today = new Date();
      
      let startWindow = new Date(endDate);
      if (nums.length >= 2) {
        const maxDays = Math.max(...nums);
        startWindow.setDate(endDate.getDate() - maxDays);
      } else {
        const minDays = nums[0];
        startWindow.setDate(endDate.getDate() - minDays);
      }
      
      const alertStart = new Date(startWindow);
      alertStart.setDate(startWindow.getDate() - 30); 
      
      const endWindow = new Date(endDate);
      const minDays = nums.length >= 2 ? Math.min(...nums) : nums[0];
      endWindow.setDate(endDate.getDate() - minDays);

      return today >= alertStart && today <= endWindow;
    } catch (e) { return false; }
  }, [property.contractEndDate, property.cancellationWindow, property.autoRenews]);


  // --- VIEW: NO ELEVATORS ---
  if (property.status === 'no_elevators') {
    return (
      <div className="flex flex-col h-full bg-canvas p-6">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full text-text-secondary"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-2xl font-bold text-text-primary">{property.name}</h1>
          <StatusPill status="no_elevators" />
        </div>
        <div className="bg-surface border border-border rounded-md p-10 text-center shadow-sm">
          <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-2">No Elevators on Site</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            This property has been verified as having no vertical transportation assets. No further tracking is required.
          </p>
          <button onClick={() => setIsWizardOpen(true)} className="mt-6 text-sm text-brand font-bold hover:underline">
            Mistake? Re-verify Data
          </button>
        </div>
        {isWizardOpen && (
          <VerificationWizard 
            property={property}
            isOpen={isWizardOpen}
            onClose={() => setIsWizardOpen(false)}
            onComplete={handleVerificationComplete}
          />
        )}
      </div>
    );
  }

  // --- VIEW: MAIN DASHBOARD ---
  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-canvas">
      
      {/* 1. Header */}
      <PropertyHeader 
        property={property} 
        onBack={onBack} 
        onVerify={() => setIsWizardOpen(true)} 
      />

      {/* 2. Banners */}
      {showBanner && (
        <div className="mx-6 mb-6 p-4 bg-red-50 border-l-4 border-status-critical rounded-r-sm shadow-sm flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-status-critical shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-1">Action Required: Cancellation Window Open</h3>
            <p className="text-sm text-red-800">
              This contract is currently in (or approaching) its cancellation window. 
            </p>
          </div>
        </div>
      )}

      {property.status === 'pending_review' && (
        <div className="mx-6 mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-sm shadow-sm flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wide">Pending Review: No Service Provider</h3>
              <p className="text-sm text-orange-800">Property Manager indicates no service provider exists. Regional PM must confirm.</p>
            </div>
          </div>
          {(profile?.role === 'regional_pm' || profile?.role === 'admin' || profile?.role === 'area_vp') && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsWizardOpen(true)}
                className="px-3 py-1.5 bg-white border border-orange-200 text-orange-800 text-xs font-bold rounded shadow-sm hover:bg-orange-100"
              >
                Reject (Add Vendor)
              </button>
              <button 
                onClick={confirmNoContract}
                className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded shadow-sm hover:bg-orange-700"
              >
                Confirm No Contract
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Grid Layout */}
      <div className="flex-1 flex gap-lg min-h-0 overflow-hidden">
        
        {/* Left Column (Static Info) */}
        <div className="w-[360px] flex-shrink-0 overflow-y-auto space-y-lg pr-2 pb-10">
          <PropertyLPMResponsibility property={property} />
          <PropertyVendorCard property={property} onUpdate={onUpdate} />
        </div>

        {/* Right Column (Dynamic Info) */}
        <div className="flex-1 overflow-y-auto pr-2 pb-2xl space-y-6">
          {/* UPDATED: Passing onUpdate to these two components */}
          <PropertyFinancials property={property} onUpdate={onUpdate} />
          <PropertyCancellation property={property} profile={profile} onUpdate={onUpdate} />
          
          <PropertyContacts property={property} onUpdate={onUpdate} />
          <PropertyDocuments property={property} onUpdate={onUpdate} profile={profile} />
        </div>
      </div>

      {/* 4. Wizard Overlay */}
      {isWizardOpen && (
        <VerificationWizard 
          property={property}
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleVerificationComplete}
        />
      )}

    </div>
  );
}