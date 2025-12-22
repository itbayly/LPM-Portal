export type UserRole = 'admin' | 'executive' | 'area_vp' | 'region_vp' | 'market_manager' | 'regional_pm' | 'pm' | 'user';

export type PropertyStatus = 
  | 'active' 
  | 'active_contract' 
  | 'on_national_agreement'
  | 'warning' 
  | 'notice_due_soon'
  | 'critical' 
  | 'critical_action_required'
  | 'missing_data'
  | 'no_elevators'
  | 'pending_review'
  | 'pending_rpm_review'
  | 'no_service_contract'
  | 'service_contract_needed'
  | 'cancellation_window_open'
  | 'add_to_msa';

export type FilterType = 'all' | 'action_required' | PropertyStatus;

export interface AccessScope {
  type: 'global' | 'area' | 'region' | 'market' | 'portfolio';
  value: string | string[]; 
}

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  scope?: AccessScope;
  phone?: string;
  lastLogin?: string;
  uid?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
}

export interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  storagePath?: string;
}

export interface Contract {
  id: string;
  category: string;
  vendor: string;
  status: PropertyStatus;
  cost: number;
  startDate?: string;
  endDate?: string;
  billingFrequency?: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  rating?: number; // <--- ADDED
  documents?: PropertyDocument[];
}

export interface Property {
  id: string;
  name: string;
  entityName?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  locationPhone?: string;
  buildingId?: string;

  hierarchy?: {
    area: string;
    region: string;
    market: string;
  };

  managerEmail?: string;
  regionalPmEmail?: string;
  manager?: { name: string; email: string; phone?: string };
  regionalPm?: { name: string; email: string; phone?: string };

  contacts?: Contact[];
  
  status: PropertyStatus;
  vendor: {
    name: string;
    rating?: number;
    accountNumber?: string;
    serviceInstructions?: string;
    currentPrice?: number;
    billingFrequency?: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  };
  
  unitCount: number;
  contractStartDate?: string;
  contractEndDate?: string;
  initialTerm?: string;
  renewalTerm?: string;
  cancellationWindow?: string;
  autoRenews?: boolean;
  onNationalContract?: boolean;
  
  priceCap?: string;
  earlyTerminationPenalty?: string;
  billTo?: string;

  accountManager?: {
    name: string;
    phone: string;
    email: string;
  };

  documents?: PropertyDocument[];
  contracts?: Contract[];
}