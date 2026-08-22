'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { DayRail } from '@/components/DayRail';
import { LeaveGauge } from '@/components/LeaveGauge';
import { UserCheck, Clock, FileText, User, ArrowUpRight, Sparkles, Plus, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    type: 'PAID',
    startDate: '',
    endDate: '',
    remarks: '',
  });

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckInToggle = async () => {
    setCheckInLoading(true);
    try {
      const isCheckedIn = dashboardData?.todayAttendance?.checkIn && !dashboardData?.todayAttendance?.checkOut;
      const endpoint = isCheckedIn ? '/api/attendance/check-out' : '/api/attendance/check-in';
      await fetch(endpoint, { method: 'POST' });
      await loadData();
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leave/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyForm),
      });
      if (res.ok) {
        setShowApplyModal(false);
        setApplyForm({ type: 'PAID', startDate: '', endDate: '', remarks: '' });
        await loadData();
      }
    } catch (err) {
      console.error('Error applying leave:', err);
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

  const isCheckedIn = dashboardData?.todayAttendance?.checkIn && !dashboardData?.todayAttendance?.checkOut;
  const checkInTime = dashboardData?.todayAttendance?.checkIn
    ? new Date(dashboardData.todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-indigo-500/20 relative overflow-hidden backdrop-blur-2xl shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Employee Self-Service Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
              Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'Team Member'} 👋
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Manage your daily attendance log, visual leave quota balances, salary payslips, and personal requests.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowApplyModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Time-Off</span>
            </motion.button>
          </div>
        </div>

        {/* Day Rail Strip */}
        <DayRail
          attendanceStatus={isCheckedIn ? 'PRESENT' : 'ABSENT'}
          onCheckInClick={handleCheckInToggle}
        />

        {/* Loading State */}
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
            {/* Live Clock-In Action & Status Widget */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${
                  isCheckedIn
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
                    : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 shadow-indigo-500/20'
                }`}>
                  <UserCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Today&apos;s Attendance Status
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isCheckedIn
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isCheckedIn ? 'ACTIVE ON-DUTY' : 'NOT CHECKED IN'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {isCheckedIn ? `Checked in at ${checkInTime}` : 'Ready to begin your workday?'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isCheckedIn ? 'Your shift duration is being logged in real time.' : 'Tap the action button to record your entry timestamp.'}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                disabled={checkInLoading}
                onClick={handleCheckInToggle}
                className={`w-full md:w-auto px-7 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl border transition-all ${
                  isCheckedIn
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/40 shadow-rose-600/30'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white border-emerald-400/40 shadow-emerald-600/30'
                }`}
              >
                <UserCheck className="w-4.5 h-4.5" />
                <span>{checkInLoading ? 'Processing...' : isCheckedIn ? 'Clock Out Now' : 'Clock In Now'}</span>
              </motion.button>
            </div>

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
                    <p className="text-xs text-slate-400 mt-1">Clock logs & monthly record</p>
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
                      <span>Leave Quotas</span>
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
                      <span>My Payslips</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">View salary & download PDF</p>
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
                    <User className="w-5.5 h-5.5" />
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

            {/* Visual Leave Balance Gauges Section */}
            <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Visual Leave Balance Gauges</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Track your remaining time-off quotas for 2026</p>
                </div>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>+ Apply Leave</span>
                </button>
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

            {/* My Recent Leave Requests History */}
            <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">Recent Time-Off Applications</h3>
                </div>
                <Link href="/leave" className="text-xs text-purple-400 font-semibold hover:underline">
                  View Full History →
                </Link>
              </div>

              {dashboardData?.recentLeaves?.length === 0 ? (
                <div className="text-center py-8 glass-panel rounded-xl border border-slate-800/80">
                  <Sparkles className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-slate-400">No time-off requests submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dashboardData?.recentLeaves?.slice(0, 3).map((leave: any) => (
                    <div
                      key={leave.id}
                      className="p-4 rounded-xl glass-panel-interactive border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-100">{leave.type} Leave</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                        leave.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : leave.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel max-w-md w-full rounded-2xl p-6 border border-indigo-500/30 space-y-5 shadow-2xl"
            >
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                <span>Apply for Time-Off</span>
              </h3>

              <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Leave Type</label>
                  <select
                    value={applyForm.type}
                    onChange={(e) => setApplyForm({ ...applyForm, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="PAID">Paid Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Start Date</label>
                    <input
                      type="date"
                      required
                      value={applyForm.startDate}
                      onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">End Date</label>
                    <input
                      type="date"
                      required
                      value={applyForm.endDate}
                      onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Remarks / Reason</label>
                  <textarea
                    rows={3}
                    value={applyForm.remarks}
                    onChange={(e) => setApplyForm({ ...applyForm, remarks: e.target.value })}
                    placeholder="State reason for your leave request..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
