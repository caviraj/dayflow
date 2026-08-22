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
  CalendarCheck,
  Clock,
  UserCheck,
  FileText,
  TrendingUp,
  ChevronRight,
  UserCog,
  AlertCircle,
  CheckCircle2,
  XCircle,
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
      // Refresh dashboard
      const res = await fetch('/api/employee/dashboard');
      if (res.ok) setEmployeeDashboardData(await res.json());
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
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
          <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-500/20">
            <div className="flex items-center gap-2 text-sm text-purple-300 font-medium">
              <UserCog className="w-4 h-4 text-purple-400" />
              <span>Admin Employee Impersonation Switcher:</span>
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
              className="bg-slate-900 border border-slate-700 rounded-xl text-xs py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="">Default Admin View</option>
              {employeeList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeId} - {emp.department} ({emp.user?.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dashboard Content */}
        {role === 'ADMIN' && !viewingAsEmployee ? (
          /* ADMIN DASHBOARD VIEW */
          <div className="space-y-6">
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Employees</span>
                  <h2 className="text-3xl font-extrabold text-white mt-1">
                    {adminDashboardData?.metrics?.totalEmployees || 0}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Pending Leave Requests</span>
                  <h2 className="text-3xl font-extrabold text-amber-400 mt-1">
                    {adminDashboardData?.metrics?.pendingLeaveRequests || 0}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Today Present</span>
                  <h2 className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {adminDashboardData?.metrics?.attendanceSummary?.PRESENT || 0}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Leave Approval Queue */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Leave Approval Queue</span>
                </h3>
                <Link href="/leave" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                  <span>View All Queue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {adminDashboardData?.leaveApprovalQueue?.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No pending leave requests requiring approval.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {adminDashboardData?.leaveApprovalQueue?.map((req: any) => (
                    <div key={req.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">
                          {req.employee?.employeeId || 'Employee'} — <span className="text-indigo-400">{req.type} Leave</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* EMPLOYEE DASHBOARD VIEW */
          <div className="space-y-6">
            {/* Quick Access Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/attendance">
                <motion.div whileHover={{ scale: 1.02 }} className="glass-panel-interactive p-4 rounded-2xl space-y-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Attendance</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Check-in / Check-out</p>
                  </div>
                </motion.div>
              </Link>

              <Link href="/leave">
                <motion.div whileHover={{ scale: 1.02 }} className="glass-panel-interactive p-4 rounded-2xl space-y-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Leave Requests</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Apply for time-off</p>
                  </div>
                </motion.div>
              </Link>

              <Link href="/payroll">
                <motion.div whileHover={{ scale: 1.02 }} className="glass-panel-interactive p-4 rounded-2xl space-y-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Payslips</h4>
                    <p className="text-xs text-slate-400 mt-0.5">View & Download</p>
                  </div>
                </motion.div>
              </Link>

              <Link href="/profile">
                <motion.div whileHover={{ scale: 1.02 }} className="glass-panel-interactive p-4 rounded-2xl space-y-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">My Profile</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Job details & docs</p>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Leave Balance Visual Gauges */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100">Visual Leave Balance Gauges</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LeaveGauge label="Paid Leave" used={employeeDashboardData?.leaveBalance?.paidUsed || 2} total={18} pending={0} color="indigo" />
                <LeaveGauge label="Sick Leave" used={employeeDashboardData?.leaveBalance?.sickUsed || 1} total={12} pending={0} color="emerald" />
                <LeaveGauge label="Unpaid Leave" used={employeeDashboardData?.leaveBalance?.unpaidUsed || 0} total={30} pending={0} color="amber" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
