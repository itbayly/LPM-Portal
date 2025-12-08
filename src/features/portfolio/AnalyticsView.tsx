import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { Property } from '../../dataModel';

interface AnalyticsViewProps {
  data: Property[];
}

const COLORS = {
  active: '#10B981',        // Green
  warning: '#F59E0B',       // Amber
  critical: '#EF4444',      // Red
  missing: '#94A3B8',       // Slate (Missing Data)
  pending: '#F97316',       // Orange (Pending RPM)
  no_contract: '#DC2626',   // Dark Red (No Contract Risk)
  no_elevators: '#E2E8F0',  // Light Gray (No Assets)
  brand: '#2563EB',         // Blue
  dark: '#1E293B'           // Slate 900
};

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  
  // 1. PORTFOLIO HEALTH (Pie Chart)
  const healthData = useMemo(() => {
    // Initialize counts for ALL statuses
    const counts = { 
      active: 0, 
      warning: 0, 
      critical: 0, 
      missing_data: 0,
      no_elevators: 0,
      pending_rpm_review: 0,
      no_service_contract: 0
    };

    data.forEach(p => {
      const s = p.status;
      // Increment only if status is a valid key in our counts object
      if (counts[s as keyof typeof counts] !== undefined) {
        counts[s as keyof typeof counts]++;
      }
    });
    
    return [
      { name: 'Active', value: counts.active, color: COLORS.active },
      { name: 'Review', value: counts.warning, color: COLORS.warning },
      { name: 'Critical', value: counts.critical, color: COLORS.critical },
      { name: 'Pending RPM', value: counts.pending_rpm_review, color: COLORS.pending },
      { name: 'No Contract', value: counts.no_service_contract, color: COLORS.no_contract },
      { name: 'Missing Data', value: counts.missing_data, color: COLORS.missing },
      { name: 'No Elevators', value: counts.no_elevators, color: COLORS.no_elevators },
    ].filter(d => d.value > 0);
  }, [data]);

  // 2. VENDOR SPEND (Bar Chart)
  const vendorData = useMemo(() => {
    const spend: Record<string, number> = {};
    data.forEach(p => {
      // Exclude properties with no elevators from spend analysis
      if (p.status === 'no_elevators') return;

      const name = p.vendor?.name || "Unknown";
      const price = p.vendor?.currentPrice || 0;
      // Annualize the monthly price
      spend[name] = (spend[name] || 0) + (price * 12); 
    });
    
    return Object.entries(spend)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort highest spend first
      .slice(0, 5); // Top 5 vendors only
  }, [data]);

  // 3. EXPIRATION HORIZON (Timeline Bar Chart)
  const expirationData = useMemo(() => {
    const years: Record<string, number> = {};
    data.forEach(p => {
      // Exclude irrelevant statuses
      if (p.status === 'no_elevators' || p.status === 'no_service_contract') return;

      if (p.contractEndDate) {
        const d = new Date(p.contractEndDate);
        const year = d.getFullYear();
        if (!isNaN(year)) {
          years[year] = (years[year] || 0) + 1;
        }
      }
    });

    return Object.entries(years)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => Number(a.year) - Number(b.year)); // Chronological order
  }, [data]);

  // -- RENDERING --
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 p-10">
        No data available for analysis.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1 h-full overflow-y-auto">
      
      {/* CARD 1: HEALTH */}
      <div className="bg-surface border border-border rounded-md shadow-sm p-4 flex flex-col h-[320px]">
        <h3 className="text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Portfolio Health</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={healthData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => [val, 'Properties']} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 2: TOP VENDORS BY SPEND */}
      <div className="bg-surface border border-border rounded-md shadow-sm p-4 flex flex-col h-[320px]">
        <h3 className="text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Top Vendors (Annual Spend)</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendorData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
              <Tooltip 
                formatter={(val: number) => [`$${val.toLocaleString()}`, 'Annual Spend']}
                cursor={{fill: '#f1f5f9'}}
              />
              <Bar dataKey="value" fill={COLORS.brand} radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 3: EXPIRATION TIMELINE */}
      <div className="bg-surface border border-border rounded-md shadow-sm p-4 flex flex-col md:col-span-2 lg:col-span-1 h-[320px]">
        <h3 className="text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Expiration Horizon</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expirationData} margin={{ top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="count" fill={COLORS.dark} radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}