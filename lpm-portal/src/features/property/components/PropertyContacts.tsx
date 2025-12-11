import { useState } from 'react';
import { User, Plus, Trash2, Edit2, Star, X } from 'lucide-react';
import type { Property, Contact } from '../../../dataModel';

interface Props {
  property: Property;
  onUpdate: (id: string, data: Partial<Property>) => void;
}

const ROLES = ['Account Manager', 'General Manager', 'Finance', 'Other'];

export default function PropertyContacts({ property, onUpdate }: Props) {
  const contacts = property.contacts || [];
  
  // -- MODAL STATE --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = New Contact
  
  // -- FORM STATE --
  const [formData, setFormData] = useState({
    name: '',
    roleSelect: 'Account Manager',
    roleCustom: '',
    email: '',
    phone: '',
    isPrimary: false
  });

  // -- HANDLERS --

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      roleSelect: 'Account Manager',
      roleCustom: '',
      email: '',
      phone: '',
      isPrimary: contacts.length === 0 // Default to primary if it's the first contact
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

    // Determine final role string
    const finalRole = formData.roleSelect === 'Other' ? formData.roleCustom : formData.roleSelect;
    if (!finalRole) return alert("Role is required");

    let updatedContacts = [...contacts];

    // If setting as primary, remove primary flag from everyone else
    if (formData.isPrimary) {
      updatedContacts = updatedContacts.map(c => ({ ...c, isPrimary: false }));
    }

    if (editingId) {
      // EDIT EXISTING
      updatedContacts = updatedContacts.map(c => {
        if (c.id === editingId) {
          return {
            ...c,
            name: formData.name,
            role: finalRole,
            email: formData.email,
            phone: formData.phone,
            isPrimary: formData.isPrimary
          };
        }
        return c;
      });
    } else {
      // CREATE NEW
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        name: formData.name,
        role: finalRole,
        email: formData.email,
        phone: formData.phone,
        isPrimary: formData.isPrimary
      };
      updatedContacts.push(newContact);
    }

    onUpdate(property.id, { contacts: updatedContacts });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this contact?")) return;
    const updatedContacts = contacts.filter(c => c.id !== id);
    onUpdate(property.id, { contacts: updatedContacts });
  };

  // Helper for phone formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
    } else if (raw.length > 3) {
      formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
    }
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  return (
    <div className="bg-surface rounded-md shadow-lvl1 border border-border p-xl">
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-sm">
          <User className="w-5 h-5 text-text-secondary" /> Contacts
        </h2>
        <button 
          onClick={openAddModal} 
          className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-sm hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Contact
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-border">
          <tr>
            <th className="py-2 px-3 text-[11px] font-bold text-text-secondary uppercase">
              {/* ALIGNMENT FIX: Flex container with invisible spacer */}
              <div className="flex items-center">
                <div className="w-5 mr-2"></div> {/* Spacer matching star width+margin */}
                Name
              </div>
            </th>
            <th className="py-2 px-3 text-[11px] font-bold text-text-secondary uppercase">Role</th>
            <th className="py-2 px-3 text-[11px] font-bold text-text-secondary uppercase">Email</th>
            <th className="py-2 px-3 text-[11px] font-bold text-text-secondary uppercase">Phone</th>
            <th className="w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {contacts.map((c) => (
            <tr key={c.id} className="group hover:bg-slate-50 transition-colors">
              <td className="p-3 text-sm font-medium text-text-primary flex items-center">
                {/* ALIGNMENT FIX: Fixed width container for star/empty space */}
                <div className="w-5 flex justify-center shrink-0 mr-2">
                  {c.isPrimary && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                </div>
                {c.name}
              </td>
              <td className="p-3 text-sm text-text-secondary">{c.role}</td>
              <td className="p-3 text-sm text-brand">{c.email}</td>
              <td className="p-3 text-sm text-text-secondary font-mono">{c.phone}</td>
              <td className="p-3 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(c)}
                    className="p-1.5 text-slate-400 hover:text-brand hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)} 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {contacts.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-sm text-slate-400 italic">
                No contacts listed.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- EDIT/ADD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-text-primary">{editingId ? "Edit Contact" : "Add New Contact"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Name</label>
                <input 
                  className="w-full p-2 border border-border rounded text-sm focus:border-brand outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Full Name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Role</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-2 border border-border rounded text-sm bg-white focus:border-brand outline-none"
                    value={formData.roleSelect}
                    onChange={e => setFormData({...formData, roleSelect: e.target.value})}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {formData.roleSelect === 'Other' && (
                  <input 
                    className="w-full mt-2 p-2 border border-border rounded text-sm focus:border-brand outline-none"
                    value={formData.roleCustom}
                    onChange={e => setFormData({...formData, roleCustom: e.target.value})}
                    placeholder="Enter Custom Role..."
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Email</label>
                  <input 
                    className="w-full p-2 border border-border rounded text-sm focus:border-brand outline-none"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Phone</label>
                  <input 
                    className="w-full p-2 border border-border rounded text-sm focus:border-brand outline-none"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded text-brand focus:ring-brand w-4 h-4"
                    checked={formData.isPrimary}
                    onChange={e => setFormData({...formData, isPrimary: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-text-primary">Primary Point of Contact</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-brand text-white text-sm font-bold rounded shadow-sm hover:bg-brand-dark"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}