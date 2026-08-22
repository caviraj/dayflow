'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  CalendarDays,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Users,
  Shield,
  ChevronRight,
} from 'lucide-react';

// Dynamic import for 3D canvas (SSR disabled)
const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] sm:h-[500px] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden bg-grid-pattern">
      {/* Background Lights */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[140px] pointer-events-none z-0" />

      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-slate-800/80 px-6 lg:px-12 py-4 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <span className="font-black text-white text-xl tracking-tighter">D</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  Dayflow
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Pro
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                HR Alignment Engine
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 lg:pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Next-Gen HRMS Experience</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Every workday, <br />
              <span className="text-gradient-indigo">perfectly aligned.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Dayflow brings real-time attendance verification, visual leave balance gauges, transparent payslips, and instant HR approvals into one art-directed workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all border border-indigo-400/40"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signin"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl glass-panel hover:bg-slate-800/80 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <span>Sign In to Dashboard</span>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Role-based security</span>
              </div>
            </div>
          </motion.div>

          {/* 3D Interactive Centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-panel rounded-3xl p-4 border border-indigo-500/30 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
              <HeroScene />
              <div className="absolute bottom-4 left-4 right-4 glass-panel p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-slate-200">Interactive 3D Alignment Mesh</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  Drag / Scroll
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
            Engineered For Precision
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            What Dayflow Does Best
          </h2>
          <p className="text-sm text-slate-400">
            A cohesive suite designed for high-velocity teams and modern HR departments.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="glass-panel-interactive p-6 rounded-2xl border border-emerald-500/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Live Attendance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant clock-in/out timestamp verification with daily status indicator pills and streak logging.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="glass-panel-interactive p-6 rounded-2xl border border-purple-500/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Visual Leave Gauges</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Animated quota bars for Paid, Sick, and Unpaid leave with real-time remaining balance alerts.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="glass-panel-interactive p-6 rounded-2xl border border-indigo-500/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Payroll Transparency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Read-only salary structure breakdown and instant PDF payslip downloads for every staff member.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="glass-panel-interactive p-6 rounded-2xl border border-amber-500/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">HR Approvals Queue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Streamlined one-click approve/reject actions with custom admin feedback modal and notifications.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Built For Both Sides Section */}
      <section className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-purple-400">
            Tailored User Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Built for Both Sides of the Organization
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Employees Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-panel rounded-3xl p-8 border border-indigo-500/30 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">For Staff & Employees</h3>
              <p className="text-xs text-slate-400 mt-1">Self-service control from mobile or desktop</p>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-tap daily check-in / check-out tracker</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Visual leave balance gauges & instant application form</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Downloadable payslip archives & personal profile editor</span>
              </li>
            </ul>
            <Link
              href="/signup?role=EMPLOYEE"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 pt-2"
            >
              <span>Explore Employee Experience</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* For HR Officers Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-panel rounded-3xl p-8 border border-purple-500/30 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">For HR & Admins</h3>
              <p className="text-xs text-slate-400 mt-1">Full oversight, analytics, and employee impersonation</p>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Admin Employee Switcher for instant context preview</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Centralized leave request approval queue with feedback modals</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Organization attendance trends & exportable CSV reports</span>
              </li>
            </ul>
            <Link
              href="/signup?role=ADMIN"
              className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 pt-2"
            >
              <span>Explore HR Admin Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 py-16 px-6 lg:px-12 max-w-5xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-10 sm:p-12 text-center space-y-6 border border-indigo-500/30 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready for a perfectly aligned workday?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Join Dayflow today to experience modern workforce management built for clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all border border-indigo-400/40"
            >
              Sign Up Now
            </Link>
            <Link
              href="/signin"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Dayflow — Every workday, perfectly aligned.</p>
      </footer>
    </div>
  );
}
