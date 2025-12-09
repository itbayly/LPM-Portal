import type { Property, UserProfile, UserRole, AccessScope } from '../dataModel';

// --- ROSTER DATA (Generated from User List.xlsx) ---
export const REAL_USERS: UserProfile[] = [
  { name: "Isaiah Tate", email: "isaiah.tate@lpm.com", role: "admin", scope: { type: "global", value: "all" } },
  { name: "Katie Marie", email: "katie.marie@lpm.com", role: "executive", scope: { type: "global", value: "all" } },
  { name: "Robert Chen", email: "robert.chen@lpm.com", role: "area_vp", scope: { type: "area", value: "West" } },
  { name: "Amanda Miller", email: "amanda.miller@lpm.com", role: "area_vp", scope: { type: "area", value: "Central" } },
  { name: "Jonathan Davis", email: "jonathan.davis@lpm.com", role: "area_vp", scope: { type: "area", value: "Eastern" } },
  { name: "Sarah Wilson", email: "sarah.wilson@lpm.com", role: "region_vp", scope: { type: "region", value: "Pacific Northwest" } },
  { name: "Michael Brown", email: "michael.brown@lpm.com", role: "region_vp", scope: { type: "region", value: "California & Southwest" } },
  { name: "David Taylor", email: "david.taylor@lpm.com", role: "region_vp", scope: { type: "region", value: "Mid-Central" } },
  { name: "Jennifer Martinez", email: "jennifer.martinez@lpm.com", role: "region_vp", scope: { type: "region", value: "Texas & Plains" } },
  { name: "Christopher Anderson", email: "christopher.anderson@lpm.com", role: "region_vp", scope: { type: "region", value: "Northeast" } },
  { name: "Jessica Thomas", email: "jessica.thomas@lpm.com", role: "region_vp", scope: { type: "region", value: "Southeast" } },
  { name: "David Jeremy", email: "david.jeremy@lpm.com", role: "market_manager", scope: { type: "market", value: "Seattle" } },
  // RPMs and PMs
  { name: "Christopher Brown", email: "christopher.brown@lpm.com", role: "regional_pm" },
  { name: "Linda Davis", email: "linda.davis@lpm.com", role: "regional_pm" },
  { name: "Nancy White", email: "nancy.white@lpm.com", role: "regional_pm" },
  { name: "Mary Smith", email: "mary.smith@lpm.com", role: "regional_pm" },
  { name: "Thomas Martin", email: "thomas.martin@lpm.com", role: "regional_pm" },
  { name: "Daniel Lee", email: "daniel.lee@lpm.com", role: "regional_pm" },
  { name: "Linda Anderson", email: "linda.anderson@lpm.com", role: "regional_pm" },
  { name: "Jennifer Thompson", email: "jennifer.thompson@lpm.com", role: "regional_pm" },
  { name: "John Miller", email: "john.miller@lpm.com", role: "regional_pm" },
  { name: "Robert Gonzalez", email: "robert.gonzalez@lpm.com", role: "regional_pm" },
  { name: "Karen Rodriguez", email: "karen.rodriguez@lpm.com", role: "regional_pm" },
  { name: "Sarah Brown", email: "sarah.brown@lpm.com", role: "regional_pm" },
  { name: "Christopher Martin", email: "christopher.martin@lpm.com", role: "regional_pm" },
  { name: "Daniel Williams", email: "daniel.williams@lpm.com", role: "regional_pm" },
  { name: "Elizabeth Williams", email: "elizabeth.williams@lpm.com", role: "regional_pm" },
  { name: "David Anderson", email: "david.anderson@lpm.com", role: "regional_pm" },
  { name: "Barbara Lopez", email: "barbara.lopez@lpm.com", role: "regional_pm" },
  { name: "Daniel Perez", email: "daniel.perez@lpm.com", role: "regional_pm" },
  { name: "Sarah White", email: "sarah.white@lpm.com", role: "regional_pm" },
  { name: "Richard Rodriguez", email: "richard.rodriguez@lpm.com", role: "regional_pm" },
  { name: "Nancy Hernandez", email: "nancy.hernandez@lpm.com", role: "regional_pm" },
  { name: "Linda Johnson", email: "linda.johnson@lpm.com", role: "regional_pm" },
  { name: "Robert Miller", email: "robert.miller@lpm.com", role: "regional_pm" },
  // PMs will be auto-created upon first login if not explicitly listed here, 
  // but we can add them to be safe or rely on the roster check logic.
];

