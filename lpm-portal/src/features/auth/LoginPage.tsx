import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../../lib/firebase';
import { AlertCircle, Sun, Moon, Mail, Lock } from 'lucide-react'; 
import NoiseOverlay from '../landing/components/NoiseOverlay';
import { VndrLogo } from '../../components/ui/VndrLogo';

// --- TYPES & HELPERS ---
type AuthMode = 'signin' | 'signup' | 'invite';

// --- COMPONENT: THE SLOT (INPUT) ---
const InputSlot = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  icon: Icon, 
  readOnly = false,
  autoFocus = false
}: any) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 font-sans ml-1 transition-colors">
        {label}
      </label>
      <div className={`
        relative flex items-center rounded-xl overflow-hidden transition-all duration-300
        bg-white/40 dark:bg-white/5 border border-transparent
        focus-within:bg-white dark:focus-within:bg-white/10
        focus-within:border-indigo-500/30 dark:focus-within:border-indigo-400/30
        focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]
        ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-text hover:bg-white/60 dark:hover:bg-white/10'}
      `}>
        {Icon && (
          <div className="pl-4 text-slate-400 dark:text-slate-500 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input 
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          autoFocus={autoFocus}
          className="w-full h-12 bg-transparent border-none outline-none text-sm px-4 text-slate-900 dark:text-white font-sans placeholder:text-slate-400/70 dark:placeholder:text-slate-500 transition-colors"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default function LoginPage() {
  // -- STATE --
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0); 

  // -- THEME STATE --
  const [isDark, setIsDark] = useState(false);

  // -- INIT --
  useEffect(() => {
    // 1. Check Invite Token
    const params = new URLSearchParams(window.location.search);
    const inviteEmail = params.get('invite') || params.get('token');
    
    if (inviteEmail) {
      setMode('invite');
      setEmail(inviteEmail); 
    }

    // 2. Initialize Theme
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemDark) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  // -- HANDLERS --
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // --- SIGN UP LOGIC ---
        if (password !== confirmPassword) throw new Error("Passkeys do not match.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        // 1. Create Auth User
        await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Create Profile Doc (Self-Service)
        const userRef = doc(db, "users", email.toLowerCase());
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: email.toLowerCase(),
            name: email.split('@')[0], 
            role: 'pm',                
            scope: { type: 'portfolio', value: 'personal' }, 
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message.replace("Firebase:", "").replace("auth/", ""));
      setShakeKey(prev => prev + 1); 
    } finally {
      setIsLoading(false);
    }
  };

  const isInvite = mode === 'invite';
  const isSignUp = mode === 'signup' || isInvite;

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans selection:bg-indigo-500/20 dark:selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 flex items-center justify-center transition-colors duration-700 bg-gradient-to-br from-slate-100 via-indigo-50/30 to-white dark:from-[#0F172A] dark:via-[#020617] dark:to-[#0F172A]">
      
      {/* 1. ENVIRONMENT LAYERS */}
      {/* Noise - Subtler in Light Mode */}
      <div className="opacity-40 dark:opacity-70 transition-opacity duration-700">
        <NoiseOverlay />
      </div>
      
      {/* The Aurora Orb - Stronger Blue Haze in Light Mode */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 bg-indigo-500/20 dark:bg-indigo-500/20" 
      />

      {/* --- THEME TOGGLE ANCHOR --- */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md transition-all shadow-lg group bg-white/40 border border-white/50 text-slate-500 hover:bg-white/60 hover:text-indigo-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
      >
        {isDark ? (
          <Sun className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 group-hover:text-indigo-500 transition-colors" />
        )}
      </motion.button>

      {/* 2. THE CARD (Milled Glass Lens) */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          x: [0, -5, 5, -5, 5, 0] 
        }}
        key={shakeKey === 0 ? 'init' : shakeKey} 
        transition={{ 
          duration: shakeKey === 0 ? 0.6 : 0.4, 
          ease: [0.16, 1, 0.3, 1],
          x: { duration: 0.4 } 
        }}
        className="relative z-10 w-[90%] max-w-[400px]"
      >
        {/* Glass Container - Increased Transparency & Blur */}
        <div className="relative backdrop-blur-2xl rounded-3xl p-8 md:p-10 overflow-hidden transition-all duration-500 bg-white/40 border border-white/80 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15)] dark:bg-white/5 dark:border-white/20 dark:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] ring-1 ring-black/5">
            
            {/* A. HEADER */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <VndrLogo className="h-10 w-auto text-[#0F172A] dark:text-white" />
              </div>
              <h1 className="font-sans font-semibold text-xl tracking-tight transition-colors text-slate-900 dark:text-white">
                {isInvite ? 'Activate Account' : 'Welcome back'}
              </h1>
              <p className="text-sm mt-2 transition-colors text-slate-500 dark:text-slate-400">
                Your Contracts, Under Control.
              </p>
            </div>

            {/* B. TOGGLE (Fixed Grid Layout) */}
            {!isInvite && (
              <div className="relative grid grid-cols-2 p-1 rounded-full mb-8 transition-colors duration-300 bg-slate-200/50 border border-white/40 dark:bg-black/20 dark:border-white/5">
                <motion.div 
                  className="absolute top-1 bottom-1 rounded-full shadow-sm transition-all duration-300 bg-white dark:bg-slate-700"
                  initial={false}
                  animate={{ 
                    left: mode === 'signin' ? 4 : '50%', 
                    width: 'calc(50% - 4px)' 
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button 
                  onClick={() => { setMode('signin'); setError(''); }}
                  className={`relative z-10 text-xs font-semibold py-2 text-center transition-colors ${mode === 'signin' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`relative z-10 text-xs font-semibold py-2 text-center transition-colors ${mode === 'signup' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* C. FORM */}
            <form onSubmit={handleAuth} className="space-y-5">
              <InputSlot 
                label="Email Address" 
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                readOnly={isInvite}
                icon={Mail}
                autoFocus={!isInvite}
              />

              <AnimatePresence mode='popLayout'>
                <motion.div
                  key="password-field"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                >
                  <InputSlot 
                    label={isInvite ? "New Password" : "Password"}
                    type="password"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    icon={Lock} // Changed to Lock icon
                  />
                </motion.div>

                {isSignUp && (
                  <motion.div
                    key="confirm-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <InputSlot 
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e: any) => setConfirmPassword(e.target.value)}
                      icon={Lock}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 text-xs font-medium p-3 rounded-xl border transition-colors text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/30"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* D. PRIMARY BUTTON */}
              <button 
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-3.5 mt-2 rounded-full font-semibold text-sm tracking-wide text-white
                  bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500
                  shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200
                  flex items-center justify-center gap-2
                  ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  isInvite ? "Activate Profile" : (isSignUp ? "Create Account" : "Sign In")
                )}
              </button>
            </form>

            <div className="mt-8 flex justify-center gap-6 text-xs font-medium transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <a href="#" className="transition-colors">Help & Support</a>
              <a href="#" className="transition-colors">Forgot Password?</a>
            </div>

        </div>
      </motion.div>

    </div>
  );
}