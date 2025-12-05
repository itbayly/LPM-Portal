import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import MasterGrid from './features/portfolio/MasterGrid';
import PropertyDetail from './features/property/PropertyDetail';
import MetricsHUD from './features/portfolio/MetricsHUD';
import FilterBar from './features/portfolio/FilterBar';
import IngestionConsole from './features/admin/IngestionConsole';
// REMOVED: Database
import { LayoutDashboard, LogOut, Upload, Search, Calendar, AlertTriangle, Users } from 'lucide-react';
import { useProperties } from './hooks/useProperties';
import { cn } from './lib/utils';
import type { Property } from './dataModel';

type SmartView = 'overview' | 'critical' | 'gaps' | 'vendor';

function Dashboard() {
  const { logout, user } = useAuth();
  // REMOVED: seedDatabase
  const { properties, loading, error, updateProperty } = useProperties();

  // UI State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showIngestion, setShowIngestion] = useState(false);
  
  // Filters & Search
  const [currentView, setCurrentView] = useState<SmartView>('overview');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all'); // <-- ADD THIS
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicFilters, setDynamicFilters] = useState({
    state: '',
    city: '',
    vendor: ''
  });

  // --- SMART FILTER LOGIC [PRD Section 4] ---
  
  // 1. Search Algorithm (Indexed Fields: Name, Address, City, Zip, ID, Vendor)
  const searchResults = useMemo(() => {
    if (!searchQuery) return properties;
    const q = searchQuery.toLowerCase();
    return properties.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.zip.includes(q) || 
      p.id.toLowerCase().includes(q) || // Added ID Search
      p.vendor.name.toLowerCase().includes(q)
    );
  }, [properties, searchQuery]);

  // 2. Drill-Down Filters (State > City > Vendor)
  const filteredData = useMemo(() => {
    return searchResults.filter(p => {
      if (dynamicFilters.state && p.state !== dynamicFilters.state) return false;
      if (dynamicFilters.city && p.city !== dynamicFilters.city) return false;
      if (dynamicFilters.vendor && p.vendor.name !== dynamicFilters.vendor) return false;
      return true;
    });
  }, [searchResults, dynamicFilters]);

  // 3. View Logic (The "Smart Tabs" + HUD Filter)
  const viewData = useMemo(() => {
    // A. First apply the "Smart View" logic
    let result = filteredData;

    switch (currentView) {
      case 'critical':
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        result = filteredData.filter(p => new Date(p.contractEndDate) < sixMonthsFromNow);
        break;
      case 'gaps':
        result = filteredData.filter(p => p.status === 'missing_data');
        break;
      case 'vendor':
        result = [...filteredData].sort((a, b) => a.vendor.name.localeCompare(b.vendor.name));
        break;
      case 'overview':
      default:
        // No specific view logic, keep standard list
        break;
    }

    // B. Then apply the HUD Status Filter (if a tile is clicked)
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    return result;
  }, [filteredData, currentView, statusFilter]);


  // Handlers
  const handlePropertyUpdate = (id: string, data: Partial<Property>) => {
    updateProperty(id, data);
    if (selectedProperty && selectedProperty.id === id) {
      setSelectedProperty({ ...selectedProperty, ...data } as Property);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-canvas">Loading...</div>;
  if (error) return <div className="p-xl text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-canvas flex flex-col h-screen">
      
      {/* Navbar */}
      <nav className="h-16 bg-surface border-b border-border flex items-center justify-between px-xl shrink-0 z-20">
        <div className="flex items-center gap-sm cursor-pointer" onClick={() => setSelectedProperty(null)}>
          <div className="p-1.5 bg-brand/10 rounded-sm">
             <LayoutDashboard className="h-5 w-5 text-brand" />
          </div>
          <span className="font-bold text-text-primary">LPM Command Center</span>
        </div>
        <div className="flex items-center gap-md">
          <span className="text-sm text-text-secondary">{user?.email}</span>
          <button onClick={() => logout()} className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 p-xl overflow-hidden flex flex-col">
        {selectedProperty ? (
          <PropertyDetail 
            property={selectedProperty} 
            onBack={() => setSelectedProperty(null)}
            onUpdate={handlePropertyUpdate}
          />
        ) : (
          <>
            {/* HUD Metrics (Uses filtered data context) */}
            <div className="shrink-0">
              <MetricsHUD 
                properties={filteredData} 
                activeFilter={statusFilter} // <-- UPDATED
                onFilterChange={setStatusFilter} // <-- UPDATED
              />

              {/* Dynamic Filter Bar */}
              <FilterBar 
                properties={properties} // Pass full list to derive options
                filters={dynamicFilters}
                onFilterChange={(k, v) => setDynamicFilters(prev => ({ ...prev, [k]: v }))}
                onClear={() => setDynamicFilters({ state: '', city: '', vendor: '' })}
              />

              {/* View Tabs & Search Row */}
              <div className="flex justify-between items-end mb-lg">
                <div className="flex flex-col gap-md">
                  
                  {/* Smart View Tabs */}
                  <div className="flex p-1 bg-slate-100 rounded-md border border-slate-200 self-start">
                    <button
                      onClick={() => setCurrentView('overview')}
                      setStatusFilter('all');
                      className={cn(
                        "px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2",
                        currentView === 'overview' ? "bg-white text-brand shadow-sm" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> Portfolio Overview
                    </button>
                    <button
                      onClick={() => setCurrentView('critical')}
                      className={cn(
                        "px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2",
                        currentView === 'critical' ? "bg-white text-status-critical shadow-sm" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Critical Dates
                    </button>
                    <button
                      onClick={() => setCurrentView('gaps')}
                      className={cn(
                        "px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2",
                        currentView === 'gaps' ? "bg-white text-orange-600 shadow-sm" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Data Gaps
                    </button>
                    <button
                      onClick={() => setCurrentView('vendor')}
                      className={cn(
                        "px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2",
                        currentView === 'vendor' ? "bg-white text-blue-600 shadow-sm" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      <Users className="w-3.5 h-3.5" /> Vendor Exposure
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative group">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary group-focus-within:text-brand transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search ID, Name, City, or Vendor..."
                      className="h-10 pl-9 pr-4 w-[380px] bg-white border border-border rounded-sm text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-sm">
                  <button 
                    onClick={() => setShowIngestion(true)}
                    className="px-4 py-2 bg-white border border-border rounded-sm text-sm font-medium shadow-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-text-secondary" />
                    Import Data
                  </button>
                  <button className="px-4 py-2 bg-brand text-white rounded-sm text-sm font-medium shadow-sm hover:bg-brand-dark">
                    + Add Property
                  </button>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 min-h-0"> 
              <MasterGrid 
                data={viewData} 
                onRowClick={(prop) => setSelectedProperty(prop)} 
              />
            </div>
          </>
        )}
      </main>

      {showIngestion && <IngestionConsole onClose={() => setShowIngestion(false)} />}
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
