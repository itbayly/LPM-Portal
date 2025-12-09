import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { Property } from '../../dataModel';

interface AnalyticsViewProps {
  data: Property[];
}

// UPDATED: Color Mapping
const COLORS = {
  active_contract: '#2563EB',       // Blue
  on_national_agreement: '#10B981', // Green
  notice_due_soon: '#F59E0B',       // Amber
  missing_data: '#94A3B8',          // Slate
  pending_review: '#F97316',        // Orange
  critical_action_required: '#EF4444', // Red
  cancellation_window_open: '#DC2626', // Dark Red
  add_to_msa: '#4F46E5',            // Indigo
  service_contract_needed: '#BE123C', // Rose
  no_elevators: '#E2E8F0',          // Light Gray
  brand: '#2563EB',                 // Brand Blue
  dark: '#1E293B'                   // Slate 900
};

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  
  // 1. PORTFOLIO HEALTH (Pie Chart)
  const healthData = useMemo(() => {
    // Initialize counts for ALL new statuses
    const counts: Record<string, number> = { 
      active_contract: 0,
      on_national_agreement: 0,
      notice_due_soon: 0,
      missing_data: 0,
      pending_review: 0,
      critical_action_required: 0,
      cancellation_window_open: 0,
      add_to_msa: 0,
      service_contract_needed: 0,
      no_elevators: 0
    };

    data.forEach(p => {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    });
    
    return [
      { name: 'Active Contract', value: counts.active_contract, color: COLORS.active_contract },
      { name: 'National Agreement', value: counts.on_national_agreement, color: COLORS.on_national_agreement },
      { name: 'Notice Due', value: counts.notice_due_soon, color: COLORS.notice_due_soon },
      { name: 'Critical Action', value: counts.critical_action_required, color: COLORS.critical_action_required },
      { name: 'Window Open', value: counts.cancellation_window_open, color: COLORS.cancellation_window_open },
      { name: 'Pending Review', value: counts.pending_review, color: COLORS.pending_review },
      { name: 'No Contract', value: counts.service_contract_needed, color: COLORS.service_contract_needed },
      { name: 'Add to MSA', value: counts.add_to_msa, color: COLORS.add_to_msa },
      { name: 'Missing Data', value: counts.missing_data, color: COLORS.missing_data },
      { name: 'No Elevators', value: counts.no_elevators, color: COLORS.no_elevators },
    ].filter(d => d.value > 0);
  }, [data]);

  // 2. VENDOR SPEND (Bar Chart)
  const vendorData = useMemo(() => {
    const spend: Record<string, number> = {};
    data.forEach(p => {
      if (p.status === 'no_elevators') return;

      const name = p.vendor?.name || "Unknown";
      const price = p.vendor?.currentPrice || 0;
      spend[name] = (spend[name] || 0) + (price * 12); 
    });
    
    return Object.entries(spend)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) 
      .slice(0, 5); 
  }, [data]);

  // 3. EXPIRATION HORIZON (Timeline Bar Chart)
  const expirationData = useMemo(() => {
    const years: Record<string, number> = {};
    data.forEach(p => {
      if (p.status === 'no_elevators' || p.status === 'service_contract_needed') return;

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
      .sort((a, b) => Number(a.year) - Number(b.year)); 
  }, [data]);

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
