import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
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
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Reset profile listener on auth change
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (currentUser && currentUser.email) {
        // LISTENER: Subscribe to the user profile in real-time
        const userRef = doc(db, "users", currentUser.email.toLowerCase());
        
        profileUnsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            // FIX: Double cast (as unknown as UserProfile) to resolve type overlap error
            setProfile({ ...docSnap.data(), uid: currentUser.uid } as unknown as UserProfile);
          } else {
            // Profile doesn't exist yet (or was deleted)
            setProfile(null); 
          }
          setLoading(false); // Done loading once we check DB
        }, (err) => {
          console.error("Profile subscription error:", err);
          setLoading(false);
        });

      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    // Profile will be cleared by the auth listener above
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas dark:bg-[#050507]">
        <div className="text-text-secondary dark:text-slate-400 font-medium animate-pulse text-xs uppercase tracking-widest font-mono">
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