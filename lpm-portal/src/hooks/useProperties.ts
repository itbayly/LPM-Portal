import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { LegacyProperty, UserProfile } from '../dataModel';

export function useProperties() {
  const [properties, setProperties] = useState<LegacyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const q = query(collection(db, 'properties'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LegacyProperty[];
      
      setProperties(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (id: string, data: Partial<LegacyProperty>) => {
    try {
      const ref = doc(db, 'properties', id);
      await updateDoc(ref, data);
      
      setProperties(prev => prev.map(p => 
        p.id === id ? { ...p, ...data } : p
      ));
    } catch (err) {
      console.error("Update failed", err);
      throw err;
    }
  };

  // Combined Ingestion (Props + Users)
  const ingestProperties = async (newProps: LegacyProperty[], newUsers: UserProfile[]) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      newProps.forEach(prop => {
        const ref = doc(db, 'properties', prop.id);
        batch.set(ref, prop);
      });

      newUsers.forEach(user => {
        if (user.email) {
          const ref = doc(db, 'users', user.email);
          batch.set(ref, user, { merge: true });
        }
      });

      await batch.commit();
      await fetchProperties();
    } catch (err) {
      console.error(err);
      setError('Ingestion failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: User-Only Ingestion (Fixes your error) ---
  const ingestUsers = async (newUsers: UserProfile[]) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      newUsers.forEach(user => {
        if (user.email) {
          const ref = doc(db, 'users', user.email);
          batch.set(ref, user, { merge: true });
        }
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
      setError('User ingestion failed.');
    } finally {
      setLoading(false);
    }
  };
  
  const seedDatabase = async () => {
    // Optional implementation
  };

  const clearDatabase = async (_options: any) => { // PREFIXED WITH _
    // Optional implementation
  };

  return { 
    properties, 
    loading, 
    error, 
    updateProperty, 
    ingestProperties, 
    ingestUsers, // <--- EXPORTED HERE
    seedDatabase, 
    clearDatabase 
  };
}