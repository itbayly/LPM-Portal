import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile, UserRole, AccessScope } from '../dataModel';

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Subscribe to User Roster
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const liveData: UserProfile[] = [];
      snapshot.forEach((doc) => {
        liveData.push(doc.data() as UserProfile);
      });
      setUsers(liveData.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Add / Edit User
  const saveUser = async (user: UserProfile) => {
    const emailId = user.email.toLowerCase();
    const cleanUser = { 
      ...user, 
      email: emailId,
      // Ensure undefined fields don't break Firestore
      phone: user.phone || "",
      scope: user.scope || null 
    };
    
    await setDoc(doc(db, "users", emailId), cleanUser);
  };

  // 3. Delete User
  const deleteUser = async (email: string) => {
    if (!confirm(`Are you sure you want to remove access for ${email}?`)) return;
    await deleteDoc(doc(db, "users", email.toLowerCase()));
  };

  // 4. Update Role Helper (Quick Action)
  const updateUserRole = async (email: string, role: UserRole, scopeValue?: string | string[]) => {
    const userRef = doc(db, "users", email.toLowerCase());
    
    let newScope: AccessScope | null = null;
    
    if (role === 'area_vp') newScope = { type: 'area', value: scopeValue || [] };
    else if (role === 'region_vp') newScope = { type: 'region', value: scopeValue || [] };
    else if (role === 'market_manager') newScope = { type: 'market', value: scopeValue || [] };
    else if (role === 'admin' || role === 'executive') newScope = { type: 'global', value: 'all' };
    
    await updateDoc(userRef, { role, scope: newScope });
  };

  return { users, loading, saveUser, deleteUser, updateUserRole };
}