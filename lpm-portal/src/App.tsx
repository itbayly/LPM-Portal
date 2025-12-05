import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import MasterGrid from './features/portfolio/MasterGrid';
import PropertyDetail from './features/property/PropertyDetail';
import MetricsHUD from './features/portfolio/MetricsHUD';
import IngestionConsole from './features/admin/IngestionConsole';
import { LayoutDashboard, LogOut, Upload, Search, Calendar, AlertTriangle, Users } from 'lucide-react';
import { useProperties } from './hooks/useProperties';
import { cn } from './lib/utils';
import type { Property, FilterType } from './dataModel';

type SmartView = 'overview' | 'critical' | 'gaps' | 'vendor';

function Dashboard() {
  const { logout, user } = useAuth();
  const { properties, loading, error, updateProperty } = useProperties();

  // UI State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showIngestion, setShowIngestion] = useState(false);
  
  // Filters & Search
  const [currentView, setCurrentView] = useState<SmartView>('overview');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Search Algorithm (Indexed Fields: Name, Address, City, Zip, ID, Vendor)
  const searchResults = useMemo(() => {
    if (!searchQuery) return properties;
    const q = searchQuery.toLowerCase();
    return properties.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.zip.includes(q) || 
      p.id.toLowerCase().includes(q) ||
      p.vendor.name.toLowerCase().includes(q)
    );
  }, [properties, searchQuery]);

  // 2. View Logic
  const viewData = useMemo(() => {
    let result = searchResults;

    switch (currentView) {
      case 'critical':
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        result = searchResults.filter(p => new Date(p.contractEndDate) < sixMonthsFromNow);
        break;
      case 'gaps':
        result = searchResults.filter(p => p.status === 'missing_data');
        break;
      case 'vendor':
        // Note: Main alphabetical sort is now handled by MasterGrid headers, 
        // but this view could pre-sort or grouping logic in future.
        result = [...searchResults].sort((a, b) => a.vendor.name.localeCompare(b.vendor.name));
        break;
      case 'overview':
      default:
        break;
    }

    // Apply HUD Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    return result;
  }, [searchResults, currentView, statusFilter]);

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
            {/* UNIFIED TOOLBAR: HUD + Actions + Search */}
            <div className="shrink-0 space-y-4 mb-4">
              
              {/* Row 1: Slim KPI Strip */}
              <MetricsHUD 
                properties={searchResults} 
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
              />

              {/* Row 2: Controls */}
              <div className="flex justify-between items-end">
                
                {/* Left: Tabs + Search */}
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative group">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary group-focus-within:text-brand transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search portfolio..."
                      className="h-9 pl-9 pr-4 w-[240px] bg-white border border-border rounded-sm text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Divider */}
                  <div className="h-6 w-[1px] bg-border" />

                  {/* Tabs */}
                  <div className="flex p-0.5 bg-slate-100 rounded-md border border-slate-200">
                    {[
                      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                      { id: 'critical', label: 'Critical', icon: Calendar },
                      { id: 'gaps', label: 'Gaps', icon: AlertTriangle },
                      { id: 'vendor', label: 'Vendors', icon: Users },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => { setCurrentView(tab.id as SmartView); setStatusFilter('all'); }}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2",
                          currentView === tab.id ? "bg-white text-brand shadow-sm" : "text-text-secondary hover:text-text-primary"
                        )}
                      >
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowIngestion(true)}
                    className="h-9 px-4 bg-white border border-border rounded-sm text-sm font-medium shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-text-secondary" />
                    Import
                  </button>
                  <button className="h-9 px-4 bg-brand text-white rounded-sm text-sm font-medium shadow-sm hover:bg-brand-dark transition-colors">
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
