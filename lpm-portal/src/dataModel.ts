export type PropertyStatus = 'active' | 'warning' | 'critical' | 'missing_data';

// UPDATED: Added 'action_required'
export type FilterType = 'all' | 'action_required' | PropertyStatus;

export interface Vendor {
  name: string;
  rating: number; // 1-5 Stars
  currentPrice: number;
  accountNumber: string;
  serviceInstructions: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  unitCount: number;
  status: PropertyStatus;
  
  // Relationships
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  
  vendor: Vendor;
  
  // Contract Logic
  contractStartDate: string;
  contractEndDate: string;
  cancellationWindow: string;
  autoRenews: boolean;
  
  contacts: Contact[];
}
