import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import MasterGrid from './features/portfolio/MasterGrid';
import PropertyDetail from './features/property/PropertyDetail';
import MetricsHUD from './features/portfolio/MetricsHUD';
import IngestionConsole from './features/admin/IngestionConsole';
import { LayoutDashboard, LogOut, Upload, Search, Bell } from 'lucide-react';
import { useProperties } from './hooks/useProperties';
import type { Property, FilterType } from './dataModel';

function Dashboard() {
  const { logout, user } = useAuth();
  const { properties, loading, error, updateProperty } = useProperties();

  // UI State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showIngestion, setShowIngestion] = useState(false);
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Search Algorithm
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

  // 2. View Logic (Status Filter Only)
  const viewData = useMemo(() => {
    let result = searchResults;

    // Apply HUD Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'action_required') {
        result = result.filter(p => ['critical', 'missing_data', 'warning'].includes(p.status));
      } else {
        result = result.filter(p => p.status === statusFilter);
      }
    }

    return result;
  }, [searchResults, statusFilter]);

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
            {/* UNIFIED HEADER ROW */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-md mb-lg shrink-0">
              
              {/* Left Group: Search + HUD */}
              <div className="flex items-center gap-md w-full xl:w-auto">
                
                {/* Search Bar */}
                <div className="relative group flex-1 md:flex-none">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary group-focus-within:text-brand transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search portfolio..."
                    className="h-12 pl-10 pr-4 w-full md:w-[320px] bg-white border border-border rounded-md text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Metrics HUD */}
                <MetricsHUD 
                  properties={searchResults} 
                  activeFilter={statusFilter}
                  onFilterChange={setStatusFilter}
                />
              </div>

              {/* Right Group: Actions + Bell */}
              <div className="flex items-center gap-2 self-end xl:self-auto">
                <button 
                  onClick={() => setShowIngestion(true)}
                  className="h-12 px-4 bg-white border border-border rounded-md text-sm font-medium shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 text-text-secondary" />
                  Import
                </button>
                <button className="h-12 px-4 bg-brand text-white rounded-md text-sm font-medium shadow-sm hover:bg-brand-dark transition-colors whitespace-nowrap">
                  + Add Property
                </button>
                
                <div className="h-8 w-[1px] bg-border mx-2" />
                
                <button className="h-12 w-12 flex items-center justify-center bg-white border border-border rounded-md shadow-sm hover:bg-slate-50 transition-colors">
                  <Bell className="w-5 h-5 text-text-secondary" />
                </button>
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
