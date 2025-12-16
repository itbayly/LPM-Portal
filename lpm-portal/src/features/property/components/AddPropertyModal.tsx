import { useState } from 'react';
import { X, Building2, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import type { LegacyProperty } from '../../../dataModel';

interface AddPropertyModalProps {
  onClose: () => void;
  onSuccess: (property: LegacyProperty) => void;
}

export default function AddPropertyModal({ onClose, onSuccess }: AddPropertyModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    buildingId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.address) return;

    setIsSubmitting(true);
    
    try {
      // 1. Generate ID
      const docId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      // 2. Create the Clean Asset Object
      const newProperty: LegacyProperty = {
        id: docId,
        name: formData.name,
        entityName: formData.name, // Default to name
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        locationPhone: '',
        buildingId: formData.buildingId || `BLD-${Math.floor(Math.random() * 10000)}`,
        
        // Hierarchy (Default to 'Self-Managed')
        hierarchy: {
          area: 'Self-Managed',
          region: 'Self-Managed',
          market: formData.city || 'Local'
        },

        // Personnel (Assign to Creator)
        managerEmail: user.email || '',
        regionalPmEmail: '',
        manager: { name: user.email?.split('@')[0] || 'Me', email: user.email || '', phone: '' },
        regionalPm: { name: '', email: '', phone: '' },
        
        contacts: [],
        
        // Status Defaults (The "Empty State")
        status: 'service_contract_needed', // Triggers the "Red Dot"
        
        // Contract Placeholders (Empty)
        vendor: { 
            name: '', rating: 0, accountNumber: '', serviceInstructions: '', 
            currentPrice: 0, billingFrequency: 'Monthly' 
        },
        unitCount: 0,
        contractStartDate: '',
        contractEndDate: '',
        initialTerm: '',
        renewalTerm: '',
        cancellationWindow: '',
        autoRenews: false,
        onNationalContract: false,
        billTo: '',
        accountManager: { name: '', phone: '', email: '' },
        documents: []
      };

      // 3. Push to DB
      await setDoc(doc(db, "properties", docId), newProperty);

      // 4. Handover
      onSuccess(newProperty);
      
    } catch (err) {
      console.error(err);
      alert("Failed to create property.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-[#0A0A0C]/95 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 ring-1 ring-black/5 dark:ring-white/5">
        
        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
          <div>
            <h2 className="text-sm font-bold font-mono text-text-primary dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand dark:text-blue-400" />
              New Asset Protocol
            </h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">Define property parameters.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <InputSlot 
            label="Property Name" 
            value={formData.name} 
            onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
            placeholder="e.g. Skyline Tower"
            required
            autoFocus
          />

          <InputSlot 
            label="Street Address" 
            icon={MapPin}
            value={formData.address} 
            onChange={(e: any) => setFormData({...formData, address: e.target.value})} 
            placeholder="e.g. 123 Main St"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <InputSlot 
              label="City" 
              value={formData.city} 
              onChange={(e: any) => setFormData({...formData, city: e.target.value})} 
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <InputSlot 
                label="State" 
                value={formData.state} 
                onChange={(e: any) => setFormData({...formData, state: e.target.value})} 
                placeholder="CA"
                required
              />
              <InputSlot 
                label="Zip" 
                value={formData.zip} 
                onChange={(e: any) => setFormData({...formData, zip: e.target.value})} 
                required
              />
            </div>
          </div>

          <div className="pt-2">
             <InputSlot 
              label="Internal ID (Optional)" 
              value={formData.buildingId} 
              onChange={(e: any) => setFormData({...formData, buildingId: e.target.value})} 
              placeholder="e.g. BLD-001"
            />
          </div>

          {/* Actions */}
          <div className="pt-6 mt-2 border-t border-black/5 dark:border-white/5 flex justify-end gap-3">
             <button 
               type="button" 
               onClick={onClose}
               className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={isSubmitting}
               className="px-6 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-brand/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Asset <ArrowRight className="w-4 h-4" /></>}
             </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// --- MOVED OUTSIDE ---
const InputSlot = ({ label, value, onChange, placeholder, icon: Icon, required = false }: any) => (
  <div className="group">
    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1.5 block">
      {label} {required && <span className="text-brand dark:text-blue-400">*</span>}
    </label>
    <div className="relative flex items-center bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm transition-colors focus-within:bg-black/10 dark:focus-within:bg-white/10">
      {Icon && <div className="pl-3 text-text-secondary dark:text-slate-500"><Icon className="w-3.5 h-3.5" /></div>}
      <input 
        type="text" 
        className="w-full bg-transparent border-none outline-none text-sm font-medium text-text-primary dark:text-white px-3 py-2.5 placeholder:text-slate-400/50" 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
    </div>
  </div>
);