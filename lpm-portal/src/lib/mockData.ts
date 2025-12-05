import type { Property, PropertyStatus, Contact } from '../dataModel';

export const generateMockProperties = (count: number): Property[] => {
  const vendors = ['Otis', 'Kone', 'Schindler', 'ThyssenKrupp', 'Local Independent'];
  const cities = ['New York', 'Chicago', 'Miami', 'Dallas', 'Seattle'];
  const statuses = ['active', 'warning', 'critical', 'missing_data'] as PropertyStatus[];

  return Array.from({ length: count }).map((_, i) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    // Dates
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + Math.floor(Math.random() * 365 * 2)); // 0-2 years out
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 5); // 5 year contracts

    // Mock Contacts
    const contacts: Contact[] = [
      { id: `c-${i}-1`, name: "John Smith", role: "Property Manager", email: "john@lpm.com", phone: "555-0101" },
      { id: `c-${i}-2`, name: "Sarah Connor", role: "Facility Head", email: "sarah@lpm.com", phone: "555-0102" }
    ];

    return {
      id: `prop-${i + 1}`,
      name: `LPM Building ${1000 + i}`,
      address: `${100 + i} Market Street`,
      city: randomCity,
      state: 'NY',
      zip: '10001',
      unitCount: Math.floor(Math.random() * 10) + 1,
      status: randomStatus,
      
      manager: {
        name: "Alex Rivera",
        email: `alex.${i}@lpm.com`,
        phone: "(555) 123-4567"
      },

      vendor: {
        name: randomVendor,
        rating: Math.floor(Math.random() * 5) + 5, // 5-10 scale in DB, displayed as 5 stars
        currentPrice: Math.floor(Math.random() * 5000) + 1000,
        accountNumber: `VEND-${10000 + i}`,
        serviceInstructions: "Check in with security at front desk. Keycard required for roof access."
      },

      contractStartDate: startDate.toISOString().split('T')[0],
      contractEndDate: endDate.toISOString().split('T')[0],
      cancellationWindow: '90-120 Days',
      autoRenews: true,
      contacts: contacts
    };
  });
};