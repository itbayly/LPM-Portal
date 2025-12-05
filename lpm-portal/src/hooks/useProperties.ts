import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  writeBatch,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateMockProperties } from '../lib/mockData';
import type { Property } from '../dataModel';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Real-time Subscription
  useEffect(() => {
    const q = query(collection(db, "properties"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData: Property[] = [];
      snapshot.forEach((doc) => {
        liveData.push({ ...doc.data(), id: doc.id } as Property);
      });
      setProperties(liveData);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError("Failed to connect to the National Grid.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Update Function (Write to DB)
  const updateProperty = async (id: string, data: Partial<Property>) => {
    try {
      const ref = doc(db, "properties", id);
      await updateDoc(ref, data);
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to save changes. Check console.");
    }
  };

  // 3. Seed Function (One-time Upload)
  const seedDatabase = async () => {
    if (!confirm("This will upload 50 mock records to your Firestore Database. Continue?")) return;
    
    setLoading(true);
    const batch = writeBatch(db);
    const mockData = generateMockProperties(50);

    mockData.forEach((prop) => {
      // Create a reference with a new auto-ID
      const ref = doc(collection(db, "properties"));
      // Remove the mock ID so Firestore generates a real one, or use the mock ID
      const { id, ...data } = prop; 
      batch.set(ref, data);
    });

    try {
      await batch.commit();
      alert("Database successfully seeded!");
    } catch (err) {
      console.error("Seeding Error:", err);
      alert("Failed to seed database.");
    } finally {
      setLoading(false);
    }
  };

  return { properties, loading, error, updateProperty, seedDatabase };
}