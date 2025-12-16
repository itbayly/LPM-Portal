import { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import LandingPage from './features/landing/LandingPage';
import MasterGrid from './features/portfolio/MasterGrid';
import PortfolioTiles from './features/portfolio/PortfolioTiles'; 
import MatrixView from './features/portfolio/MatrixView';
import PropertyHub from './features/property/PropertyHub'; 
import MetricsHUD from './features/portfolio/MetricsHUD';
import IngestionConsole from './features/admin/IngestionConsole';
import AdminTools from './features/admin/AdminTools';
import AnalyticsView from './features/portfolio/AnalyticsView';
import UserManagement from './features/admin/UserManagement';
import AddPropertyModal from './features/property/components/AddPropertyModal';
import NoiseOverlay from './features/landing/components/NoiseOverlay';

import { 
  LayoutDashboard, LogOut, Upload, Search, PieChart, Users, AlertTriangle,
  Sun, Moon, LayoutGrid, Table as TableIcon, Grip 
} from 'lucide-react';
import { useProperties } from './hooks/useProperties';
import { cn } from './lib/utils';
import type { LegacyProperty, FilterType } from './dataModel';

function Dashboard() {
  const { logout, user, isAdmin, profile } = useAuth();
  const { properties, loading, error, updateProperty } = useProperties();

  // --- UI STATE ---
  const [selectedProperty, setSelectedProperty] = useState<LegacyProperty | null>(null);
  const [showIngestion, setShowIngestion] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // VIEW & LAYOUT STATE
  const [viewMode, setViewMode] = useState<'portfolio' | 'analytics' | 'users'>('portfolio');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'tiles' | 'matrix'>('tiles');
  
  const [isDark, setIsDark] = useState(false);

  // --- THEME LOGIC ---
  useEffect(() => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemDark) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  // --- DATA SECURITY: PERMISSION FILTER ---
  // This ensures users only see what they are allowed to see
  const accessibleProperties = useMemo(() => {
    if (!profile || !user) return [];
    
    // 1. GLOBAL ACCESS (Admins & Execs see everything)
    if (profile.role === 'admin' || profile.role === 'executive') {
      return properties;
    }

    // 2. PERSONAL PORTFOLIO (The "Individual" User)
    // Only show properties where they are the assigned Manager
    if (profile.scope?.type === 'portfolio' && profile.scope?.value === 'personal') {
      return properties.filter(p => p.managerEmail === user.email);
    }

    // 3. REGIONAL / AREA HIERARCHY
    // Match the property's hierarchy to the user's assigned scope
    if (profile.scope?.type === 'area') {
      return properties.filter(p => p.hierarchy?.area === profile.scope?.value);
    }
    if (profile.scope?.type === 'region') {
      return properties.filter(p => p.hierarchy?.region === profile.scope?.value);
    }
    if (profile.scope?.type === 'market') {
      return properties.filter(p => p.hierarchy?.market === profile.scope?.value);
    }

    // 4. DIRECT ASSIGNMENT (PM / RPM fallback)
    // If no specific scope, show properties where they are explicitly listed
    return properties.filter(p => 
      p.managerEmail === user.email || 
      p.regionalPmEmail === user.email
    );
  }, [properties, profile, user]);

  // --- AUTO-SWITCH LAYOUT LOGIC ---
  useEffect(() => {
    // If user has many properties, default to Grid. Otherwise Tiles.
    if (!loading && accessibleProperties.length > 15) {
      setLayoutMode('grid');
    } else {
      setLayoutMode('tiles');
    }
  }, [loading, accessibleProperties.length]);

  // --- SEARCH & FILTER LOGIC ---
  // Updated to search ONLY the accessibleProperties, not the raw list
  const searchResults = useMemo(() => {
    if (!searchQuery) return accessibleProperties;
    const q = searchQuery.toLowerCase();
    return accessibleProperties.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.zip.includes(q) || 
      p.id.toLowerCase().includes(q) ||
      p.vendor?.name.toLowerCase().includes(q)
    );
  }, [accessibleProperties, searchQuery]);

  const viewData = useMemo(() => {
    let result = searchResults;
    if (statusFilter !== 'all') {
      if (statusFilter === 'action_required') {
        result = result.filter(p => [
          'missing_data', 
          'pending_review', 
          'critical_action_required', 
          'cancellation_window_open', 
          'add_to_msa', 
          'service_contract_needed',
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

  // --- HANDLERS ---
  const handlePropertyUpdate = (id: string, data: Partial<LegacyProperty>) => {
    updateProperty(id, data);
    if (selectedProperty && selectedProperty.id === id) {
      setSelectedProperty({ ...selectedProperty, ...data } as LegacyProperty);
    }
  };

  const handlePropertyCreated = (newProp: LegacyProperty) => {
    setShowAddProperty(false);
    setSelectedProperty(newProp);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-[#050507] text-text-primary dark:text-white font-mono uppercase tracking-widest text-xs">Initializing Core...</div>;
  if (error) return <div className="p-xl text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-canvas dark:bg-[#050507] flex flex-col h-screen transition-colors duration-500 relative overflow-hidden">
      
      {/* 0. GLOBAL TEXTURE */}
      <NoiseOverlay />

      {/* 0.5 BACKGROUND BLOBS */}
      <div className="fixed -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand/5 dark:bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 1. NAVBAR - GLASS CONTROL DECK */}
      <nav className="h-16 px-6 shrink-0 z-50 flex items-center justify-between mt-4 mx-4 rounded-xl glass-panel relative">
        
        {/* Left: Identity */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setSelectedProperty(null)}>
          <div className="p-2 bg-black/5 dark:bg-white/10 rounded-md border border-black/5 dark:border-white/5 group-hover:scale-105 transition-transform">
             <LayoutDashboard className="h-5 w-5 text-text-primary dark:text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-text-primary dark:text-white leading-none">VNDR PLATFORM</span>
            <span className="text-[10px] font-mono text-text-secondary dark:text-slate-400 uppercase tracking-widest mt-1">Portfolio: {profile?.role === 'admin' ? 'Global' : (profile?.role === 'pm' && profile?.scope?.value === 'personal' ? 'Personal' : 'Enterprise')}</span>
          </div>
        </div>
        
        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          
          <button 
            onClick={toggleTheme}
            className="glass-button p-2.5 rounded-lg text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-text-primary dark:text-white">{user?.email}</div>
              <div className="text-[10px] font-mono text-text-secondary dark:text-slate-500 uppercase">{profile?.role || "Viewer"}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white/20 dark:ring-black/20">
              {user?.email?.[0].toUpperCase()}
            </div>
          </div>

          <button onClick={() => logout()} className="glass-button p-2.5 rounded-lg text-text-secondary hover:text-red-600 dark:hover:text-red-400" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* 2. MAIN CONTENT STAGE */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col relative z-10">
        {selectedProperty ? (
          <PropertyHub 
            property={selectedProperty} 
            onBack={() => setSelectedProperty(null)}
            onUpdate={handlePropertyUpdate}
          />
        ) : (
          <>
            {/* ALERT BANNER */}
            {(profile?.role === 'pm' || profile?.role === 'regional_pm') && 
             accessibleProperties.some(p => p.status === 'missing_data') && (
              <div className="mb-6 glass-panel border-l-4 border-l-red-500 p-4 rounded-r-xl flex items-center justify-between animate-in slide-in-from-top-2 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-500/10 rounded-full text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-600 dark:text-red-400 text-sm uppercase tracking-wide">Compliance Alert</h3>
                    <p className="text-sm text-text-secondary dark:text-slate-300">
                      {accessibleProperties.filter(p => p.status === 'missing_data').length} properties require data verification.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setStatusFilter('missing_data')}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-lg shadow-red-500/20 transition-all"
                >
                  Review Now
                </button>
              </div>
            )}

            {/* TOOLBAR */}
            {viewMode !== 'users' && (
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6 shrink-0">
                <div className="flex items-center gap-4 w-full xl:w-auto">
                  {/* Search Slot */}
                  <div className="relative group flex-1 md:flex-none">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary dark:text-slate-500 group-focus-within:text-brand dark:group-focus-within:text-blue-400 transition-colors" />
                    <input 
                      type="text"
                      placeholder="SEARCH DATABASE..."
                      className="h-11 pl-10 pr-4 w-full md:w-[320px] bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-sm text-text-primary dark:text-white font-mono placeholder:text-slate-400/50 focus:outline-none focus:border-brand dark:focus:border-blue-400 transition-all rounded-t-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute bottom-0 left-0 h-[1px] bg-brand dark:bg-blue-400 w-0 group-focus-within:w-full transition-all duration-300" />
                  </div>
                  
                  <MetricsHUD 
                    properties={searchResults} 
                    activeFilter={statusFilter}
                    onFilterChange={setStatusFilter}
                  />
                </div>

                <div className="flex items-center gap-3 self-end xl:self-auto">
                  
                  {/* VIEW TOGGLES */}
                  <div className="glass-panel p-1 flex gap-1 rounded-lg">
                    {/* Tile View */}
                    <button
                      onClick={() => { setViewMode('portfolio'); setLayoutMode('tiles'); }}
                      className={cn(
                        "p-2 rounded-md transition-all", 
                        viewMode === 'portfolio' && layoutMode === 'tiles'
                          ? "bg-white dark:bg-white/10 shadow-sm text-brand dark:text-white" 
                          : "text-text-secondary dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300"
                      )}
                      title="Tile View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>

                    {/* Grid View */}
                    <button
                      onClick={() => { setViewMode('portfolio'); setLayoutMode('grid'); }}
                      className={cn(
                        "p-2 rounded-md transition-all", 
                        viewMode === 'portfolio' && layoutMode === 'grid'
                          ? "bg-white dark:bg-white/10 shadow-sm text-brand dark:text-white" 
                          : "text-text-secondary dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300"
                      )}
                      title="List View"
                    >
                      <TableIcon className="w-4 h-4" />
                    </button>

                    {/* NEW: Matrix View */}
                    <button
                      onClick={() => { setViewMode('portfolio'); setLayoutMode('matrix'); }}
                      className={cn(
                        "p-2 rounded-md transition-all", 
                        viewMode === 'portfolio' && layoutMode === 'matrix'
                          ? "bg-white dark:bg-white/10 shadow-sm text-brand dark:text-white" 
                          : "text-text-secondary dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300"
                      )}
                      title="Matrix View"
                    >
                      <Grip className="w-4 h-4" />
                    </button>

                    {/* Analytics View */}
                    <button
                      onClick={() => setViewMode('analytics')}
                      className={cn(
                        "p-2 rounded-md transition-all", 
                        viewMode === 'analytics' 
                          ? "bg-white dark:bg-white/10 shadow-sm text-brand dark:text-white" 
                          : "text-text-secondary dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300"
                      )}
                      title="Analytics View"
                    >
                      <PieChart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setViewMode('users')} 
                          className="glass-button h-11 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300 flex items-center gap-2"
                        >
                          <Users className="w-4 h-4" /> Users
                        </button>
                        <button 
                          onClick={() => setShowIngestion(true)}
                          className="glass-button h-11 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-300 flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" /> Import
                        </button>
                      </>
                    )}
                    
                    {/* Add Asset (Universal) */}
                    <button 
                      onClick={() => setShowAddProperty(true)}
                      className="h-11 px-5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      + Add Asset
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0 relative">
              {viewMode === 'portfolio' && (
                layoutMode === 'grid' ? (
                  <MasterGrid 
                    data={viewData} 
                    onRowClick={(prop) => setSelectedProperty(prop)} 
                  />
                ) : layoutMode === 'matrix' ? (
                  <MatrixView
                    data={viewData}
                    onRowClick={(prop) => setSelectedProperty(prop)}
                  />
                ) : (
                  <PortfolioTiles 
                    data={viewData}
                    onCardClick={(prop) => setSelectedProperty(prop)}
                    onAddProperty={() => setShowAddProperty(true)}
                  />
                )
              )}
              {viewMode === 'analytics' && (
                <AnalyticsView data={viewData} />
              )}
              {viewMode === 'users' && isAdmin && (
                <UserManagement onBack={() => setViewMode('portfolio')} />
              )}
            </div>
          </>
        )}
      </main>

      {/* MODALS */}
      {showIngestion && <IngestionConsole onClose={() => setShowIngestion(false)} />}
      
      {showAddProperty && (
        <AddPropertyModal 
          onClose={() => setShowAddProperty(false)} 
          onSuccess={handlePropertyCreated} 
        />
      )}
      
      {isAdmin && <AdminTools />} 
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [isLoginView, setIsLoginView] = useState(false);

  if (user) {
    return <Dashboard />;
  }

  if (isLoginView) {
    return <LoginPage />;
  }

  return <LandingPage onLoginClick={() => setIsLoginView(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}