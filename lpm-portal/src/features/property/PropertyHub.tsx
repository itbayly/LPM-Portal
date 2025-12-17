import { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Plus, ArrowLeft, 
  ArrowRight, ShieldCheck, Thermometer, Zap, Lock 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusPill } from '../../components/ui/StatusPill';
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
  isLegacyElevator?: boolean; // To track the original elevator data
}

export default function PropertyHub({ property, onBack, onUpdate }: PropertyHubProps) {
  // Navigation State
  const [activeService, setActiveService] = useState<string | null>(null);
  
  // Modal State
  const [showAddContract, setShowAddContract] = useState<{isOpen: boolean, category: string}>({
    isOpen: false,
    category: ''
  });

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
      isLegacyElevator: true
    };

    // B. Define the Ghost Slots
    const ghosts: ServiceCard[] = [
      { id: 'hvac', category: 'HVAC Systems', vendor: null, status: null, cost: 0, icon: Thermometer, active: false },
      { id: 'fire', category: 'Fire & Life Safety', vendor: null, status: null, cost: 0, icon: ShieldCheck, active: false },
      { id: 'elec', category: 'Utilities', vendor: null, status: null, cost: 0, icon: Zap, active: false },
      { id: 'security', category: 'Access Control', vendor: null, status: null, cost: 0, icon: Lock, active: false },
    ];

    // C. Merge with Real Contracts from DB
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
        active: true
      };
    });

    // Filter out ghosts that now have real contracts
    const activeGhostIds = mappedContracts.map(c => {
       if (c.category.includes('HVAC')) return 'hvac';
       if (c.category.includes('Fire')) return 'fire';
       if (c.category.includes('Access')) return 'security';
       return '';
    }) as string[];

    const finalGhosts = ghosts.filter(g => !activeGhostIds.includes(g.id));

    setServices([elevatorCard, ...mappedContracts, ...finalGhosts]);

  }, [property]);

  // Calculate Total Spend
  const totalSpend = services.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  // --- HANDLER: OPEN MODAL ---
  const handleGhostClick = (category: string) => {
    setShowAddContract({ isOpen: true, category });
  };

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
      endDate: uiContract.endDate
    };

    // 2. Merge with existing contracts
    const existingContracts = property.contracts || [];
    const updatedContracts = [...existingContracts, newContract];

    // 3. PERSIST TO FIRESTORE
    onUpdate(property.id, { contracts: updatedContracts });
    
    // 4. Close Modal
    setShowAddContract({ isOpen: false, category: '' });
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
        <button 
          onClick={onBack} 
          className="absolute top-6 right-6 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-text-secondary dark:text-slate-400 transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner border border-white/50 dark:border-white/10">
            <Building2 className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>

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
          <h2 className="text-sm font-bold font-mono text-text-secondary dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4" /> Active Service Stack
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {services.map((service) => {
            const Icon = service.icon;
            
            if (service.active) {
              return (
                <div 
                  key={service.id}
                  onClick={() => service.isLegacyElevator ? setActiveService('elevator') : null}
                  className={cn(
                    "glass-panel p-5 rounded-xl transition-all duration-300 group relative overflow-hidden border-l-4 border-l-brand dark:border-l-blue-500",
                    service.isLegacyElevator ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : "cursor-default"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-brand/10 dark:bg-blue-500/10 rounded-lg text-brand dark:text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    {service.status && <StatusPill status={service.status as any} />}
                  </div>

                  <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">
                    {service.category}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-slate-400 mb-4 font-medium">
                    {service.vendor}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                    <span className="text-xs font-mono text-text-secondary dark:text-slate-500 uppercase">Monthly</span>
                    <span className="font-mono font-bold text-text-primary dark:text-white">
                      ${service.cost.toLocaleString()}
                    </span>
                  </div>

                  {service.isLegacyElevator && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-brand dark:text-blue-400" />
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div 
                  key={service.id}
                  onClick={() => handleGhostClick(service.category)}
                  className="border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:border-brand/30 dark:hover:border-blue-400/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group opacity-60 hover:opacity-100 min-h-[180px]"
                >
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-full text-slate-400 group-hover:text-brand dark:group-hover:text-blue-400 mb-3 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-text-secondary dark:text-slate-400 group-hover:text-text-primary dark:group-hover:text-white transition-colors">
                    Add {service.category}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">No active contract found</p>
                </div>
              );
            }
          })}
        </div>
      </div>

      {showAddContract.isOpen && (
        <AddContractModal 
          category={showAddContract.category}
          onClose={() => setShowAddContract({ isOpen: false, category: '' })}
          onSave={handleContractSaved}
        />
      )}
    </div>
  );
}