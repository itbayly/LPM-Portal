import { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Plus, ArrowLeft, 
  ArrowRight, ShieldCheck, Thermometer, Zap, Lock, FileText, Calendar 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusPill } from '../../components/ui/StatusPill';
import { StarRating } from '../../components/ui/StarRating';
import type { Property, Contract } from '../../dataModel';

// Reuse the Wallet View for the specific contract details
import PropertyDetail from './PropertyDetail';
// NEW IMPORT
import AddContractModal from './components/AddContractModal';
import type { UIContract } from './components/AddContractModal';

interface PropertyHubProps {
  property: Property;
  onBack: () => void;
  onUpdate: (id: string, data: Partial<Property>) => void;
}

// Define the Service Type for UI rendering
interface ServiceCard {
  id: string;
  category: string;
  vendor: string | null;
  status: string | null;
  cost: number;
  icon: any;
  active: boolean;
  rating: number;
  expirationDate?: string;
  isLegacyElevator?: boolean; 
}

// --- HELPER: Category Color Mapping ---
const getCategoryColor = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('vertical') || c.includes('elevator')) return 'border-l-blue-500';
  if (c.includes('fire') || c.includes('life safety')) return 'border-l-orange-500';
  if (c.includes('hvac') || c.includes('cooling')) return 'border-l-cyan-500';
  if (c.includes('waste')) return 'border-l-emerald-500';
  if (c.includes('security') || c.includes('access')) return 'border-l-indigo-500';
  if (c.includes('utilities') || c.includes('elec')) return 'border-l-yellow-500';
  return 'border-l-slate-500';
};

// --- HELPER: Date Formatter ---
const formatExpiry = (dateStr?: string) => {
  if (!dateStr) return "Auto-Renew";
  return `${dateStr}`; 
};

