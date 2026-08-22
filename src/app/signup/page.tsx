'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Building, IdCard, AlertCircle, ArrowRight, Check, X, Shield, Users, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation checks
  const hasMinLen = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

  const passwordScore = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordScore < 5) {
      setError('Please ensure password meets all security rules.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/signin?registered=true');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden bg-[#090d16] my-6">
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl glass-panel rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/30 grid grid-cols-1 lg:grid-cols-2 relative z-10 backdrop-blur-2xl">
        {/* Left Column — Brand Showcase */}
        <div className="p-8 lg:p-12 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
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
                Onboarding & Registration
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Join your company workspace.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select your designated role to gain immediate access to self-service portals or administrative HR queues.
              </p>
            </div>
          </div>

          <div className="pt-8 space-y-3 relative z-10">
            <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Field-Level Permission Handling</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your role selection automatically applies strict backend RBAC rules to your account features.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — Active Registration Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-5 bg-slate-950/40">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">Create Your Account</h3>
            <p className="text-xs text-slate-400">Fill in your details below to get started</p>
          </div>

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
            {/* Role Selection Segmented Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Workspace Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setFormData({ ...formData, role: 'EMPLOYEE' })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    formData.role === 'EMPLOYEE'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Employee
                    </span>
                    {formData.role === 'EMPLOYEE' && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Clock in/out, apply leave, download payslips.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    formData.role === 'ADMIN'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-md shadow-purple-500/10 ring-1 ring-purple-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      HR / Admin
                    </span>
                    {formData.role === 'ADMIN' && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Approve leave, payroll control, view all staff.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Employee ID
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="EMP-001"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-slate-100 font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Operations"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-slate-100 font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="employee@company.com"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-slate-100 font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-slate-100 font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Password Strength Visual Meter */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordScore <= 2
                          ? 'bg-rose-500 w-1/3'
                          : passwordScore <= 4
                          ? 'bg-amber-500 w-2/3'
                          : 'bg-emerald-500 w-full'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      {hasMinLen ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasUpper ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasLower ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                      <span>Lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-indigo-400/30 text-xs mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            Already registered?{' '}
            <Link href="/signin" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
