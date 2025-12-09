import { useState, useMemo } from 'react';
import { 
  User, Trash2, Shield, X, Search, Edit2, Save, 
  Building, ChevronRight, Phone, Mail, ArrowLeft 
} from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { useProperties } from '../../hooks/useProperties';
import { cn } from '../../lib/utils';
import type { UserRole, UserProfile, Property } from '../../dataModel';

interface UserManagementProps {
  onBack: () => void;
}

const ROLES: { label: string; value: UserRole }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Executive (Full View)', value: 'executive' },
  { label: 'Area VP', value: 'area_vp' },
  { label: 'Regional VP', value: 'region_vp' },
  { label: 'Market Manager', value: 'market_manager' },
  { label: 'Regional PM', value: 'regional_pm' },
  { label: 'Property Manager', value: 'pm' },
];

const SCOPE_OPTIONS = {
  area: ['West', 'Central', 'Eastern'],
  region: ['Pacific Northwest', 'California & Southwest', 'Mid-Central', 'Texas & Plains', 'Northeast', 'Southeast'],
  market: ['Seattle', 'Portland', 'San Francisco', 'Los Angeles', 'Chicago', 'Denver', 'Dallas', 'Houston', 'New York City', 'Boston', 'Atlanta', 'Miami']
};

export default function UserManagement({ onBack }: UserManagementProps) {
  const { users, loading: usersLoading, saveUser, deleteUser } = useUsers();
  const { properties, updateProperty } = useProperties();
  
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [assignedProperties, setAssignedProperties] = useState<Property[]>([]);
  const [propertySearch, setPropertySearch] = useState('');

  // -- FILTERING --
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // -- HANDLERS --

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm(user);
    setIsEditing(false);
    
    const userProps = properties.filter(p => 
      p.managerEmail === user.email || p.regionalPmEmail === user.email
    );
    setAssignedProperties(userProps);
  };

  const handleSave = async () => {
    if (!editForm) return;
    
    // 1. Save User Profile
    await saveUser(editForm);

    // 2. Save Property Assignments (If PM/RPM)
    const isPm = editForm.role === 'pm';
    const isRpm = editForm.role === 'regional_pm';

    if (isPm || isRpm) {
      const originalProps = properties.filter(p => 
        (isPm && p.managerEmail === editForm.email) || 
        (isRpm && p.regionalPmEmail === editForm.email)
      );
      
      const removed = originalProps.filter(op => !assignedProperties.find(ap => ap.id === op.id));
      const added = assignedProperties.filter(ap => !originalProps.find(op => op.id === ap.id));

      for (const p of removed) {
        const update = isPm ? { managerEmail: '', manager: { ...p.manager, name: 'Unassigned', email: '' } } 
                            : { regionalPmEmail: '', regionalPm: { ...p.regionalPm, name: 'Unassigned', email: '' } };
        await updateProperty(p.id, update as any);
      }

      for (const p of added) {
        const update = isPm ? { managerEmail: editForm.email, manager: { ...p.manager, name: editForm.name, email: editForm.email } } 
                            : { regionalPmEmail: editForm.email, regionalPm: { ...p.regionalPm, name: editForm.name, email: editForm.email } };
        await updateProperty(p.id, update as any);
      }
    }

    setIsEditing(false);
    setSelectedUser(editForm);
  };

  const toggleScope = (value: string) => {
    if (!editForm) return;
    const currentScope = Array.isArray(editForm.scope?.value) ? editForm.scope.value : [editForm.scope?.value || ''].filter(Boolean);
    
    let newScope: string[];
    if (currentScope.includes(value)) {
      newScope = currentScope.filter(s => s !== value);
    } else {
      newScope = [...currentScope, value];
    }
    
    setEditForm({
      ...editForm,
      scope: { type: editForm.scope?.type || 'global', value: newScope }
    });
  };

  // --- CONFLICT RESOLUTION LOGIC ---
  const addProperty = (prop: Property) => {
    // 1. Check if already in our local "to be saved" list
    if (assignedProperties.find(p => p.id === prop.id)) return;

    // 2. Check for conflicts on the live property object
    const isPm = editForm?.role === 'pm';
    const isRpm = editForm?.role === 'regional_pm';
    
    let conflictName = "";
    if (isPm && prop.managerEmail && prop.managerEmail !== editForm?.email) {
      conflictName = prop.manager.name;
    } else if (isRpm && prop.regionalPmEmail && prop.regionalPmEmail !== editForm?.email) {
      conflictName = prop.regionalPm.name;
    }

    // 3. Prompt user if conflict exists
    if (conflictName) {
      const confirmed = confirm(
        `⚠️ Conflict Detected\n\n"${prop.name}" is currently assigned to ${conflictName}.\n\nDo you want to reassign it to ${editForm?.name}?`
      );
      if (!confirmed) return; // User cancelled
    }

    // 4. Add to list (will be saved when they click "Save Changes")
    setAssignedProperties([...assignedProperties, prop]);
    setPropertySearch('');
  };

  const removeProperty = (propId: string) => {
    setAssignedProperties(assignedProperties.filter(p => p.id !== propId));
  };

  const availableProperties = useMemo(() => {
    if (!propertySearch) return [];
    return properties
      .filter(p => p.name.toLowerCase().includes(propertySearch.toLowerCase()))
      .slice(0, 5);
  }, [properties, propertySearch]);

  if (usersLoading) return <div className="p-10 text-center">Loading Roster...</div>;

  return (
    <div className="h-full flex gap-6 p-6 bg-canvas overflow-hidden">
      
      {/* MAIN LIST */}
      <div className={cn("flex-1 flex flex-col bg-surface border border-border rounded-md shadow-sm overflow-hidden transition-all", selectedUser ? "w-1/2" : "w-full")}>
        
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
            {/* BACK BUTTON */}
            <button 
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-slate-200 rounded-full text-text-secondary transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand" /> User Access Control
              </h1>
            </div>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search users..."
              className="w-full pl-9 pr-3 h-9 border border-border rounded-sm text-sm focus:border-brand outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 border-b border-border">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary uppercase">User</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary uppercase">Role</th>
                <th className="py-3 px-4 text-xs font-bold text-text-secondary uppercase">Scope</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr 
                  key={u.email} 
                  onClick={() => handleUserClick(u)}
                  className={cn("cursor-pointer hover:bg-blue-50 transition-colors group", selectedUser?.email === u.email && "bg-blue-50")}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-text-primary">{u.name}</p>
                        <p className="text-xs text-text-secondary">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {ROLES.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-text-secondary truncate max-w-[150px] block">
                      {Array.isArray(u.scope?.value) ? `${u.scope?.value.length} Assigned` : u.scope?.value || '-'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {selectedUser && editForm && (
        <div className="w-[480px] bg-surface border border-border rounded-md shadow-lvl3 flex flex-col animate-in slide-in-from-right-4 duration-200">
          
          <div className="p-6 border-b border-border flex justify-between items-start bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {editForm.name.charAt(0)}
              </div>
              <div>
                {isEditing ? (
                  <input 
                    className="font-bold text-lg text-text-primary bg-white border border-brand rounded px-1 -ml-1 w-full outline-none"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                ) : (
                  <h2 className="font-bold text-lg text-text-primary">{editForm.name}</h2>
                )}
                <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {editForm.email}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Phone Number</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-2 border border-border rounded-sm text-sm focus:border-brand outline-none"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  ) : (
                    <div className="text-sm font-medium text-text-primary flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {editForm.phone || 'Not set'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Role & Permissions
              </h3>
              
              <div className="mb-4">
                <label className="text-xs text-text-secondary block mb-1">System Role</label>
                {isEditing ? (
                  <select 
                    className="w-full p-2 border border-border rounded-sm text-sm bg-white focus:border-brand outline-none"
                    value={editForm.role}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      role: e.target.value as UserRole,
                      scope: { type: 'global', value: [] } 
                    })}
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand/10 text-brand border border-brand/20">
                    {ROLES.find(r => r.value === editForm.role)?.label}
                  </span>
                )}
              </div>

              {['area_vp', 'region_vp', 'market_manager'].includes(editForm.role) && (
                <div className="bg-slate-50 p-3 rounded-md border border-border">
                  <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">
                    Assigned {editForm.role === 'area_vp' ? 'Areas' : editForm.role === 'region_vp' ? 'Regions' : 'Markets'}
                  </label>
                  
                  {isEditing ? (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {(editForm.role === 'area_vp' ? SCOPE_OPTIONS.area : editForm.role === 'region_vp' ? SCOPE_OPTIONS.region : SCOPE_OPTIONS.market).map(opt => {
                        const isSelected = Array.isArray(editForm.scope?.value) 
                          ? editForm.scope?.value.includes(opt) 
                          : editForm.scope?.value === opt;
                        
                        return (
                          <label key={opt} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!isSelected}
                              onChange={() => toggleScope(opt)}
                              className="rounded border-slate-300 text-brand focus:ring-brand"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(editForm.scope?.value) ? editForm.scope.value : [editForm.scope?.value]).flat().filter(Boolean).map(v => (
                        <span key={v} className="px-2 py-1 bg-white border border-border rounded text-xs font-medium text-text-primary">
                          {v}
                        </span>
                      ))}
                      {(!editForm.scope?.value || editForm.scope.value.length === 0) && <span className="text-xs text-slate-400 italic">No scope assigned</span>}
                    </div>
                  )}
                </div>
              )}

              {['pm', 'regional_pm'].includes(editForm.role) && (
                <div className="bg-slate-50 p-3 rounded-md border border-border">
                  <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">
                    Assigned Properties ({assignedProperties.length})
                  </label>

                  {isEditing && (
                    <div className="mb-3 relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary" />
                          <input 
                            className="w-full pl-8 pr-2 py-1.5 text-sm border border-border rounded-sm focus:border-brand outline-none"
                            placeholder="Search to assign building..."
                            value={propertySearch}
                            onChange={e => setPropertySearch(e.target.value)}
                          />
                        </div>
                      </div>
                      {availableProperties.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-border shadow-lg rounded-sm mt-1 z-20">
                          {availableProperties.map(p => (
                            <button 
                              key={p.id}
                              onClick={() => addProperty(p)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex justify-between items-center"
                            >
                              <span className="truncate font-medium">{p.name}</span>
                              <span className="text-xs text-text-secondary">{p.city}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {assignedProperties.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-white border border-border rounded-sm group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-sm truncate">{p.name}</span>
                        </div>
                        {isEditing && (
                          <button 
                            onClick={() => removeProperty(p.id)}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {assignedProperties.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400 italic">No buildings assigned</div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

          <div className="p-4 border-t border-border bg-slate-50 flex justify-between items-center">
            <button 
              onClick={() => deleteUser(editForm.email)}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Delete User
            </button>

            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => { setIsEditing(false); setEditForm(selectedUser); setPropertySearch(''); }}
                  className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-brand text-white text-sm font-bold rounded shadow-sm hover:bg-brand-dark flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 bg-white border border-border text-text-primary text-sm font-bold rounded shadow-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