// --- HELPER: Monogram Logic ---
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function PropertyHub({ property, onBack, onUpdate }: PropertyHubProps) {
  // Navigation State
  const [activeService, setActiveService] = useState<string | null>(null);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  const [services, setServices] = useState<ServiceCard[]>([]);

  // --- 1. INITIALIZE / SYNC DATA ---
  useEffect(() => {
    // A. Start with the Legacy Elevator Contract
    const elevatorCard: ServiceCard = {
      id: 'elevator',
      category: 'Vertical Transportation',
      vendor: property.vendor?.name || 'Unassigned',
      status: property.status,
      cost: property.vendor?.currentPrice || 0,
      icon: Building2,
      active: !!property.vendor?.name,
      rating: property.vendor?.rating || 0,
      expirationDate: property.contractEndDate,
      isLegacyElevator: true
    };

    // B. Merge with Real Contracts from DB
    const dbContracts = property.contracts || [];
    
    // Map DB contracts to cards
    const mappedContracts = dbContracts.map(c => {
      // Find matching icon
      let icon = Zap;
      if (c.category.includes('HVAC')) icon = Thermometer;
      if (c.category.includes('Fire')) icon = ShieldCheck;
      if (c.category.includes('Access')) icon = Lock;
      
      return {
        id: c.id,
        category: c.category,
        vendor: c.vendor,
        status: c.status,
        cost: c.cost,
        icon: icon,
        active: true,
        rating: c.rating || 0,
        expirationDate: c.endDate
      };
    });

    // Only show active contracts (or the legacy one if active)
    const allServices = [elevatorCard, ...mappedContracts].filter(s => s.active);
    setServices(allServices);

  }, [property]);

  // Calculate Total Spend
  const totalSpend = services.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  // --- HANDLER: SAVE CONTRACT (PERSIST TO DB) ---
  const handleContractSaved = (uiContract: UIContract) => {
    // 1. Convert UI Contract to Data Model Contract
    const newContract: Contract = {
      id: uiContract.id,
      category: uiContract.category,
      vendor: uiContract.vendor,
      status: 'active_contract', // Default status
      cost: uiContract.cost,
      startDate: uiContract.startDate,
      endDate: uiContract.endDate,
      rating: 0 // Default rating
    };

    // 2. Merge with existing contracts
    const existingContracts = property.contracts || [];
    const updatedContracts = [...existingContracts, newContract];

    // 3. PERSIST TO FIRESTORE
    onUpdate(property.id, { contracts: updatedContracts });
    
    // 4. Close Modal
    setShowAddModal(false);
  };

  // --- RENDER: CONTRACT WALLET ---
  if (activeService === 'elevator') {
    return (
      <PropertyDetail 
        property={property} 
        onBack={() => setActiveService(null)} 
        onUpdate={onUpdate} 
      />
    );
  }

  // --- RENDER: THE HUB ---
  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER */}
      <div className="glass-panel p-6 rounded-xl mb-6 shrink-0 relative overflow-hidden group">
        {/* BACK BUTTON: Aligned Left with Navbar Logo */}
        <button 
          onClick={onBack} 
          className="absolute top-6 left-6 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-text-secondary dark:text-slate-400 transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row gap-6 relative z-10 pl-12">
          
          {/* TEXT CONTAINER (Now first, with padding to clear absolute button) */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight mb-2">
              {property.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand dark:text-blue-400" />
                <span>{property.address}, {property.city} {property.state}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-current opacity-30" />
              <div className="font-mono opacity-80">ID: {property.buildingId || "N/A"}</div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center pr-12 border-r border-black/5 dark:border-white/5">
            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1">Monthly Opex</span>
            <div className="flex items-center gap-1 text-2xl font-mono font-bold text-text-primary dark:text-white">
              <span className="text-brand dark:text-blue-400">$</span>
              {totalSpend.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-brand/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SERVICE STACK */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold font-sans tracking-tight text-text-secondary dark:text-slate-400 uppercase flex items-center gap-2">
            <FileText className="w-4 h-4" /> Service Agreements
          </h2>
        </div>

        {/* SCENARIO B: EMPTY STATE */}
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="w-16 h-16 bg-brand/10 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-brand dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">No Contracts Found</h3>
            <p className="text-sm text-text-secondary dark:text-slate-400 mb-6 max-w-xs text-center">
              Set up your first service agreement to begin tracking expenses and renewal dates.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold shadow-lg shadow-brand/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Contract
            </button>
          </div>
        ) : (
          /* SCENARIO A: LIST VIEW - TIGHTER GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr pb-10">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div 
                  key={service.id}
                  onClick={() => service.isLegacyElevator ? setActiveService('elevator') : null}
                  className={cn(
                    "glass-panel p-5 rounded-xl transition-all duration-300 group relative overflow-hidden border-l-4 min-h-[200px] h-full flex flex-col",
                    getCategoryColor(service.category),
                    service.isLegacyElevator ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : "cursor-default"
                  )}
                >
                  {/* Status Pill Absolute */}
                  <div className="absolute top-4 right-4">
                    {service.status && <StatusPill status={service.status as any} />}
                  </div>

                  {/* Header: Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-text-secondary dark:text-slate-500 uppercase tracking-wide">
                      {service.category}
                    </span>
                  </div>

                  {/* Body: Vendor & Rating */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate pr-16">
                      {service.vendor}
                    </h3>
                    <div className="pointer-events-none origin-left scale-90">
                      <StarRating value={service.rating} readonly />
                    </div>
                  </div>

                  {/* Footer: Date & Price */}
                  <div className="flex items-end justify-between pt-4 border-t border-black/5 dark:border-white/5 mt-auto">
                    <div className="flex items-center gap-2 text-text-secondary dark:text-slate-400">
                      <Calendar className="w-4 h-4 opacity-70" />
                      <span className="text-xs font-mono font-medium">
                        {formatExpiry(service.expirationDate)}
                      </span>
                    </div>
                    
                    <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-tight">
                      ${service.cost.toLocaleString()}
                    </div>
                  </div>

                  {service.isLegacyElevator && (
                    <div className="absolute right-4 bottom-16 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-brand dark:text-blue-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* "Add Contract" Button at the end of the list */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:border-brand/30 dark:hover:border-blue-400/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group min-h-[200px] h-full"
            >
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-full text-slate-400 group-hover:text-brand dark:group-hover:text-blue-400 mb-3 transition-colors group-hover:scale-110">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-secondary dark:text-slate-400 group-hover:text-text-primary dark:group-hover:text-white transition-colors uppercase tracking-wider">
                Add New Contract
              </h3>
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddContractModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleContractSaved}
        />
      )}
    </div>
  );
}