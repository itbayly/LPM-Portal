// --- UPDATED STATUS LIST ---
export type PropertyStatus = 
  | 'missing_data' 
  | 'pending_review' 
  | 'critical_action_required' 
  | 'cancellation_window_open' 
  | 'add_to_msa' 
  | 'service_contract_needed'
  | 'notice_due_soon' 
  | 'no_elevators' 
  | 'active_contract' 
  | 'on_national_agreement'
  // Legacy/Fallbacks
  | 'active'
  | 'warning'
  | 'critical'
  | 'pending_rpm_review'
  | 'no_service_contract';

export type FilterType = 'all' | 'action_required' | PropertyStatus;

export type UserRole = 
  | 'admin' | 'executive' | 'area_vp' | 'region_vp' 
  | 'market_manager' | 'regional_pm' | 'pm';

export interface AccessScope {
  type: 'global' | 'area' | 'region' | 'market';
  value: string | string[]; 
}

export interface UserProfile {
  uid?: string; 
  email: string;
  name: string;
  phone?: string; 
  role: UserRole;
  scope?: AccessScope; 
}

// --- DOCUMENTS ---
export interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  type: string; 
  storagePath?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// --- PROPERTY DATA ---

export interface Vendor {
  name: string;
  rating: number; 
  currentPrice: number;
  billingFrequency?: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual'; 
  accountNumber: string;
  serviceInstructions: string;
}

export interface AccountManager {
  name: string;
  phone: string;
  email: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary?: boolean; // NEW FIELD
}

export interface PropertyHierarchy {
  area: string;   
  region: string; 
  market: string; 
}

export interface Property {
  id: string; 
  name: string; 
  entityName: string; 
  address: string;
  city: string;
  state: string;
  zip: string;
  locationPhone: string;
  unitCount: number;
  status: PropertyStatus;
  statusUpdatedAt?: string;

  hierarchy: PropertyHierarchy;
  billTo: string;
  buildingId: string;

  managerEmail: string;
  regionalPmEmail: string;

  manager: { name: string; email: string; phone: string; };
  regionalPm: { name: string; email: string; phone: string; };
  
  vendor: Vendor;
  accountManager: AccountManager;
  
  contractStartDate: string;
  contractEndDate: string;
  initialTerm: string;
  renewalTerm: string;
  cancellationWindow: string; 
  
  earlyTerminationPenalty?: string;
  priceCap?: string; 

  autoRenews: boolean;
  onNationalContract: boolean;
  
  contacts: Contact[];
  
  documents?: PropertyDocument[];
}