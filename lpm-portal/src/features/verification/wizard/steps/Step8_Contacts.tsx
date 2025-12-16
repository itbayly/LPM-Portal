import { useState } from 'react';
import { Plus, Trash2, User, X } from 'lucide-react';
import { formatPhoneNumber } from '../wizardConfig';
import type { Contact } from '../../../../dataModel';
import type { StepProps } from '../wizardConfig';

export default function Step8_Contacts({ formData, setFormData }: StepProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [temp, setTemp] = useState<Partial<Contact>>({ name: '', role: '', phone: '', email: '' });

  const handleAdd = () => {
    if (!temp.name || !temp.email) return;
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name: temp.name!,
      role: temp.role || 'Account Manager',
      phone: temp.phone || '',
      email: temp.email!,
      isPrimary: false
    };
    setFormData(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
    setTemp({ name: '', role: '', phone: '', email: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setFormData(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Existing List */}
      <div className="space-y-3">
        {formData.contacts.map(c => (
          <div key={c.id} className="flex items-center gap-4 p-3 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-inner">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-text-primary dark:text-white">{c.name}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-brand dark:text-blue-400">{c.role}</p>
              <div className="text-xs text-text-secondary dark:text-slate-400 mt-0.5 truncate">
                {c.email} • {c.phone}
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {isAdding ? (
        <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400">New Entry</h4>
            <button onClick={() => setIsAdding(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputSlot label="Name" value={temp.name} onChange={(e: any) => setTemp({...temp, name: e.target.value})} />
            <InputSlot label="Role" value={temp.role} onChange={(e: any) => setTemp({...temp, role: e.target.value})} placeholder="e.g. Account Rep" />
            <InputSlot label="Email" value={temp.email} onChange={(e: any) => setTemp({...temp, email: e.target.value})} />
            <InputSlot 
              label="Phone" 
              value={temp.phone} 
              onChange={(e: any) => {
                const formatted = formatPhoneNumber(e.target.value);
                if (formatted.length <= 14) setTemp({...temp, phone: formatted});
              }} 
            />
          </div>
          
          <button 
            onClick={handleAdd}
            disabled={!temp.name || !temp.email}
            className="w-full py-2 bg-brand dark:bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-brand-dark dark:hover:bg-blue-500 transition-colors"
          >
            Confirm Contact
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border border-dashed border-black/20 dark:border-white/20 rounded-lg text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 hover:border-brand dark:hover:border-blue-400 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      )}
    </div>
  );
}

// --- HELPER INPUT SLOT (Moved Outside) ---
const InputSlot = ({ label, value, onChange, placeholder }: any) => (
  <div className="group">
    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-1 block">
      {label}
    </label>
    <input 
      className="w-full bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm px-3 py-2 text-sm text-text-primary dark:text-white outline-none focus:border-brand dark:focus:border-blue-400 transition-colors placeholder:text-slate-400/50"
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);