'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { DayRail } from '@/components/DayRail';
import { LeaveGauge } from '@/components/LeaveGauge';
import { UserCheck, Clock, FileText, Users, ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/employee/dashboard');
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Error loading employee dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCheckIn = async () => {
    try {
      await fetch('/api/attendance/check-in', { method: 'POST' });
      const res = await fetch('/api/employee/dashboard');
      if (res.ok) setDashboardData(await res.json());
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-indigo-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Employee Self-Service Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'Team Member'} 👋
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Every workday, perfectly aligned. Here is your daily workplace overview.
            </p>
          </div>
        </div>

        {/* Day Rail Strip */}
        <DayRail onCheckInClick={handleCheckIn} />

        {/* Dashboard Content */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
            <div className="h-64 rounded-2xl skeleton-shimmer" />
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Quick Access Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/attendance">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="glass-panel-interactive p-5 rounded-2xl space-y-3 cursor-pointer border border-emerald-500/20"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <UserCheck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                      <span>Attendance</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Check-in / Check-out</p>
                  </div>
                </motion.div>
              </Link>

              <Link href="/leave">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="glass-panel-interactive p-5 rounded-2xl space-y-3 cursor-pointer border border-purple-500/20"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
                    <Clock className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                      <span>Leave Requests</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Apply for time-off</p>
                  </div>
                </motion.div>
              </Link>

              <Link href="/payroll">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="glass-panel-interactive p-5 rounded-2xl space-y-3 cursor-pointer border border-indigo-500/20"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                      <span>Payslips</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">View & Download</p>
                  </div>
                </motion.div>
              </Link>

              <Link href="/profile">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="glass-panel-interactive p-5 rounded-2xl space-y-3 cursor-pointer border border-amber-500/20"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                    <Users className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                      <span>My Profile</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Job details & docs</p>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Leave Balance Gauges */}
            <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Visual Leave Balance Gauges</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Track your remaining time-off quotas</p>
                </div>
                <Link href="/leave" className="text-xs text-indigo-400 font-semibold hover:underline">
                  Apply Leave →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LeaveGauge
                  label="Paid Leave"
                  used={dashboardData?.leaveBalance?.paidUsed || 2}
                  total={18}
                  pending={0}
                  color="indigo"
                />
                <LeaveGauge
                  label="Sick Leave"
                  used={dashboardData?.leaveBalance?.sickUsed || 1}
                  total={12}
                  pending={0}
                  color="emerald"
                />
                <LeaveGauge
                  label="Unpaid Leave"
                  used={dashboardData?.leaveBalance?.unpaidUsed || 0}
                  total={30}
                  pending={0}
                  color="amber"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
