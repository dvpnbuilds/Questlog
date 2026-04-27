import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Globe, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const { error } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else if (mode === 'signup') {
      setMessage('Check your email to confirm your account.');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@dvpnbuilds.com',
      password: 'showcasedemo',
    });
    if (error) setError(error.message);
    setIsDemoLoading(false);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };

  return (
    <div className="flex h-screen bg-[#020617] items-center justify-center overflow-hidden font-sans">
      {/* Ambient grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tighter text-white mb-2">
            QUEST<span className="text-cyan-400">LOG</span>
          </h1>
          <p className="text-slate-500 text-sm tracking-widest uppercase">Cyber Guild — Access Terminal</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8 shadow-[0_0_40px_rgba(6,182,212,0.08)]">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-800 mb-8">
            <button
              onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
              className={`flex-1 py-2.5 text-sm font-bold tracking-wider uppercase transition-all ${mode === 'signin' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
              className={`flex-1 py-2.5 text-sm font-bold tracking-wider uppercase transition-all ${mode === 'signup' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Create Account
            </button>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="text-[10px] text-cyan-400 uppercase tracking-widest font-black block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="adventurer@guild.io"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-cyan-400 uppercase tracking-widest font-black block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-2">{error}</p>
            )}
            {message && (
              <p className="text-cyan-400 text-xs border border-cyan-500/30 bg-cyan-500/10 rounded-lg px-4 py-2">{message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-[#020617] border border-cyan-500/50 rounded-lg text-cyan-400 font-bold uppercase tracking-tighter hover:bg-cyan-500/10 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {isLoading ? 'Authenticating...' : mode === 'signin' ? 'Enter the Guild' : 'Join the Guild'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-600 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 font-bold hover:border-slate-500 hover:text-white transition-all"
          >
            <Globe size={16} />
            Continue with Google
          </button>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="w-full mt-3 flex items-center justify-center gap-3 py-3 bg-transparent border border-violet-500/40 rounded-lg text-violet-400 font-bold uppercase tracking-tighter hover:bg-violet-500/10 hover:border-violet-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={16} />
            {isDemoLoading ? 'Loading Demo...' : 'View Demo'}
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6 tracking-wide">
          Your progress is bound to your account
        </p>
      </motion.div>
    </div>
  );
}
