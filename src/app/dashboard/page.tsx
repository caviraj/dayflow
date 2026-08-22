'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { DayRail } from '@/components/DayRail';
import { ViewingAsBanner } from '@/components/ViewingAsBanner';
import { LeaveGauge } from '@/components/LeaveGauge';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Users,
  Clock,
  UserCheck,
  FileText,
  ChevronRight,
  UserCog,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || 'EMPLOYEE';

  const [loading, setLoading] = useState(true);
  const [employeeDashboardData, setEmployeeDashboardData] = useState<any>(null);
  const [adminDashboardData, setAdminDashboardData] = useState<any>(null);
  const [viewingAsEmployee, setViewingAsEmployee] = useState<{ id: string; name: string } | null>(null);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (role === 'ADMIN' && !viewingAsEmployee) {
          const res = await fetch('/api/admin/dashboard');
          if (res.ok) {
            const data = await res.json();
            setAdminDashboardData(data);
          }
          // Fetch employee list for switcher
          const empRes = await fetch('/api/admin/employees');
          if (empRes.ok) {
            const empData = await empRes.json();
            setEmployeeList(empData.data || []);
          }
        } else {
          const targetUrl = viewingAsEmployee
            ? `/api/employee/dashboard?userId=${viewingAsEmployee.id}`
            : '/api/employee/dashboard';
          const res = await fetch(targetUrl);
          if (res.ok) {
            const data = await res.json();
            setEmployeeDashboardData(data);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [role, viewingAsEmployee]);

  const handleCheckIn = async () => {
    try {
      await fetch('/api/attendance/check-in', { method: 'POST' });
      const res = await fetch('/api/employee/dashboard');
      if (res.ok) setEmployeeDashboardData(await res.json());
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

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
        {/* Day Rail Widget */}
        <DayRail onCheckInClick={handleCheckIn} />

        {/* Admin Employee Switcher Bar (Admin Only) */}
        {role === 'ADMIN' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-500/30 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center gap-3 text-sm text-purple-300 font-semibold">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <UserCog className="w-4 h-4" />
              </div>
              <div>
                <span>Admin Switcher: View As Employee</span>
                <p className="text-[11px] text-purple-400/70 font-normal">
                  Impersonate any registered staff member to test permissions.
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
              className="bg-slate-900/90 border border-purple-500/40 rounded-xl text-xs py-2.5 px-3.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer shadow-inner"
            >
              <option value="">Default Admin View</option>
              {employeeList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeId} - {emp.department} ({emp.user?.email})
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Dashboard Skeleton Loading */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
            <div className="h-64 rounded-2xl skeleton-shimmer" />
          </div>
        ) : role === 'ADMIN' && !viewingAsEmployee ? (
          /* ADMIN DASHBOARD VIEW */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={itemVariants} className="glass-panel-interactive p-5.5 rounded-2xl flex items-center justify-between border border-indigo-500/20">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-bold">
                    Total Active Staff
                  </span>
                  <h2 className="text-3xl font-black text-white mt-1 tracking-tight">
                    {adminDashboardData?.metrics?.totalEmployees || 0}
                  </h2>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    Real-time roster
                  </span>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                  <Users className="w-6.5 h-6.5" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel-interactive p-5.5 rounded-2xl flex items-center justify-between border border-amber-500/20">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                    Pending Leave Requests
                  </span>
                  <h2 className="text-3xl font-black text-amber-300 mt-1 tracking-tight">
                    {adminDashboardData?.metrics?.pendingLeaveRequests || 0}
                  </h2>
                  <span className="text-[10px] text-slate-400 mt-1 block">Requires action</span>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Clock className="w-6.5 h-6.5" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel-interactive p-5.5 rounded-2xl flex items-center justify-between border border-emerald-500/20">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
                    Today Checked In
                  </span>
                  <h2 className="text-3xl font-black text-emerald-300 mt-1 tracking-tight">
                    {adminDashboardData?.metrics?.attendanceSummary?.PRESENT || 0}
                  </h2>
                  <span className="text-[10px] text-slate-400 mt-1 block">Live presence</span>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-6.5 h-6.5" />
                </div>
              </motion.div>
            </div>

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
                  <span>Open Full Queue</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {adminDashboardData?.leaveApprovalQueue?.length === 0 ? (
                <div className="text-center py-10 glass-panel rounded-xl border border-slate-800/80">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold text-slate-400">Queue is completely clear!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No pending employee leave requests.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {adminDashboardData?.leaveApprovalQueue?.map((req: any) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl glass-panel-interactive border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                          <span>{req.employee?.employeeId || 'Employee'}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-indigo-400">{req.type} Leave</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(req.startDate).toLocaleDateString()} to{' '}
                          {new Date(req.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                        <StatusBadge status={req.status} />
                        <Link
                          href="/leave"
                          className="text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          /* EMPLOYEE DASHBOARD VIEW */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
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

            {/* Leave Balance Visual Gauges */}
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
                  used={employeeDashboardData?.leaveBalance?.paidUsed || 2}
                  total={18}
                  pending={0}
                  color="indigo"
                />
                <LeaveGauge
                  label="Sick Leave"
                  used={employeeDashboardData?.leaveBalance?.sickUsed || 1}
                  total={12}
                  pending={0}
                  color="emerald"
                />
                <LeaveGauge
                  label="Unpaid Leave"
                  used={employeeDashboardData?.leaveBalance?.unpaidUsed || 0}
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

