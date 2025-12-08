import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { UserProfile } from '../../dataModel';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && currentUser.email) {
        // SECURITY CHECK: Look up the user in the seeded "Roster"
        try {
          const userRef = doc(db, "users", currentUser.email.toLowerCase());
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            // User found! Load their Role and Scope
            setProfile({ ...userSnap.data(), uid: currentUser.uid } as UserProfile);
          } else {
            // User NOT in roster -> Deny Access (or set to Guest)
            console.warn("User not found in access roster:", currentUser.email);
            setProfile(null); 
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas">
        <div className="text-text-secondary font-medium animate-pulse">
          Verifying Access Clearance...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      logout,
      // Helper: Simple boolean to hide/show UI elements
      isAdmin: profile?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};