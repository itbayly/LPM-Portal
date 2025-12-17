import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, FileText, Loader2, CheckCircle2, 
  ChevronRight, Search, UploadCloud, Sparkles, Sun, Moon,
  User, Phone, ArrowRight
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../../lib/utils';
import type { Property } from '../../dataModel';
import NoiseOverlay from '../landing/components/NoiseOverlay';

// --- CONSTANTS ---

const BUILDING_TYPES = [
  "Amusement Park", "Apartments", "Assisted Living Facility", "Automotive Dealership", "Bank", 
  "Big Box Retailer", "Bio-Tech / Life Sciences Lab", "Bowling Alley", "Car Wash", "Casino", 
  "Church", "Movie Theater", "Cold Storage Facility", "Community Retail Center", "Convenience Store", 
  "Gas Station", "Convention Center", "Co-working Space", "Data Center", "Daycare Center", 
  "Distribution Center", "Dormitory / Student Housing", "Restaurant", "Flex Space", "Funeral Home", 
  "Golf Course", "Government Building", "Gym / Fitness Center", "Hospital", "Hotel", 
  "Independent Living Facility", "Library", "Lifestyle Center", "Lumber Yard", "Mall", 
  "Manufactured Housing Community (Mobile Home Park)", "Manufacturing Plant", "Marina", 
  "Medical Office Building (MOB)", "Memory Care Facility", "Mixed-Use Building", "Motel", 
  "Museum / Art Gallery", "Nightclub / Bar", "Nursing Home / Skilled Nursing Facility", 
  "Office Park", "Outlet Mall", "Parking Garage", "R&D Facility", "Resort", "School", 
  "University", "Self-Storage Facility", "Shopping Center", "Stadium / Arena", "Strip Mall", 
  "Office Building", "Supermarket / Grocery Store", "Truck Terminal", "Urgent Care Clinic", 
  "Veterinary Clinic", "Warehouse", "Wedding Venue", "Banquet Hall", "Winery", "Vineyard", "Brewery"
];

const KEYWORD_MAPPING: Record<string, string[]> = {
  "luxury": ["Apartments", "Condominium", "Resort", "Hotel"],
  "living": ["Apartments", "Assisted Living Facility", "Independent Living Facility", "Senior Living"],
  "condo": ["Apartments", "Mixed-Use Building"],
  "tech": ["Data Center", "R&D Facility", "Bio-Tech / Life Sciences Lab"],
  "lab": ["Bio-Tech / Life Sciences Lab", "Medical Office Building (MOB)"],
  "shop": ["Shopping Center", "Strip Mall", "Big Box Retailer", "Outlet Mall"],
  "food": ["Restaurant", "Supermarket / Grocery Store", "Convenience Store"],
  "storage": ["Self-Storage Facility", "Cold Storage Facility", "Warehouse"],
  "auto": ["Automotive Dealership", "Car Wash", "Parking Garage"],
  "care": ["Urgent Care Clinic", "Hospital", "Nursing Home", "Veterinary Clinic"],
  "med": ["Medical Office Building (MOB)", "Hospital", "Urgent Care Clinic"],
  "school": ["School", "University", "Daycare Center"],
  "fun": ["Amusement Park", "Bowling Alley", "Movie Theater", "Casino"]
};

const MOCK_ADDRESSES = [
  { label: "1 World Trade Center, New York, NY 10007", addr: "1 World Trade Center", city: "New York", state: "NY", zip: "10007" },
  { label: "350 5th Ave, New York, NY 10118", addr: "350 5th Ave", city: "New York", state: "NY", zip: "10118" },
  { label: "1 Apple Park Way, Cupertino, CA 95014", addr: "1 Apple Park Way", city: "Cupertino", state: "CA", zip: "95014" },
  { label: "1600 Amphitheatre Pkwy, Mountain View, CA 94043", addr: "1600 Amphitheatre Pkwy", city: "Mountain View", state: "CA", zip: "94043" },
  { label: "221B Baker St, London, UK", addr: "221B Baker St", city: "London", state: "UK", zip: "NW1 6XE" },
  { label: "742 Evergreen Terrace, Springfield, OR 97477", addr: "742 Evergreen Terrace", city: "Springfield", state: "OR", zip: "97477" },
  { label: "123 Main St, Anytown, USA 12345", addr: "123 Main St", city: "Anytown", state: "CA", zip: "12345" },
];

