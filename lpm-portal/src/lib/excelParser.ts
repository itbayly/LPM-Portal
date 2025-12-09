import * as XLSX from 'xlsx';
import type { Property, UserProfile, UserRole, AccessScope, Contact } from '../dataModel';

// --- TEMPLATES ---
const PROPERTY_HEADERS = [
  "Area", "Region", "Market", "Unique ID", "Building Name", "Entity Name", 
  "Street Address", "City", "State", "Zip", "Location Phone #", 
  "Regional Property Manager", "RPM Phone #", "RPM Email", 
  "Property Manager", "PM Phone #", "PM Email", 
  "# of Elevators", "Service Provider", "Account / Contract # ", 
  "Bill To #", "Building ID #", "Current Monthly Price", 
  "Contract Start Date", "Contract End Date", "Initial Term", "Renewal Term", 
  "Cancellation Window - Not Before", "Cancellation Window - Not After", 
  "Account Manager Name", "Account Manager Phone # ", "Account Manager Email", 
  "On National Contract"
];

const USER_HEADERS = ["Role Level", "Access Scope", "Name", "Email", "Phone"];

// --- HELPERS ---
const mapRole = (raw: string): UserRole => {
  const r = raw.toLowerCase().trim();
  if (r.includes('admin')) return 'admin';
  if (r.includes('entire') || r.includes('executive')) return 'executive';
  if (r.includes('area')) return 'area_vp';
  if (r.includes('region') && !r.includes('manager')) return 'region_vp';
  if (r.includes('market')) return 'market_manager';
  if (r.includes('regional property') || r.includes('rpm')) return 'regional_pm';
  return 'pm'; 
};

const mapScope = (role: UserRole, rawScope: string): AccessScope | undefined => {
  if (!rawScope) return undefined;
  if (role === 'admin' || role === 'executive') return { type: 'global', value: 'all' };
  if (role === 'area_vp') return { type: 'area', value: rawScope };
  if (role === 'region_vp') return { type: 'region', value: rawScope };
  if (role === 'market_manager') return { type: 'market', value: rawScope };
  return undefined; 
};

// --- DATE PARSING HELPER ---
const formatDateUS = (date: Date): string => {
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  return `${mm}-${dd}-${yyyy}`;
};

const processDate = (val: any): string => {
  if (!val) return "";
  if (typeof val === 'number') {
    if (val > 30000 && val < 60000) {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return formatDateUS(date); 
    }
    return String(val); 
  }
  if (val instanceof Date) return formatDateUS(val); 
  const strVal = String(val).trim();
  const d = new Date(strVal);
  if (!isNaN(d.getTime())) return formatDateUS(d); 
  return strVal; 
};

// --- EXPORTS ---

export const downloadTemplate = (type: 'property' | 'user') => {
  const headers = type === 'property' ? PROPERTY_HEADERS : USER_HEADERS;
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, `LPM_${type === 'property' ? 'Property' : 'User'}_Import_Template.xlsx`);
};

export const parseUserFile = async (file: File): Promise<UserProfile[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const users: UserProfile[] = jsonData.map((row: any) => {
          const role = mapRole(row['Role Level'] || '');
          return {
            email: String(row['Email'] || '').toLowerCase().trim(),
            name: row['Name'],
            phone: String(row['Phone'] || '').trim(), 
            role: role,
            scope: mapScope(role, row['Access Scope'])
          };
        }).filter(u => u.email && u.email.includes('@')); 

        resolve(users);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

export const parsePropertyFile = async (file: File): Promise<{ properties: Property[], derivedUsers: UserProfile[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        const derivedUsersMap = new Map<string, UserProfile>();

        const properties: Property[] = jsonData.map((row: any) => {
          const getVal = (key: string) => String(row[key] || '').trim();
          const getNum = (key: string) => Number(row[key]) || 0;
          const getDate = (key: string) => processDate(row[key]);

          const pmEmail = getVal('PM Email').toLowerCase();
          if (pmEmail) {
            derivedUsersMap.set(pmEmail, {
              email: pmEmail,
              name: getVal('Property Manager') || 'Unknown PM',
              phone: getVal('PM Phone #'),
              role: 'pm'
            });
          }

          const rpmEmail = getVal('RPM Email').toLowerCase();
          if (rpmEmail) {
            derivedUsersMap.set(rpmEmail, {
              email: rpmEmail,
              name: getVal('Regional Property Manager') || 'Unknown RPM',
              phone: getVal('RPM Phone #'),
              role: 'regional_pm'
            });
          }

          const contacts: Contact[] = [];
          const amName = getVal('Account Manager Name');
          if (amName) {
            contacts.push({
              id: `am-${Math.random().toString(36).substr(2, 5)}`,
              name: amName,
              role: 'Account Manager',
              phone: getVal('Account Manager Phone # '),
              email: getVal('Account Manager Email')
            });
          }

          const nb = getVal('Cancellation Window - Not Before');
          const na = getVal('Cancellation Window - Not After');
          let noticeString = "";
          if (nb && na) noticeString = `${nb} - ${na} Days`;
          else if (na) noticeString = `${na} Days`; 

          // Logic to read "X" as true
          const rawNational = getVal('On National Contract').toLowerCase();
          const isOnNational = rawNational === 'x' || rawNational === 'yes' || rawNational === 'true';

          return {
            id: getVal('Unique ID') || `gen-${Math.random().toString(36).substr(2, 9)}`,
            name: getVal('Building Name') || "Unknown Property",
            entityName: getVal('Entity Name'),
            address: getVal('Street Address'),
            city: getVal('City'),
            state: getVal('State'),
            zip: getVal('Zip'),
            locationPhone: getVal('Location Phone #'),
            unitCount: getNum('# of Elevators'),
            status: !getVal('Service Provider') ? 'missing_data' : 'active',
            
            hierarchy: {
              area: getVal('Area'),
              region: getVal('Region'),
              market: getVal('Market')
            },

            billTo: getVal('Bill To #'),
            buildingId: getVal('Building ID #'),
            managerEmail: pmEmail,
            regionalPmEmail: rpmEmail,

            manager: { name: getVal('Property Manager'), email: getVal('PM Email'), phone: getVal('PM Phone #') },
            regionalPm: { name: getVal('Regional Property Manager'), email: getVal('RPM Email'), phone: getVal('RPM Phone #') },
            
            vendor: {
              name: getVal('Service Provider'),
              rating: 0, 
              currentPrice: getNum('Current Monthly Price'),
              accountNumber: getVal('Account / Contract # '),
              serviceInstructions: "Contact Service Provider"
            },
            accountManager: {
              name: amName,
              phone: getVal('Account Manager Phone # '),
              email: getVal('Account Manager Email')
            },
            
            contractStartDate: getDate('Contract Start Date'),
            contractEndDate: getDate('Contract End Date'),
            initialTerm: getVal('Initial Term'),
            renewalTerm: getVal('Renewal Term'),
            cancellationWindow: noticeString,
            autoRenews: true,
            onNationalContract: isOnNational, 
            contacts: contacts
          };
        });

        resolve({ properties, derivedUsers: Array.from(derivedUsersMap.values()) });
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};
