// --- UPDATED STATUS LIST ---
export type PropertyStatus = 
  // Action Required
  | 'missing_data' 
  | 'pending_review' 
  | 'critical_action_required' 
  | 'cancellation_window_open' 
  | 'add_to_msa' 
  | 'service_contract_needed'
  // No Action / Informational
  | 'notice_due_soon' 
  | 'no_elevators' 
  | 'active_contract' 
  | 'on_national_agreement';

// FILTER TYPES
export type FilterType = 'all' | 'action_required' | PropertyStatus;

// --- SECURITY & ROLES ---
export type UserRole = 
  | 'admin'           // Admin
  | 'executive'       // Entire Portfolio
  | 'area_vp'         // Area
  | 'region_vp'       // Region
  | 'market_manager'  // Market
  | 'regional_pm'     // Regional Property Manager
  | 'pm';             // Property Manager

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

// --- PROPERTY DATA ---

export interface Vendor {
  name: string;
  rating: number; // 1-10 Scale
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
  
  // NEW: To track how long a property has been in a status
  statusUpdatedAt?: string; // ISO Date String

  // Geographic Hierarchy
  hierarchy: PropertyHierarchy;

  // Internal IDs
  billTo: string;
  buildingId: string;

  // Assignment Emails
  managerEmail: string;
  regionalPmEmail: string;

  // Relationships
  manager: {
    name: string;
    email: string;
    phone: string;
  };

  regionalPm: {
    name: string;
    email: string;
    phone: string;
  };
  
  vendor: Vendor;
  accountManager: AccountManager;
  
  // Contract Logic
  contractStartDate: string;
  contractEndDate: string;
  initialTerm: string;
  renewalTerm: string;
  cancellationWindow: string; 
  
  earlyTerminationPenalty?: string;

  autoRenews: boolean;
  onNationalContract: boolean;
  
  contacts: Contact[];
}