interface OnboardingWizardProps {
  onComplete: (propertyData: Partial<Property>, contractData: any) => void;
}

// --- SUB-COMPONENTS ---

const InputSlot = ({ label, value, onChange, placeholder, icon: Icon, type = "text", onClick, readOnly }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans ml-1">
      {label}
    </label>
    <div className="relative flex items-center group">
      {Icon && (
        <div className="absolute left-3 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onClick={onClick}
        readOnly={readOnly}
        placeholder={placeholder}
        className={cn(
          "w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-sans",
          Icon ? "pl-10 pr-4" : "px-4"
        )}
      />
    </div>
  </div>
);

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isDark, setIsDark] = useState(false);

  // --- THEME LOGIC ---
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDomDark = document.documentElement.classList.contains('dark');
    
    if (stored === 'dark' || (!stored && isDomDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // --- STEP 1: PROFILE DATA ---
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- STEP 2: ASSET DATA ---
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    buildingType: '',
    buildingId: ''
  });

  // Combo & Address State
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [comboQuery, setComboQuery] = useState('');
  const comboRef = useRef<HTMLDivElement>(null);
  
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);

  // --- STEP 3: CONTRACT DATA ---
  const [dragActive, setDragActive] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');

  // --- MEMOS & HELPERS ---

  const filteredTypes = useMemo(() => {
    if (!comboQuery) return BUILDING_TYPES;
    const query = comboQuery.toLowerCase();
    
    const smartMatches: string[] = [];
    Object.entries(KEYWORD_MAPPING).forEach(([keyword, types]) => {
      if (query.includes(keyword)) smartMatches.push(...types);
    });

    const directMatches = BUILDING_TYPES.filter(t => t.toLowerCase().includes(query));
    return Array.from(new Set([...smartMatches, ...directMatches]));
  }, [comboQuery]);

  const filteredAddresses = useMemo(() => {
    if (!formData.address) return [];
    return MOCK_ADDRESSES.filter(a => a.label.toLowerCase().includes(formData.address.toLowerCase()));
  }, [formData.address]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(event.target as Node)) setIsComboOpen(false);
      if (addressRef.current && !addressRef.current.contains(event.target as Node)) setIsAddressOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---

  const handleProfileSubmit = async () => {
    if (!user || !profileData.firstName || !profileData.lastName) return;
    setIsSavingProfile(true);
    
    try {
      // Update the user document in Firestore
      await updateDoc(doc(db, "users", user.email!), {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        phone: profileData.phone
      });
      setStep(2);
    } catch (err) {
      console.error("Profile update failed", err);
      // Optional: Add error state here
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddressSelect = (addrObj: typeof MOCK_ADDRESSES[0]) => {
    setFormData(prev => ({
      ...prev,
      address: addrObj.addr,
      city: addrObj.city,
      state: addrObj.state,
      zip: addrObj.zip
    }));
    setIsAddressOpen(false);
  };

  const handleNextStep = () => {
    if (!formData.name || !formData.address) return; 
    setStep(3);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const transferType = e.dataTransfer.getData('application/vndr-sample');
    if (e.dataTransfer.files[0] || transferType === 'true') {
      startAnalysis();
    }
  };

  const startAnalysis = () => {
    setAnalysisStatus('analyzing');
    setTimeout(() => {
      setAnalysisStatus('complete');
    }, 2000);
  };

  const handleFinalize = () => {
    const propertyData: Partial<Property> = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      buildingId: formData.buildingId || `BLD-${Math.floor(Math.random() * 10000)}`,
      entityName: formData.buildingType, 
      status: 'service_contract_needed' 
    };
    onComplete(propertyData, null); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-indigo-50/30 to-white dark:from-[#0F172A] dark:via-[#020617] dark:to-[#0F172A] transition-colors duration-700">
      
      {/* Environment */}
      <div className="opacity-40 dark:opacity-70 transition-opacity duration-700">
        <NoiseOverlay />
      </div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 bg-indigo-300/30 dark:bg-indigo-500/20" 
      />

      {/* THEME TOGGLE */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-[60] p-3 rounded-full backdrop-blur-md transition-all shadow-lg group bg-white/40 border border-white/50 text-slate-500 hover:bg-white/60 hover:text-indigo-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
      >
        {isDark ? <Sun className="w-5 h-5 group-hover:text-yellow-400 transition-colors" /> : <Moon className="w-5 h-5 group-hover:text-indigo-500 transition-colors" />}
      </motion.button>

      {/* --- THE CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="bg-white/40 dark:bg-[#121212]/80 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl shadow-indigo-100/50 dark:shadow-indigo-500/10 rounded-3xl overflow-hidden transition-colors duration-500">
          
          {/* Header Progress */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-8 md:p-12">
            
            <AnimatePresence mode='wait'>
              
              {/* === STEP 1: PROFILE COMPLETION === */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="font-sans font-semibold text-2xl tracking-tight text-slate-900 dark:text-white mb-2">
                      Welcome to VNDR.
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Let's start by setting up your profile.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <InputSlot 
                        label="First Name" 
                        placeholder="e.g. Jane" 
                        value={profileData.firstName}
                        onChange={(e: any) => setProfileData({...profileData, firstName: e.target.value})}
                        icon={User}
                        autoFocus
                      />
                      <InputSlot 
                        label="Last Name" 
                        placeholder="e.g. Doe" 
                        value={profileData.lastName}
                        onChange={(e: any) => setProfileData({...profileData, lastName: e.target.value})}
                      />
                    </div>
                    <InputSlot 
                      label="Phone Number" 
                      placeholder="(555) 123-4567" 
                      value={profileData.phone}
                      onChange={(e: any) => {
                        // Simple formatter
                        const input = e.target.value.replace(/\D/g, '');
                        const match = input.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
                        let formatted = input;
                        if (match) {
                          formatted = !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
                        }
                        setProfileData({...profileData, phone: formatted});
                      }}
                      icon={Phone}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleProfileSubmit}
                      disabled={!profileData.firstName || !profileData.lastName || isSavingProfile}
                      className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === STEP 2: ASSET PROTOCOL === */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="font-sans font-semibold text-2xl tracking-tight text-slate-900 dark:text-white mb-2">
                      Let's set up your first building.
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Initialize your command center.</p>
                  </div>

                  <div className="space-y-5">
                    <InputSlot 
                      label="Property Name" 
                      placeholder="e.g. Skyline Tower" 
                      value={formData.name}
                      onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                      icon={Building2}
                      autoFocus
                    />

                    {/* MOVED: Building Type (Position 2) */}
                    <div className="relative" ref={comboRef}>
                      <InputSlot 
                        label="Building Type" 
                        placeholder="e.g. Luxury Living (Try me!)" 
                        value={formData.buildingType}
                        onChange={(e: any) => {
                          setFormData({...formData, buildingType: e.target.value});
                          setComboQuery(e.target.value);
                          setIsComboOpen(true);
                        }}
                        onClick={() => setIsComboOpen(true)}
                        icon={Search}
                      />
                      
                      {isComboOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl bg-white/90 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl z-50 py-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                          {filteredTypes.map((type) => {
                            const matchIndex = type.toLowerCase().indexOf(comboQuery.toLowerCase());
                            return (
                              <button
                                key={type}
                                onClick={() => {
                                  setFormData({...formData, buildingType: type});
                                  setComboQuery(type);
                                  setIsComboOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors flex items-center text-slate-700 dark:text-slate-300"
                              >
                                {matchIndex >= 0 ? (
                                  <>
                                    {type.substring(0, matchIndex)}
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                      {type.substring(matchIndex, matchIndex + comboQuery.length)}
                                    </span>
                                    {type.substring(matchIndex + comboQuery.length)}
                                  </>
                                ) : type}
                              </button>
                            );
                          })}
                          {filteredTypes.length === 0 && (
                            <div className="px-4 py-2 text-xs text-slate-400 italic">No matches found.</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ADDRESS AUTOCOMPLETE */}
                    <div className="relative" ref={addressRef}>
                      <InputSlot 
                        label="Street Address" 
                        placeholder="Search Google Maps..." 
                        value={formData.address}
                        onChange={(e: any) => {
                          setFormData({...formData, address: e.target.value});
                          setIsAddressOpen(true);
                        }}
                        icon={MapPin}
                      />
                      
                      {isAddressOpen && formData.address.length > 2 && filteredAddresses.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white/90 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl z-50 py-2">
                          <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Locations
                          </div>
                          {filteredAddresses.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAddressSelect(item)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors flex flex-col"
                            >
                              <span className="font-medium text-slate-900 dark:text-white">{item.addr}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{item.city}, {item.state} {item.zip}</span>
                            </button>
                          ))}
                          <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 mt-1">
                             <div className="flex justify-end">
                               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/db/Powered_by_Google_2014.svg/320px-Powered_by_Google_2014.svg.png" alt="Google" className="h-4 opacity-50 grayscale" />
                             </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-3">
                        <InputSlot 
                          label="City" 
                          placeholder="City" 
                          value={formData.city}
                          onChange={(e: any) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                      <div className="col-span-1">
                        <InputSlot 
                          label="State" 
                          placeholder="ST" 
                          value={formData.state}
                          onChange={(e: any) => setFormData({...formData, state: e.target.value})}
                        />
                      </div>
                      <div className="col-span-2">
                        <InputSlot 
                          label="Zip" 
                          placeholder="Zip" 
                          value={formData.zip}
                          onChange={(e: any) => setFormData({...formData, zip: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <InputSlot 
                        label="Unique Building ID (Optional)" 
                        placeholder="e.g. BLD-001" 
                        value={formData.buildingId}
                        onChange={(e: any) => setFormData({...formData, buildingId: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNextStep}
                      disabled={!formData.name || !formData.address}
                      className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      Next Step <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === STEP 3: CONTRACT HOOK === */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center md:text-left">
                    <h2 className="font-sans font-semibold text-2xl tracking-tight text-slate-900 dark:text-white mb-2">
                      Let's secure your first contract.
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      Verify an active service agreement to activate monitoring.
                    </p>
                  </div>

                  {analysisStatus === 'complete' ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 space-y-6"
                    >
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-lg shadow-green-500/20">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      </div>
                      <div className="text-center space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analysis Complete</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Identified: Trane HVAC Service Agreement</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center">
                        <p className="mb-1 font-bold text-indigo-600 dark:text-indigo-400">DEMO MODE ACTIVE</p>
                        This contract data will be discarded so you can start with a clean asset record.
                      </div>

                      <button
                        onClick={handleFinalize}
                        className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-10 py-3.5 rounded-full font-bold shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                      >
                        Enter Command Center <Sparkles className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
                      
                      {/* Left: Drop Zone */}
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        className={cn(
                          "relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-300 overflow-hidden",
                          dragActive || analysisStatus === 'analyzing'
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                            : "border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-indigo-400/50"
                        )}
                      >
                        {analysisStatus === 'analyzing' ? (
                          <div className="flex flex-col items-center animate-in fade-in zoom-in">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Scanning Document...</p>
                          </div>
                        ) : (
                          <>
                            <div className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300",
                              dragActive ? "scale-110 bg-white" : "bg-white dark:bg-white/10 shadow-sm"
                            )}>
                              <UploadCloud className={cn("w-8 h-8", dragActive ? "text-indigo-600" : "text-slate-400")} />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center">
                              Drag & Drop your<br/>Service Agreement (PDF)
                            </p>
                          </>
                        )}
                      </div>

                      {/* Right: The Demo */}
                      <div className="relative bg-slate-100 dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
                        <div className="absolute top-4 right-4">
                          <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Demo Mode</span>
                        </div>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                          Don't have a file? Drag this sample to test the AI.
                        </p>

                        <div 
                          draggable={analysisStatus === 'idle'}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/vndr-sample', 'true');
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          className={cn(
                            "bg-white dark:bg-[#2A2A2A] p-4 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 flex items-center gap-4 w-full max-w-[240px] transition-all",
                            analysisStatus === 'idle' ? "cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-xl hover:border-indigo-500/30" : "opacity-50 cursor-not-allowed grayscale"
                          )}
                        >
                          <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center border border-red-100 dark:border-red-500/20">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Sample Agreement.pdf</p>
                            <p className="text-[10px] text-slate-400">1.2 MB • PDF</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>

    </div>
  );
}