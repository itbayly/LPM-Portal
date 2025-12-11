import type { Contact } from '../../../dataModel'; // Note: This might also need ../../../../ depending on exact folder depth, check this too!

// --- CONSTANTS ---
export const VENDORS = ["Schindler", "Otis", "TK Elevator", "KONE", "Other"];
export const BILLING_FREQUENCIES = ["Monthly", "Quarterly", "Semi-Annual", "Annual"];
export const CHECKLIST_ITEMS = [
  "Fully Executed Service Contract",
  "Current Monthly Price",
  "Billing Frequency",
  "Current contract end date",
  "Account/Contract Number and Bill To Number",
  "Assigned point of contact"
];

// --- TYPES ---
// *IMPORTANT*: Ensure 'export' is here
export interface WizardFormData {
  // Triage
  hasElevators: boolean | null;
  hasProvider: boolean | null;

  // Vendor
  vendorName: string;
  vendorOther: string;
  unitCount: number | "";
  ratingRaw: number;
  onNationalContract: boolean;
  accountNumber: string;
  billTo: string;
  buildingId: string;
  serviceInstructions: string;

  // Billing
  currentPrice: number | "";
  billingFreq: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  hasPriceCap: boolean;
  priceCapValue: string;
  priceCapUnit: '$' | '%';

  // Terms
  contractStart: string;
  contractEnd: string;
  initialTermNum: number | "";
  initialTermUnit: string;
  
  autoRenews: boolean | null;
  renewalTermNum: number | "";
  renewalTermUnit: string;
  
  calculatedEnd: string;
  overrideEndDate: boolean;

  // Termination
  noticeDaysMin: string | number;
  noticeDaysMax: string | number;
  hasPenalty: boolean;
  penaltyType: "percentage" | "fixed";
  penaltyValue: string;

  // Contacts & Files
  contacts: Contact[];
  files: File[];
}

export interface StepProps {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
}

// --- HELPERS ---
export const parseTerm = (val: string | undefined) => {
  if (!val) return { num: "" as any, unit: "Years" };
  const num = parseInt(val);
  const unit = val.toLowerCase().includes('month') ? "Months" : "Years";
  return { num: isNaN(num) ? "" : num, unit };
};

export const formatPhoneNumber = (value: string) => {
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export const formatDateInput = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 8);
  if (v.length >= 5) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  } else if (v.length >= 3) {
    return `${v.slice(0, 2)}/${v.slice(2)}`;
  }
  return v;
};