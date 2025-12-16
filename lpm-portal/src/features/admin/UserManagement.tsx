import { useState, useMemo } from 'react';
import { 
  Trash2, Shield, X, Search, Edit2, Save, 
  Building, ChevronRight, Mail, ArrowLeft // REMOVED User, Phone
} from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { useProperties } from '../../hooks/useProperties';
import { cn } from '../../lib/utils';
import type { UserRole, UserProfile, LegacyProperty } from '../../dataModel';

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
  const [assignedProperties, setAssignedProperties] = useState<LegacyProperty[]>([]);
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

    // 2. Save Property Assignments
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

  const addProperty = (prop: LegacyProperty) => {
    if (assignedProperties.find(p => p.id === prop.id)) return;
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

  if (usersLoading) return <div className="p-10 text-center text-xs font-mono uppercase tracking-widest dark:text-white">Loading Roster...</div>;

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      
      {/* MAIN LIST (Glass) */}
      <div className={cn("flex-1 flex flex-col glass-panel rounded-xl overflow-hidden transition-all", selectedUser ? "w-1/2" : "w-full")}>
        
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-text-secondary dark:text-slate-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold font-mono text-text-primary dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand dark:text-blue-400" /> Access Control
            </h1>
          </div>
          <div className="relative w-64 group">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-text-secondary dark:text-slate-500 group-focus-within:text-brand dark:group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search users..."
              className="w-full pl-9 pr-3 h-9 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 rounded-t-sm text-sm focus:outline-none text-text-primary dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F2F4F6] dark:bg-[#0A0A0C]">
              <tr>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-500">User</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-500">Role</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-slate-500">Scope</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredUsers.map((u) => (
                <tr 
                  key={u.email} 
                  onClick={() => handleUserClick(u)}
                  className={cn("cursor-pointer hover:bg-brand/5 dark:hover:bg-white/5 transition-colors group", selectedUser?.email === u.email && "bg-brand/5 dark:bg-white/5")}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-white dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs shadow-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-text-primary dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-text-secondary dark:text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-text-secondary dark:text-slate-400 border border-black/5 dark:border-white/5">
                      {ROLES.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-text-secondary dark:text-slate-400 truncate max-w-[150px] block">
                      {Array.isArray(u.scope?.value) ? `${u.scope?.value.length} Assigned` : u.scope?.value || '-'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand dark:group-hover:text-blue-400 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER (Glass) */}
      {selectedUser && editForm && (
        <div className="w-[480px] glass-panel rounded-xl flex flex-col animate-in slide-in-from-right-4 duration-300 border-l border-white/20 dark:border-white/10">
          
          <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-start bg-white/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand dark:bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-brand/20">
                {editForm.name.charAt(0)}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="relative group">
                    <input 
                      className="font-bold text-lg text-text-primary dark:text-white bg-transparent border-b border-brand outline-none w-full pb-1"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                ) : (
                  <h2 className="font-bold text-lg text-text-primary dark:text-white">{editForm.name}</h2>
                )}
                <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-slate-400 mt-1 font-mono">
                  <Mail className="w-3 h-3" />
                  {editForm.email}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-text-secondary dark:text-slate-500 hover:text-text-primary dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Role & Permissions */}
            <div>
              <h3 className="text-[10px] font-bold text-brand dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Clearance Level
              </h3>
              
              <div className="mb-4">
                {isEditing ? (
                  <div className="relative group">
                    <select 
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-t-sm px-3 py-2 text-sm text-text-primary dark:text-white outline-none cursor-pointer"
                      value={editForm.role}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        role: e.target.value as UserRole,
                        scope: { type: 'global', value: [] } 
                      })}
                    >
                      {ROLES.map(r => <option key={r.value} value={r.value} className="text-black">{r.label}</option>)}
                    </select>
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand dark:bg-blue-400 transition-all duration-300 group-focus-within:w-full" />
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-brand/10 dark:bg-blue-500/10 text-brand dark:text-blue-400 border border-brand/20 dark:border-blue-500/20">
                    {ROLES.find(r => r.value === editForm.role)?.label}
                  </span>
                )}
              </div>

              {/* Scope Selection */}
              {['area_vp', 'region_vp', 'market_manager'].includes(editForm.role) && (
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-black/5 dark:border-white/5">
                  <label className="text-[10px] font-mono font-bold text-text-secondary dark:text-slate-500 uppercase mb-3 block">
                    Territory Assignment
                  </label>
                  
                  {isEditing ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                      {(editForm.role === 'area_vp' ? SCOPE_OPTIONS.area : editForm.role === 'region_vp' ? SCOPE_OPTIONS.region : SCOPE_OPTIONS.market).map(opt => {
                        const isSelected = Array.isArray(editForm.scope?.value) 
                          ? editForm.scope?.value.includes(opt) 
                          : editForm.scope?.value === opt;
                        
                        return (
                          <label key={opt} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer transition-colors">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              isSelected ? "bg-brand border-brand dark:bg-blue-500 dark:border-blue-500" : "border-slate-300 dark:border-slate-600"
                            )}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={!!isSelected} onChange={() => toggleScope(opt)} />
                            <span className="text-xs text-text-primary dark:text-slate-300">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(editForm.scope?.value) ? editForm.scope.value : [editForm.scope?.value]).flat().filter(Boolean).map(v => (
                        <span key={v} className="px-2 py-1 bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded text-[10px] font-bold text-text-primary dark:text-slate-300">
                          {v}
                        </span>
                      ))}
                      {(!editForm.scope?.value || editForm.scope.value.length === 0) && <span className="text-xs text-slate-400 italic">No territory assigned</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Property Assignments */}
              {['pm', 'regional_pm'].includes(editForm.role) && (
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-black/5 dark:border-white/5">
                  <label className="text-[10px] font-mono font-bold text-text-secondary dark:text-slate-500 uppercase mb-3 block">
                    Assigned Assets ({assignedProperties.length})
                  </label>

                  {isEditing && (
                    <div className="mb-3 relative group">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary dark:text-slate-500" />
                      <input 
                        className="w-full pl-8 pr-2 py-2 bg-white dark:bg-black/20 border border-transparent rounded-md text-xs text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-brand dark:focus:ring-blue-400 transition-all placeholder:text-slate-400"
                        placeholder="Search to add..."
                        value={propertySearch}
                        onChange={e => setPropertySearch(e.target.value)}
                      />
                      
                      {availableProperties.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 shadow-xl rounded-md mt-1 z-20 overflow-hidden">
                          {availableProperties.map(p => (
                            <button 
                              key={p.id}
                              onClick={() => addProperty(p)}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-white/10 flex justify-between items-center text-text-primary dark:text-slate-200"
                            >
                              <span className="truncate font-medium">{p.name}</span>
                              <span className="text-[10px] text-text-secondary dark:text-slate-500">{p.city}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                    {assignedProperties.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-md group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs text-text-primary dark:text-slate-300 truncate">{p.name}</span>
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
                      <div className="text-center py-4 text-xs text-slate-400 italic">No assets assigned</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] flex justify-between items-center">
            <button 
              onClick={() => deleteUser(editForm.email)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Revoke Access
            </button>

            {isEditing ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsEditing(false); setEditForm(selectedUser); setPropertySearch(''); }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-brand/20 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" /> Confirm
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-text-primary dark:text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 dark:hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" /> Modify
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}