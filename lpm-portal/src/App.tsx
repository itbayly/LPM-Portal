import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import MasterGrid from './features/portfolio/MasterGrid';
import PropertyDetail from './features/property/PropertyDetail';
import MetricsHUD from './features/portfolio/MetricsHUD';
import IngestionConsole from './features/admin/IngestionConsole';
import AdminTools from './features/admin/AdminTools';
import AnalyticsView from './features/portfolio/AnalyticsView';
import UserManagement from './features/admin/UserManagement';
import { LayoutDashboard, LogOut, Upload, Search, Bell, List, PieChart, Users, AlertTriangle } from 'lucide-react';
import { useProperties } from './hooks/useProperties';
import { cn } from './lib/utils';
import type { Property, FilterType } from './dataModel';

function Dashboard() {
  const { logout, user, isAdmin, profile } = useAuth();
  const { properties, loading, error, updateProperty } = useProperties();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showIngestion, setShowIngestion] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [viewMode, setViewMode] = useState<'grid' | 'analytics' | 'users'>('grid');

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
      p.vendor?.name.toLowerCase().includes(q)
    );
  }, [properties, searchQuery]);

  // 2. View Logic (UPDATED FILTERING)
  const viewData = useMemo(() => {
    let result = searchResults;
    if (statusFilter !== 'all') {
      if (statusFilter === 'action_required') {
        // UPDATED: Now includes ALL the new action statuses
        result = result.filter(p => [
          'missing_data', 
          'pending_review', 
          'critical_action_required', 
          'cancellation_window_open', 
          'add_to_msa', 
          'service_contract_needed',
          // Legacy fallbacks to be safe
          'critical',
          'pending_rpm_review',
          'no_service_contract'
        ].includes(p.status));
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
            {/* PM ACTION NOTIFICATION */}
            {(profile?.role === 'pm' || profile?.role === 'regional_pm') && 
             properties.some(p => p.status === 'missing_data') && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900">Action Required</h3>
                    <p className="text-sm text-red-700">
                      You have {properties.filter(p => p.status === 'missing_data').length} properties with missing contract data. Please verify them to ensure compliance.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setStatusFilter('missing_data')}
                  className="px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-bold rounded hover:bg-red-50 shadow-sm transition-colors"
                >
                  View Tasks
                </button>
              </div>
            )}

            {/* Toolbar */}
            {viewMode !== 'users' && (
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-md mb-lg shrink-0">
                <div className="flex items-center gap-md w-full xl:w-auto">
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
                  <MetricsHUD 
                    properties={searchResults} 
                    activeFilter={statusFilter}
                    onFilterChange={setStatusFilter}
                  />
                </div>

                <div className="flex items-center gap-2 self-end xl:self-auto">
                  
                  <div className="flex bg-white border border-border rounded-md shadow-sm h-12 p-1 gap-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn("px-3 rounded-sm flex items-center gap-2 transition-all", viewMode === 'grid' ? "bg-slate-100 text-brand font-bold" : "text-text-secondary hover:bg-slate-50")}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('analytics')}
                      className={cn("px-3 rounded-sm flex items-center gap-2 transition-all", viewMode === 'analytics' ? "bg-slate-100 text-brand font-bold" : "text-text-secondary hover:bg-slate-50")}
                      title="Analytics View"
                    >
                      <PieChart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-8 w-[1px] bg-border mx-2" />

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setViewMode('users')} 
                        className="h-12 px-4 bg-white border border-border rounded-md text-sm font-medium shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <Users className="w-4 h-4 text-text-secondary" />
                        Users
                      </button>
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
                    </>
                  )}
                  
                  <button className="h-12 w-12 flex items-center justify-center bg-white border border-border rounded-md shadow-sm hover:bg-slate-50 transition-colors">
                    <Bell className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
              </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex-1 min-h-0 relative">
              {viewMode === 'grid' && (
                <MasterGrid 
                  data={viewData} 
                  onRowClick={(prop) => setSelectedProperty(prop)} 
                />
              )}
              {viewMode === 'analytics' && (
                <AnalyticsView data={viewData} />
              )}
              {viewMode === 'users' && isAdmin && (
                <UserManagement onBack={() => setViewMode('grid')} />
              )}
            </div>
          </>
        )}
      </main>

      {showIngestion && <IngestionConsole onClose={() => setShowIngestion(false)} />}
      
      {isAdmin && <AdminTools />} 
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
