'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MailCheck, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>(token ? 'loading' : 'pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed');

        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Invalid or expired verification token.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl text-center relative z-10"
    >
      {status === 'loading' && (
        <div className="space-y-4 py-4">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">Verifying Email...</h2>
          <p className="text-sm text-slate-400">Please wait while we confirm your magic link.</p>
        </div>
      )}

      {status === 'pending' && (
        <div className="space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <MailCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Check Your Inbox</h2>
          <p className="text-sm text-slate-400">
            We&apos;ve sent a verification link to your work email address. Please click the link in your email to activate your account.
          </p>
          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Email Verified!</h2>
          <p className="text-sm text-slate-400">{message}</p>
          <div className="pt-4">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Verification Failed</h2>
          <p className="text-sm text-slate-400">{message}</p>
          <div className="pt-4">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2.5 px-5 rounded-xl transition-all"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
