'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Users } from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const registered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        if (res.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please verify your credentials.');
        } else {
          setError(res.error || 'Authentication failed. Please try again.');
        }
        setLoading(false);
      } else if (res?.ok) {
        // Fetch current session to perform role-driven redirect
        const sessionRes = await fetch('/api/profile/me');
        if (sessionRes.ok) {
          const profile = await sessionRes.json();
          const target = profile.user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/employee';
          router.push(callbackUrl || target);
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl glass-panel rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/30 grid grid-cols-1 lg:grid-cols-2 relative z-10 backdrop-blur-2xl">
      {/* Left Column — Brand Showcase */}
      <div className="p-8 lg:p-12 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="font-black text-white text-xl tracking-tighter">D</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Dayflow
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                HR Alignment Engine
              </span>
            </div>
          </Link>

          <div className="space-y-3 pt-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
              Welcome Back
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Aligned workdays start here.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access your real-time attendance log, leave quotas, salary structures, and role-scoped HR controls.
            </p>
          </div>
        </div>

        <div className="pt-10 space-y-3 relative z-10">
          <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Role-Based Portal Redirection</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your login automatically routes you to your dedicated Employee or HR Admin Dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column — Active Form */}
      <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6 bg-slate-950/40">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">Sign In to Account</h3>
          <p className="text-xs text-slate-400">Enter your credentials below</p>
        </div>

        {registered && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3 shadow-md"
          >
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-bold">Registration Successful!</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">You can now sign in with your email & password.</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-md"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-400" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@company.com"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-100 font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-100 font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-indigo-400/30 mt-2 text-xs"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden bg-[#090d16]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading authentication...</div>}>
        <SignInContent />
      </Suspense>
    </div>
  );
}
