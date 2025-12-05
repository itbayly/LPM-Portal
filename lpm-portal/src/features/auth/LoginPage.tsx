import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Lock, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext will handle the redirect automatically once user state changes
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-md">
      <div className="w-full max-w-md bg-surface shadow-lvl3 rounded-lg border border-border p-xl">
        
        {/* Header */}
        <div className="text-center mb-xl">
          <h1 className="text-2xl font-bold text-text-primary mb-xs">LPM Portal</h1>
          <p className="text-text-secondary text-sm">Sign in to access the National Elevator Grid</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-md p-sm bg-status-criticalBg text-status-critical text-sm font-medium rounded-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-lg">
          
          <div className="space-y-xs">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={cn(
              "w-full py-2.5 px-4 rounded-sm text-sm font-semibold text-white shadow-lvl1 transition-colors",
              loading ? "bg-slate-400 cursor-not-allowed" : "bg-brand hover:bg-brand-dark"
            )}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}