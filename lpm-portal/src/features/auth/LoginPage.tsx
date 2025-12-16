import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // <--- Added setDoc
import { auth, db } from '../../lib/firebase';
import { Lock, AlertCircle, Sun, Moon } from 'lucide-react'; 
import NoiseOverlay from '../landing/components/NoiseOverlay';

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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative group">
      <label className="text-[10px] font-bold uppercase tracking-wide text-text-secondary dark:text-slate-400 mb-1.5 block opacity-70">
        {label}
      </label>
      <div className={`
        relative flex items-center bg-black/5 dark:bg-white/5 rounded-t-sm overflow-hidden
        ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-text'}
      `}>
        {Icon && (
          <div className="pl-3 text-text-secondary dark:text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input 
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-12 bg-transparent border-none outline-none text-sm px-3 text-text-primary dark:text-white font-mono placeholder:text-slate-400/50"
          spellCheck={false}
        />
        
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-text-secondary/20">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: isFocused ? "100%" : "0%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full mx-auto bg-brand dark:bg-cyan-400"
          />
        </div>
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
        if (password.length < 6) throw new Error("Passkey strength insufficient (min 6 chars).");

        // 1. Create Auth User
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Create Profile Doc (Self-Service)
        // We assume anyone signing up from the login page is a standard "Property Manager"
        const userRef = doc(db, "users", email.toLowerCase());
        
        // Only set if it doesn't exist (prevent overwriting if invite existed)
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: email.toLowerCase(),
            name: email.split('@')[0], // Default name from email
            role: 'pm',                // Default role
            scope: { type: 'portfolio', value: 'personal' }, // Default scope
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
    <div className="relative min-h-screen w-full overflow-hidden font-sans selection:bg-brand selection:text-white flex items-center justify-center bg-[#F2F4F6] dark:bg-[#050507] transition-colors duration-500">
      
      <NoiseOverlay />
      
      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-[#E0F2FE] rounded-full blur-3xl opacity-40 pointer-events-none dark:hidden mix-blend-multiply" />
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-[#2E1065] rounded-full blur-3xl opacity-20 pointer-events-none hidden dark:block mix-blend-screen" />

      {/* --- THEME TOGGLE ANCHOR --- */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-text-secondary hover:text-text-primary dark:text-slate-400 dark:hover:text-white hover:bg-white/20 transition-all shadow-sm group"
      >
        {isDark ? (
          <Sun className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 group-hover:text-indigo-500 transition-colors" />
        )}
      </motion.button>

      {/* 2. THE ACCESS PANEL */}
      <motion.div 
        initial={{ scale: 0.98, opacity: 0, filter: 'blur(10px)' }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          filter: 'blur(0px)',
          x: [0, -10, 10, -10, 10, 0] 
        }}
        key={shakeKey === 0 ? 'init' : shakeKey} 
        transition={{ 
          duration: shakeKey === 0 ? 0.4 : 0.4, 
          ease: "easeOut",
          x: { duration: 0.4 } 
        }}
        className="relative z-10 w-[90%] max-w-[420px]"
      >
        <div 
          className="p-[1px] rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
          style={{
            background: "linear-gradient(135deg, var(--border-start), var(--border-end))",
          }}
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] dark:from-[rgba(0,240,255,0.3)] dark:to-[rgba(112,0,255,0.3)] opacity-100" />

          <div className="relative bg-white/60 dark:bg-[#0A0A0C]/60 backdrop-blur-xl rounded-lg p-8 overflow-hidden">
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="font-extrabold tracking-[0.25em] text-text-primary dark:text-white text-xl">VNDR</h1>
                <p className={`font-mono text-[10px] font-bold mt-1 tracking-widest transition-colors ${error ? 'text-red-500' : 'text-text-secondary/50 dark:text-slate-400'}`}>
                  {isInvite ? 'ESTABLISH CONNECTION' : (error ? 'CREDENTIALS REJECTED' : 'IDENTIFICATION REQUIRED')}
                </p>
              </div>
              <div className="relative flex items-center justify-center w-4 h-4">
                <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-[#10B981] animate-pulse'}`} />
                {error && <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />}
              </div>
            </div>

            {!isInvite && (
              <div className="relative flex bg-black/5 dark:bg-white/5 p-1 rounded-md mb-8">
                <motion.div 
                  className="absolute top-1 bottom-1 rounded-sm bg-white dark:bg-slate-700 shadow-sm"
                  initial={false}
                  animate={{ 
                    left: mode === 'signin' ? 4 : '50%', 
                    width: 'calc(50% - 4px)' 
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button 
                  onClick={() => { setMode('signin'); setError(''); }}
                  className={`flex-1 relative z-10 text-xs font-bold py-2 text-center transition-colors ${mode === 'signin' ? 'text-text-primary dark:text-white' : 'text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white'}`}
                >
                  SIGN IN
                </button>
                <button 
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 relative z-10 text-xs font-bold py-2 text-center transition-colors ${mode === 'signup' ? 'text-text-primary dark:text-white' : 'text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white'}`}
                >
                  SIGN UP
                </button>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <InputSlot 
                label="EMAIL ADDRESS" 
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                readOnly={isInvite}
                icon={isInvite ? Lock : undefined}
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
                    label={isInvite ? "SET SECURE PASSWORD" : "PASSWORD"}
                    type="password"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                  />
                </motion.div>

                {isSignUp && (
                  <motion.div
                    key="confirm-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-6"
                  >
                    <InputSlot 
                      label="CONFIRM PASSWORD"
                      type="password"
                      value={confirmPassword}
                      onChange={(e: any) => setConfirmPassword(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={isLoading}
                className={`
                  relative w-full h-12 mt-4 rounded-sm font-bold text-xs tracking-widest uppercase overflow-hidden transition-all
                  ${isLoading ? 'cursor-not-allowed opacity-80' : 'hover:opacity-90 active:scale-[0.99]'}
                  bg-[#0F172A] text-white dark:bg-[#F8FAFC] dark:text-black
                `}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "SCANNING..." : (isInvite ? "ACTIVATE PROFILE" : (isSignUp ? "INITIALIZE ACCOUNT" : "AUTHENTICATE"))}
                </div>
                
                {isLoading && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-black/10"
                  />
                )}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-start gap-2 text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-sm border border-red-100 dark:border-red-900/30"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-end text-[10px] font-mono uppercase text-text-secondary/40 select-none pointer-events-none">
        <div>
          SECURE CONNECTION // TLS 1.3
        </div>
        <div className="flex gap-4 pointer-events-auto dark:text-slate-400">
          <a href="#" className="hover:text-text-primary dark:hover:text-white hover:underline transition-colors">Help</a>
          <a href="#" className="hover:text-text-primary dark:hover:text-white hover:underline transition-colors">Forgot Credentials?</a>
        </div>
      </div>

    </div>
  );
}