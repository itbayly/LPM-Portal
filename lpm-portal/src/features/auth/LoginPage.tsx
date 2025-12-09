import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Building2, Lock, Mail, UserPlus, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // 1. Check if user is on the "Roster" (Firestore)
      const userRef = doc(db, "users", email.toLowerCase());
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // SCENARIO: Not on the list
        setError("Access Denied: Your email is not in the system.");
        // Optional: Trigger a mailto link for them
        setTimeout(() => {
          if(confirm("Would you like to request access from the Administrator?")) {
            window.location.href = `mailto:admin@lpm.com?subject=Request Access: ${email}&body=Hello Admin,%0D%0A%0D%0APlease add ${email} to the LPM Portal roster.`;
          }
        }, 100);
        setLoading(false);
        return;
      }

      // 2. User is on the list, try to create Auth account
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Success! They are now logged in automatically by the AuthContext listener
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists for this email. Please Sign In instead.');
        setTimeout(() => setIsSignUp(false), 2000); // Auto-switch to login
      } else {
        setError('Failed to create account. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-lg shadow-lvl3 overflow-hidden">
        
        {/* Brand Header */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4 ring-1 ring-white/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">LPM Portal</h1>
          <p className="text-slate-400 text-sm">Property Management Command Center</p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <div className="mb-6 flex justify-center">
            <div className="bg-slate-100 p-1 rounded-md inline-flex">
              <button 
                onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
                className={`px-6 py-1.5 text-sm font-bold rounded-sm transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
                className={`px-6 py-1.5 text-sm font-bold rounded-sm transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-9 pr-3 h-10 border border-border rounded-md text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-9 pr-3 h-10 border border-border rounded-md text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-9 pr-3 h-10 border border-border rounded-md text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white h-10 rounded-md font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="opacity-70">Processing...</span>
              ) : isSignUp ? (
                <>Create Account <UserPlus className="w-4 h-4" /></>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <a href="#" className="text-xs text-text-secondary hover:text-brand transition-colors">Forgot your password?</a>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-border">
          <p className="text-xs text-text-secondary">
            &copy; 2025 LPM Property Management
          </p>
        </div>

      </div>
    </div>
  );
}