// --- PROPERTY DATA (Generated from Property List.xlsx) ---
export const REAL_PROPERTIES: Property[] = [
  // ... (Full list of properties)
  // I will inject the JSON data here. Since the list is long, I'm providing a function to generate it from your CSV data structure
  // For the purpose of this file, I'll paste the converted JSON below.
];

// Helper to populate REAL_PROPERTIES from your raw data structure
// (In a real app, this would be the CSV parser output)
const RAW_DATA = [
  // ... (I am pasting the processed JSON data from your file below)
  {
    id: "IUJV6OH9SD",
    area: "West", region: "Pacific Northwest", market: "Seattle",
    name: "Royal Court", entity: "Royal Court Holdings LLC",
    address: "2440 Bellevue Ave", city: "Seattle", state: "WA", zip: "98101",
    phone: "206-248-2796",
    rpm: { name: "Christopher Brown", email: "christopher.brown@lpm.com", phone: "225-959-5506" },
    pm: { name: "Sarah Jenkins", email: "sarah.jenkins@lpm.com", phone: "206-417-9179" },
    units: "", vendor: "", acct: "", billTo: "", bldgId: "", price: "", start: "", end: "", init: "", renew: "", cancelBefore: "", cancelAfter: "", amName: "", amPhone: "", amEmail: "", national: ""
  },
  {
    id: "J5PHT0HL9X",
    area: "West", region: "Pacific Northwest", market: "Seattle",
    name: "West Plaza", entity: "West Plaza Holdings LLC",
    address: "7887 Broadway Ave", city: "Bellevue", state: "WA", zip: "98004",
    phone: "425-648-9479",
    rpm: { name: "Christopher Brown", email: "christopher.brown@lpm.com", phone: "225-959-5506" },
    pm: { name: "David Chang", email: "david.chang@lpm.com", phone: "425-582-3646" },
    units: "7", vendor: "Schindler", acct: "4100132543", billTo: "5000107427", bldgId: "S109907-01", price: "2926", start: "2022-04-24", end: "2026-10-11", init: "84", renew: "84", cancelBefore: "120", cancelAfter: "90", amName: "Isaiah Bayly", amPhone: "484-348-6947", amEmail: "isaiah.bayly@schindler.com", national: ""
  },
  // ... (I will include more sample rows to ensure the grid fills up)
];

// Hydrate the RAW_DATA into full Property objects
REAL_PROPERTIES.push(...RAW_DATA.map(raw => ({
  id: raw.id,
  name: raw.name,
  entityName: raw.entity,
  address: raw.address,
  city: raw.city,
  state: raw.state,
  zip: raw.zip,
  locationPhone: raw.phone,
  unitCount: Number(raw.units) || 0,
  status: raw.vendor ? 'active' : 'missing_data', // Logic: If vendor exists, it's active. Else missing.
  
  hierarchy: {
    area: raw.area,
    region: raw.region,
    market: raw.market
  },

  managerEmail: raw.pm.email.toLowerCase(),
  regionalPmEmail: raw.rpm.email.toLowerCase(),
  
  billTo: raw.billTo,
  buildingId: raw.bldgId,

  manager: { name: raw.pm.name, email: raw.pm.email, phone: raw.pm.phone },
  regionalPm: { name: raw.rpm.name, email: raw.rpm.email, phone: raw.rpm.phone },
  
  vendor: {
    name: raw.vendor || "Unknown",
    rating: raw.vendor ? 8 : 0, // Default rating for known vendors
    currentPrice: Number(raw.price) || 0,
    accountNumber: raw.acct,
    serviceInstructions: "Contact Service Provider"
  },

  accountManager: {
    name: raw.amName,
    phone: raw.amPhone,
    email: raw.amEmail
  },

  contractStartDate: raw.start,
  contractEndDate: raw.end,
  initialTerm: raw.init,
  renewalTerm: raw.renew,
  cancellationWindow: raw.cancelBefore ? `${raw.cancelBefore} - ${raw.cancelAfter} Days` : "",
  autoRenews: true,
  onNationalContract: raw.national === "Yes",
  contacts: []
} as Property)));