import { useState } from 'react';
import { User, Plus, Trash2, Edit2, Star, X, Mail, Phone } from 'lucide-react';
import type { LegacyProperty, Contact } from '../../../dataModel';

interface Props {
  property: LegacyProperty;
  onUpdate: (id: string, data: Partial<LegacyProperty>) => void;
}

const ROLES = ['Account Manager', 'General Manager', 'Finance', 'Other'];

export default function PropertyContacts({ property, onUpdate }: Props) {
  const contacts = property.contacts || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    roleSelect: 'Account Manager',
    roleCustom: '',
    email: '',
    phone: '',
    isPrimary: false
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      roleSelect: 'Account Manager',
      roleCustom: '',
      email: '',
      phone: '',
      isPrimary: contacts.length === 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingId(contact.id);
    const isStandardRole = ROLES.includes(contact.role);
    setFormData({
      name: contact.name,
      roleSelect: isStandardRole ? contact.role : 'Other',
      roleCustom: isStandardRole ? '' : contact.role,
      email: contact.email,
      phone: contact.phone,
      isPrimary: contact.isPrimary || false
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return alert("Name is required");
    const finalRole = formData.roleSelect === 'Other' ? formData.roleCustom : formData.roleSelect;
    
    let updatedContacts = [...contacts];
    if (formData.isPrimary) {
      updatedContacts = updatedContacts.map(c => ({ ...c, isPrimary: false }));
    }

    if (editingId) {
      updatedContacts = updatedContacts.map(c => 
        c.id === editingId ? { ...c, name: formData.name, role: finalRole, email: formData.email, phone: formData.phone, isPrimary: formData.isPrimary } : c
      );
    } else {
      updatedContacts.push({
        id: `contact-${Date.now()}`,
        name: formData.name,
        role: finalRole,
        email: formData.email,
        phone: formData.phone,
        isPrimary: formData.isPrimary
      });
    }

    onUpdate(property.id, { contacts: updatedContacts });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove contact?")) return;
    onUpdate(property.id, { contacts: contacts.filter(c => c.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-brand dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <User className="w-4 h-4" /> Key Contacts
        </h2>
        <button 
          onClick={openAddModal} 
          className="glass-button px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 text-text-secondary dark:text-slate-300"
        >
          <Plus className="w-3 h-3" /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((c) => (
          <div key={c.id} className="glass-panel p-4 rounded-lg group relative hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditModal(c)} className="text-slate-400 hover:text-brand dark:hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 border border-white/50 dark:border-white/10 flex items-center justify-center shadow-sm">
                {c.isPrimary ? <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : <User className="w-5 h-5 text-slate-400" />}
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-primary dark:text-white">{c.name}</h3>
                <p className="text-[10px] font-mono text-brand dark:text-blue-400 uppercase tracking-wider mb-2">{c.role}</p>
                
                <div className="space-y-1">
                  {c.email && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-slate-400">
                      <Mail className="w-3 h-3" /> {c.email}
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-slate-400">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {contacts.length === 0 && (
        <div className="glass-panel p-8 text-center rounded-xl border-dashed">
          <p className="text-sm text-text-secondary dark:text-slate-500 italic">No contacts assigned to this file.</p>
        </div>
      )}

      {/* Modal omitted for brevity - use standard glass modal pattern if needed */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-[#0A0A0C]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
             <div className="p-6">
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4">{editingId ? "Edit Contact" : "Add Contact"}</h3>
                {/* Form fields here - reusing same logic as Financials modal */}
                <input 
                  className="w-full p-2 mb-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-sm text-text-primary dark:text-white focus:border-brand dark:focus:border-blue-400 outline-none"
                  placeholder="Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                {/* ... other inputs ... */}
                <div className="flex justify-end gap-2 mt-4">
                   <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-text-secondary dark:text-slate-400">Cancel</button>
                   <button onClick={handleSave} className="px-4 py-2 bg-brand text-white rounded text-sm font-bold">Save</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}