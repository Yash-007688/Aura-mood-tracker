import React, { useState } from 'react';
import { Key, Lock, Mail, Sparkles, User, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  onSuccess: (customApiKey?: string) => void;
}

export default function AuthModal({ onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [useCustomKey, setUseCustomKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all standard credentials.');
      return;
    }
    
    // Store credentials Mock Session
    localStorage.setItem('aura_user_logged', 'true');
    localStorage.setItem('aura_user_email', email);
    
    if (useCustomKey && apiKey.trim()) {
      localStorage.setItem('aura_custom_api_key', apiKey.trim());
      onSuccess(apiKey.trim());
    } else {
      localStorage.removeItem('aura_custom_api_key');
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {isLogin ? 'Sign in to Aura' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isLogin 
              ? 'Access your emotional journey and configure Gemini AI' 
              : 'Sign up to keep track of your wellness reflections'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail size={13} /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 text-xs bg-slate-55/20 border border-slate-200 dark:border-slate-800 dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Key size={13} /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-xs bg-slate-55/20 border border-slate-200 dark:border-slate-800 dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useCustomKey}
                onChange={(e) => setUseCustomKey(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400 flex items-center gap-1">
                <Sparkles size={11} className="text-indigo-500" /> Use Custom Gemini API Key
              </span>
            </label>
          </div>

          {useCustomKey && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5"
            >
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gemini API Key
              </label>
              <input
                type="password"
                required={useCustomKey}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 text-xs bg-slate-55/20 border border-slate-200 dark:border-slate-800 dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition-all text-slate-800 dark:text-slate-100 font-mono"
              />
              <p className="text-[9px] text-slate-400">
                This key resides locally in your browser context.
              </p>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            {isLogin ? <User size={13} /> : <UserPlus size={13} />}
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[11px] text-indigo-650 hover:underline font-semibold"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
