import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatPhoneNumber } from '../wizardConfig';
import type { Contact } from '../../../../dataModel';
import type { StepProps } from '../wizardConfig';

export default function Step8_Contacts({ formData, setFormData }: StepProps) {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [tempContact, setTempContact] = useState<Partial<Contact>>({ name: '', role: '', phone: '', email: '' });

  const handleAddContact = () => {
    if (!tempContact.name || !tempContact.email) return;
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name: tempContact.name!,
      role: tempContact.role || 'Account Manager',
      phone: tempContact.phone || '',
      email: tempContact.email!
    };
    setFormData(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
    setTempContact({ name: '', role: '', phone: '', email: '' });
    setIsAddingContact(false);
  };

  const handleDeleteContact = (id: string) => {
    setFormData(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-lg font-bold text-text-primary">Confirm Point of Contact</h3>
      
      {/* Existing List */}
      {formData.contacts.length > 0 && !isAddingContact && (
        <div className="space-y-2">
          {formData.contacts.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-md">
              <div>
                <p className="font-bold text-sm text-text-primary">{c.name}</p>
                <p className="text-xs text-text-secondary">{c.role} • {c.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDeleteContact(c.id)} className="p-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setIsAddingContact(true)}
            className="w-full py-2 border-2 border-dashed border-border rounded-md text-brand font-bold text-sm hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Another Contact
          </button>
        </div>
      )}

      {/* Add Form */}
      {(formData.contacts.length === 0 || isAddingContact) && (
        <div className="bg-slate-50 p-4 rounded-md border border-border space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold uppercase text-text-secondary">New Contact</h4>
            {formData.contacts.length > 0 && (
              <button onClick={() => setIsAddingContact(false)} className="text-xs text-slate-500 hover:text-slate-800">Cancel</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Name</label>
              <input 
                className="w-full p-2 border rounded-md" 
                placeholder="Jane Doe" 
                value={tempContact.name} 
                onChange={e => setTempContact({...tempContact, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Role</label>
              <input 
                className="w-full p-2 border rounded-md" 
                placeholder="Account Manager" 
                value={tempContact.role} 
                onChange={e => setTempContact({...tempContact, role: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Email</label>
              <input 
                className="w-full p-2 border rounded-md" 
                placeholder="jane@email.com" 
                value={tempContact.email} 
                onChange={e => setTempContact({...tempContact, email: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary block mb-1">Phone</label>
              <input 
                className="w-full p-2 border rounded-md" 
                placeholder="(555) 123-4567" 
                value={tempContact.phone} 
                onChange={e => {
                  const formatted = formatPhoneNumber(e.target.value);
                  if (formatted.length <= 14) { 
                     setTempContact({...tempContact, phone: formatted})
                  }
                }} 
              />
            </div>
          </div>
          <button 
            onClick={handleAddContact}
            disabled={!tempContact.name || !tempContact.email}
            className="w-full py-2 bg-brand text-white font-bold rounded-md disabled:opacity-50"
          >
            Save Contact
          </button>
        </div>
      )}
    </div>
  );
}