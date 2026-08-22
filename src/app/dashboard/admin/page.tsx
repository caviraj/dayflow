'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { DayRail } from '@/components/DayRail';
import { ViewingAsBanner } from '@/components/ViewingAsBanner';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkforceAnalyticsChart } from '@/components/WorkforceAnalyticsChart';
import { QuickActionToolbar } from '@/components/QuickActionToolbar';
import { Users, Clock, CheckCircle2, ChevronRight, UserCog, Sparkles, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [adminDashboardData, setAdminDashboardData] = useState<any>(null);
  const [viewingAsEmployee, setViewingAsEmployee] = useState<{ id: string; name: string } | null>(null);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setAdminDashboardData(data);
        }
        const empRes = await fetch('/api/admin/employees');
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployeeList(empData.data || []);
        }
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const totalEmployees = adminDashboardData?.metrics?.totalEmployees || 18;
  const pendingLeave = adminDashboardData?.metrics?.pendingLeaveRequests || 0;
  const presentCount = adminDashboardData?.metrics?.attendanceSummary?.PRESENT || 0;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {viewingAsEmployee && (
        <ViewingAsBanner
          employeeName={viewingAsEmployee.name}
          employeeId={viewingAsEmployee.id}
          onClear={() => setViewingAsEmployee(null)}
        />
      )}

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-purple-500/20 relative overflow-hidden backdrop-blur-2xl shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                HR & Administrative Control Center
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
              Admin Workspace Overview
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Organization roster oversight, workforce analytics, pending leave approvals, and employee context preview.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/reports"
              className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-2 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Full Analytics</span>
            </Link>
          </div>
        </div>

        {/* Day Rail */}
        <DayRail pendingApprovalsCount={pendingLeave} />

        {/* Quick Action Administrative Toolbar */}
        <QuickActionToolbar />

        {/* Admin Impersonation Switcher Bar */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-500/30 backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center gap-3 text-sm text-purple-300 font-semibold">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30 shrink-0">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-bold text-xs sm:text-sm">Admin Context Switcher: Preview Employee View</span>
              <p className="text-[11px] text-purple-300/70 font-normal">
                Select an employee from your company roster to preview their self-service context.
              </p>
            </div>
          </div>
          <select
            value={viewingAsEmployee?.id || ''}
            onChange={(e) => {
              const selected = employeeList.find((emp) => emp.id === e.target.value);
              if (selected) {
                setViewingAsEmployee({
                  id: selected.id,
                  name: selected.employeeId || selected.user?.email || 'Employee',
                });
              } else {
                setViewingAsEmployee(null);
              }
            }}
            className="bg-slate-900/90 border border-purple-500/40 rounded-xl text-xs py-2.5 px-3.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer shadow-inner w-full sm:w-auto"
          >
            <option value="">Default Admin Control View</option>
            {employeeList.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employeeId} - {emp.department} ({emp.user?.email})
              </option>
            ))}
          </select>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
            <div className="h-64 rounded-2xl skeleton-shimmer" />
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={itemVariants} className="glass-panel-interactive p-5.5 rounded-2xl flex items-center justify-between border border-indigo-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-bold">
                    Total Active Staff
                  </span>
                  <h2 className="text-3xl font-black text-white mt-1 tracking-tight">
                    {totalEmployees}
                  </h2>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    Real-time organization roster
                  </span>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
                  <Users className="w-6.5 h-6.5" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel-interactive p-5.5 rounded-2xl flex items-center justify-between border border-amber-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                    Pending Leave Requests
                  </span>
                  <h2 className="text-3xl font-black text-amber-300 mt-1 tracking-tight">
                    {pendingLeave}
                  </h2>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {pendingLeave > 0 ? 'Action required in queue' : 'Queue clear'}
                  </span>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
                  <ShieldCheck className="w-6.5 h-6.5" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel-interactive p-5.5 rounded-2xl flex items-center justify-between border border-emerald-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
                    Today Checked In
                  </span>
                  <h2 className="text-3xl font-black text-emerald-300 mt-1 tracking-tight">
                    {presentCount}
                  </h2>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Live office & remote presence
                  </span>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                  <CheckCircle2 className="w-6.5 h-6.5" />
                </div>
              </motion.div>
            </div>

            {/* Visual Analytics Component */}
            <WorkforceAnalyticsChart
              presentCount={presentCount}
              totalCount={totalEmployees}
              pendingLeaveCount={pendingLeave}
            />

            {/* Leave Approval Queue */}
            <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-base font-bold text-slate-100">Leave Approval Queue</h3>
                </div>
                <Link
                  href="/leave"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 group"
                >
                  <span>Open Approval Portal</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {adminDashboardData?.leaveApprovalQueue?.length === 0 ? (
                <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800/80">
                  <Sparkles className="w-8 h-8 text-indigo-400/60 mx-auto mb-2.5 animate-pulse" />
                  <p className="text-xs font-bold text-slate-300">Queue is completely clear!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No pending employee leave requests requiring review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminDashboardData?.leaveApprovalQueue?.map((req: any) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl glass-panel-interactive border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shrink-0">
                          {req.employee?.employeeId?.slice(-3) || 'EMP'}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                            <span>{req.employee?.employeeId || 'Employee'}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-indigo-400 font-semibold">{req.type} Leave</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(req.startDate).toLocaleDateString()} to{' '}
                            {new Date(req.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                        <StatusBadge status={req.status} />
                        <Link
                          href="/leave"
                          className="text-xs bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-300 border border-indigo-500/40 px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all shadow-sm"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
