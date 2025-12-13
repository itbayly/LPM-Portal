import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  writeBatch,
  query,
  orderBy,
  where,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { REAL_PROPERTIES, REAL_USERS } from '../lib/realData';
import { deleteFileFromStorage } from '../lib/storage';
import type { Property, UserProfile } from '../dataModel';

export function useProperties() {
  const { user, profile } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !profile) {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      let q = query(collection(db, "properties"), orderBy("name"));

      switch (profile.role) {
        case 'admin':
        case 'executive':
          break;
        case 'area_vp':
          if (profile.scope?.value) {
            const op = Array.isArray(profile.scope.value) ? 'in' : '==';
            q = query(collection(db, "properties"), where("hierarchy.area", op, profile.scope.value));
          }
          break;
        case 'region_vp':
          if (profile.scope?.value) {
            const op = Array.isArray(profile.scope.value) ? 'in' : '==';
            q = query(collection(db, "properties"), where("hierarchy.region", op, profile.scope.value));
          }
          break;
        case 'market_manager':
          if (profile.scope?.value) {
            const op = Array.isArray(profile.scope.value) ? 'in' : '==';
            q = query(collection(db, "properties"), where("hierarchy.market", op, profile.scope.value));
          }
          break;
        case 'regional_pm':
          q = query(collection(db, "properties"), where("regionalPmEmail", "==", user.email?.toLowerCase()));
          break;
        case 'pm':
          q = query(collection(db, "properties"), where("managerEmail", "==", user.email?.toLowerCase()));
          break;
        default:
          setProperties([]);
          setLoading(false);
          return;
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveData: Property[] = [];
        snapshot.forEach((doc) => {
          liveData.push({ ...doc.data(), id: doc.id } as Property);
        });
        setProperties(liveData);
        setLoading(false);
      }, (err) => {
        console.error("Firestore Permission Error:", err);
        setError("Access Denied.");
        setLoading(false);
      });

      return () => unsubscribe();

    } catch (err) {
      console.error("Query Build Error:", err);
      setLoading(false);
    }
  }, [user, profile]);

  // -- BATCH HELPERS --
  const batchDelete = async (collectionName: string) => {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    // Firestore batch limit is 500. We chunk it to be safe.
    const CHUNK_SIZE = 400;
    const chunks = [];
    
    for (let i = 0; i < snapshot.docs.length; i += CHUNK_SIZE) {
      chunks.push(snapshot.docs.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  };

  const ingestProperties = async (newProperties: Property[], derivedUsers: UserProfile[]) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      newProperties.forEach(prop => {
        const ref = doc(db, "properties", prop.id);
        batch.set(ref, prop);
      });
      derivedUsers.forEach(user => {
        const ref = doc(db, "users", user.email);
        batch.set(ref, user, { merge: true });
      });
      await batch.commit();
      alert(`Success! Ingested ${newProperties.length} properties.`);
    } catch (err) {
      console.error("Ingestion Error:", err);
      alert("Failed to upload data.");
    } finally {
      setLoading(false);
    }
  };

  const ingestUsers = async (newUsers: UserProfile[]) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      newUsers.forEach(user => {
        const ref = doc(db, "users", user.email);
        batch.set(ref, user);
      });
      await batch.commit();
      alert(`Success! Updated ${newUsers.length} users.`);
    } catch (err) {
      console.error("User Ingestion Error:", err);
      alert("Failed to upload users.");
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    if (!confirm(`This will upload ${REAL_PROPERTIES.length} properties and ${REAL_USERS.length} users. Continue?`)) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      REAL_PROPERTIES.forEach((prop) => {
        const ref = doc(db, "properties", prop.id); 
        batch.set(ref, prop);
      });
      REAL_USERS.forEach((user) => {
        const ref = doc(db, "users", user.email.toLowerCase());
        batch.set(ref, { ...user, email: user.email.toLowerCase() });
      });
      await batch.commit();
      alert("Ingestion Complete!");
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // UPDATED: Now accepts flags for selective nuking, including documents
  const clearDatabase = async (options: { properties: boolean; users: boolean; documents?: boolean }) => {
    const target = [];
    if (options.properties) target.push("Properties");
    if (options.users) target.push("Users");
    if (options.documents) target.push("All Documents");
    
    if (target.length === 0) return;

    if (!confirm(`⚠️ DANGER: This will delete ALL ${target.join(' AND ')}. Are you sure?`)) return;
    
    setLoading(true);
    try {
      // 1. Clear Documents (Storage + Firestore Array) - Must happen before deleting properties
      if (options.documents) {
        console.log("Starting document file cleanup...");
        const propertiesSnapshot = await getDocs(collection(db, 'properties'));
        
        const promises: Promise<void>[] = [];

        propertiesSnapshot.forEach((docSnap) => {
          const property = docSnap.data() as Property;
          const docRef = docSnap.ref;

          if (property.documents && property.documents.length > 0) {
            // Delete files from Firebase Storage
            property.documents.forEach(doc => {
              if (doc.storagePath) {
                // We use catch here so one failure doesn't stop the whole process
                promises.push(
                  deleteFileFromStorage(doc.storagePath)
                    .catch(e => console.warn(`Storage deletion failed for ${doc.name}`, e))
                );
              }
            });
            
            // Clear documents array in Firestore
            promises.push(updateDoc(docRef, { documents: [] }));
          }
        });
        
        await Promise.all(promises);
        console.log('Document cleanup complete.');
      }

      // 2. Clear Collections
      if (options.properties) await batchDelete("properties");
      if (options.users) await batchDelete("users");
      
      alert("Selected data has been cleared.");
    } catch (err) {
      console.error("Clear Error:", err);
      alert("Failed to clear database.");
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (id: string, data: Partial<Property>) => {
    const ref = doc(db, "properties", id);
    await writeBatch(db).update(ref, data).commit();
  };

  return { properties, loading, error, updateProperty, seedDatabase, clearDatabase, ingestProperties, ingestUsers };
}