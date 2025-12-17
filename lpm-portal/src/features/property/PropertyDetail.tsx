import { useState, useMemo } from 'react';
import { 
  ArrowLeft, AlertCircle, FileText, 
  Users, DollarSign, Activity, Lock 
} from 'lucide-react';
import { StatusPill } from '../../components/ui/StatusPill';
import VerificationWizard from '../verification/VerificationWizard';
import { useAuth } from '../auth/AuthContext';
import type { Property } from '../../dataModel';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

// Helper for date parsing
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

// --- TAB CONFIG ---
const TABS = [
  { id: 'intel', label: 'Intelligence', icon: Activity },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'docs', label: 'Repository', icon: FileText },
];

export default function PropertyDetail({ property, onBack, onUpdate }: PropertyDetailProps) {
  const { profile } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('intel');

  // --- WIZARD COMPLETION LOGIC ---
  const handleVerificationComplete = (data: any) => {
    // 1. Merge new documents
    let updatedDocs = property.documents || [];
    if (data.newDocuments && data.newDocuments.length > 0) {
      updatedDocs = [...updatedDocs, ...data.newDocuments];
    }

    // 2. Handle "No Elevators"
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
      });
      setIsWizardOpen(false);
      return;
    }

    // 3. Handle "Pending Review"
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

  // --- BANNER LOGIC ---
  const showBanner = useMemo(() => {
    if (!property.contractEndDate || !property.cancellationWindow) return false;
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
      <div className="flex flex-col h-full p-6 animate-in fade-in">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-text-secondary dark:text-slate-400 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">{property.name}</h1>
          <StatusPill status="no_elevators" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-panel p-16 text-center rounded-2xl max-w-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white dark:from-white/5 dark:to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">Assets Locked</h3>
              <p className="text-text-secondary dark:text-slate-400 mb-8 leading-relaxed">
                This property has been verified as having no vertical transportation assets. Tracking is disabled.
              </p>
              <button 
                onClick={() => setIsWizardOpen(true)} 
                className="text-xs text-brand dark:text-blue-400 font-bold hover:underline uppercase tracking-widest"
              >
                Re-open Investigation
              </button>
            </div>
          </div>
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
    <div className="flex flex-col h-full overflow-hidden relative">
      
      {/* 1. Header */}
      <PropertyHeader 
        property={property} 
        onBack={onBack} 
        onVerify={() => setIsWizardOpen(true)} 
      />

      {/* 2. Banners (Floating) */}
      {showBanner && (
        <div className="mx-1 mb-6 p-4 glass-panel border-l-4 border-l-red-500 rounded-r-xl flex items-start gap-4 animate-in slide-in-from-top-2">
          <div className="p-2 bg-red-500/10 rounded-full">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">Window Open</h3>
            <p className="text-sm text-text-primary dark:text-slate-200">
              Contract cancellation window is active. Automatic renewal is imminent.
            </p>
          </div>
        </div>
      )}

      {/* 3. THE BINDER (Tabs) */}
      <div className="flex items-center gap-2 mb-6 mx-1 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-5 py-2.5 rounded-lg flex items-center gap-2.5 transition-all duration-300",
                isActive 
                  ? "bg-white dark:bg-white/10 shadow-sm text-brand dark:text-white ring-1 ring-black/5 dark:ring-white/10" 
                  : "hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-brand dark:text-blue-400" : "opacity-70")} />
              <span className="text-xs font-bold uppercase tracking-wide">{tab.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-brand dark:bg-blue-400 rounded-t-full"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* 4. CONTENT STAGE */}
      <div className="flex-1 overflow-y-auto px-1 pb-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {/* TAB: INTELLIGENCE */}
            {activeTab === 'intel' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                <PropertyVendorCard property={property} onUpdate={onUpdate} />
                <div className="space-y-6">
                  <PropertyLPMResponsibility property={property} />
                  <PropertyCancellation property={property} profile={profile} onUpdate={onUpdate} />
                </div>
              </div>
            )}

            {/* TAB: FINANCIALS */}
            {activeTab === 'financials' && (
              <div className="max-w-4xl">
                <PropertyFinancials property={property} onUpdate={onUpdate} />
              </div>
            )}

            {/* TAB: TEAM */}
            {activeTab === 'team' && (
              <div className="max-w-4xl">
                <PropertyContacts property={property} onUpdate={onUpdate} />
              </div>
            )}

            {/* TAB: REPOSITORY */}
            {activeTab === 'docs' && (
              <div className="max-w-4xl">
                <PropertyDocuments property={property} onUpdate={onUpdate} profile={profile} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 5. Wizard Overlay */}
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