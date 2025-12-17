import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { Property } from '../../dataModel';

interface AnalyticsViewProps {
  data: Property[];
}

// THEME COLORS (Matches Tailwind Config)
const COLORS = {
  brand: '#2563EB',       // Blue
  success: '#10B981',     // Green
  warning: '#F59E0B',     // Amber
  danger: '#EF4444',      // Red
  slate: '#64748B',       // Slate
  dark: '#1E293B',        // Dark Slate
  white: '#FFFFFF',
  
  // Specific Status Colors
  status: {
    active: '#3B82F6',
    national: '#10B981',
    critical: '#EF4444',
    missing: '#94A3B8',
    pending: '#F97316',
  }
};

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  
  // 1. PORTFOLIO HEALTH (Pie Chart)
  const healthData = useMemo(() => {
    const counts: Record<string, number> = { 
      active: 0,
      national: 0,
      critical: 0,
      missing: 0,
      other: 0
    };

    data.forEach(p => {
      if (p.status === 'on_national_agreement') counts.national++;
      else if (p.status === 'active_contract') counts.active++;
      else if (['critical', 'critical_action_required', 'cancellation_window_open'].includes(p.status)) counts.critical++;
      else if (['missing_data', 'no_service_contract', 'service_contract_needed'].includes(p.status)) counts.missing++;
      else counts.other++;
    });
    
    return [
      { name: 'Active', value: counts.active, color: COLORS.status.active },
      { name: 'National', value: counts.national, color: COLORS.status.national },
      { name: 'Critical', value: counts.critical, color: COLORS.status.critical },
      { name: 'Missing', value: counts.missing, color: COLORS.status.missing },
      { name: 'Other', value: counts.other, color: COLORS.status.pending },
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

  // 3. EXPIRATION HORIZON (Timeline)
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

  // --- CUSTOM TOOLTIP ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md border border-black/5 dark:border-white/10 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-text-primary dark:text-white mb-1">{label}</p>
          <p className="font-mono text-brand dark:text-blue-400">
            {typeof payload[0].value === 'number' && payload[0].value > 1000 
              ? `$${payload[0].value.toLocaleString()}` 
              : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto pb-6">
      
      {/* CARD 1: HEALTH */}
      <div className="glass-panel p-6 rounded-xl flex flex-col h-[360px]">
        <h3 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest mb-4">Portfolio Health</h3>
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
                stroke="none"
              >
                {healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                formatter={(value) => <span className="text-xs font-medium text-text-secondary dark:text-slate-400 ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 2: VENDOR SPEND */}
      <div className="glass-panel p-6 rounded-xl flex flex-col h-[360px]">
        <h3 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest mb-4">Top Vendor Spend (Annual)</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendorData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{fontSize: 10, fill: '#94A3B8'}} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="value" fill={COLORS.brand} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 3: EXPIRATION HORIZON */}
      <div className="glass-panel p-6 rounded-xl flex flex-col md:col-span-2 lg:col-span-1 h-[360px]">
        <h3 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest mb-4">Expiration Horizon</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expirationData} margin={{ top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fill: '#94A3B8'}}
              />
              <YAxis 
                allowDecimals={false} 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fill: '#94A3B8'}}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="count" fill={COLORS.dark} radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}