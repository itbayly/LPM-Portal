import type { Property, PropertyStatus, Contact } from '../dataModel';

// 1. Define the Geographic Hierarchy Map
const GEO_MAP = [
  { city: 'New York', state: 'NY', market: 'NYC Metro', region: 'Northeast', area: 'East' },
  { city: 'Boston', state: 'MA', market: 'New England', region: 'Northeast', area: 'East' },
  { city: 'Chicago', state: 'IL', market: 'Chicagoland', region: 'Midwest', area: 'Central' },
  { city: 'Columbus', state: 'OH', market: 'Ohio Valley', region: 'Midwest', area: 'Central' },
  { city: 'Miami', state: 'FL', market: 'South Florida', region: 'Southeast', area: 'East' },
  { city: 'Atlanta', state: 'GA', market: 'Atlanta Metro', region: 'Southeast', area: 'East' },
  { city: 'Dallas', state: 'TX', market: 'North Texas', region: 'South Central', area: 'Central' },
  { city: 'Seattle', state: 'WA', market: 'Pacific NW', region: 'West', area: 'West' },
  { city: 'Los Angeles', state: 'CA', market: 'SoCal', region: 'West', area: 'West' },
  { city: 'Denver', state: 'CO', market: 'Mountain', region: 'West', area: 'West' },
];

const VENDORS = ['Otis', 'Kone', 'Schindler', 'ThyssenKrupp', 'Local Independent'];
const STATUSES: PropertyStatus[] = ['active', 'warning', 'critical', 'missing_data'];

export const generateMockProperties = (count: number): Property[] => {
  return Array.from({ length: count }).map((_, i) => {
    // Pick a random location from the hierarchy map
    const location = GEO_MAP[Math.floor(Math.random() * GEO_MAP.length)];
    const randomStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const randomVendor = VENDORS[Math.floor(Math.random() * VENDORS.length)];
    
    // Dates
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + Math.floor(Math.random() * 365 * 2)); // 0-2 years out
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 5); 

    // Mock Contacts
    const contacts: Contact[] = [
      { id: `c-${i}-1`, name: "John Smith", role: "Property Manager", email: "pm@lpm.com", phone: "555-0101" },
      { id: `c-${i}-2`, name: "Sarah Connor", role: "Regional PM", email: "rpm@lpm.com", phone: "555-0102" }
    ];

    return {
      id: `prop-${i + 1}`,
      name: `LPM Building ${1000 + i}`,
      address: `${100 + i} Market Street`,
      city: location.city,
      state: location.state,
      zip: '10001',
      unitCount: Math.floor(Math.random() * 20) + 1,
      status: randomStatus,
      
      // NEW: Hierarchy Data
      hierarchy: {
        area: location.area,
        region: location.region,
        market: location.market
      },

      // NEW: Security Assignment IDs (We use mock IDs for now)
      managerId: `user-pm-${i % 5}`, // Rotates between 5 mock PMs
      regionalPmId: `user-rpm-${i % 3}`, // Rotates between 3 mock RPMs

      manager: {
        name: "Alex Rivera",
        email: `pm.${i}@lpm.com`,
        phone: "(555) 123-4567"
      },

      vendor: {
        name: randomVendor,
        rating: Math.floor(Math.random() * 10) + 1,
        currentPrice: Math.floor(Math.random() * 5000) + 1000,
        accountNumber: `VEND-${10000 + i}`,
        serviceInstructions: "Check in with security at front desk."
      },

      contractStartDate: startDate.toISOString().split('T')[0],
      contractEndDate: endDate.toISOString().split('T')[0],
      cancellationWindow: '90-120 Days',
      autoRenews: true,
      contacts: contacts
    };
  });
};