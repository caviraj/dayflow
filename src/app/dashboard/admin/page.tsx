'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  motion, AnimatePresence, useMotionValue, useSpring, useTransform,
} from 'framer-motion';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { DayRail } from '@/components/DayRail';
import { ViewingAsBanner } from '@/components/ViewingAsBanner';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkforceAnalyticsChart } from '@/components/WorkforceAnalyticsChart';
import {
  Users, Clock, CheckCircle2, ChevronRight, UserCog,
  Sparkles, ArrowUpRight, TrendingUp, ShieldCheck,
  Activity, Calendar, BarChart3, Zap,
} from 'lucide-react';
import Link from 'next/link';

const AdminOrbScene = dynamic(() => import('@/components/3d/AdminOrbScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

/* ─── Animated counter ──────────────────────────────────────── */
function AnimatedCounter({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);
  return <span style={{ color }}>{display}</span>;
}

/* ─── Tilt KPI card ─────────────────────────────────────────── */
function TiltCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 25 });
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 25 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width  - 0.5;
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;
    rotX.set(-ny * 10);
    rotY.set(nx * 10);
  };
  const onLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        ...style,
        rotateX: sRotX,
        rotateY: sRotY,
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── KPI Card ──────────────────────────────────────────────── */
function KPICard({
  label, value, sub, icon: Icon, color, borderColor, bgColor, delay,
}: {
  label: string; value: number; sub: string;
  icon: React.ElementType; color: string;
  borderColor: string; bgColor: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <TiltCard
        className="glass-hr p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group cursor-default"
        style={{ border: `1px solid ${borderColor}` }}
      >
        {/* Glow blob */}
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-150"
          style={{ background: `${color}18` }} />
        <div>
          <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color }}>{label}</span>
          <h2 className="text-4xl font-black text-white mt-1 tracking-tight">
            <AnimatedCounter value={value} color={color} />
          </h2>
          <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
            <TrendingUp size={11} style={{ color }} />
            {sub}
          </span>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: bgColor, border: `1px solid ${borderColor}`, boxShadow: `0 0 20px ${color}20` }}>
          <Icon size={26} style={{ color }} />
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ─── Leave row ─────────────────────────────────────────────── */
function LeaveRow({ req, index }: { req: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all group"
      style={{
        background: 'rgba(124,58,237,0.05)',
        border: '1px solid rgba(124,58,237,0.12)',
      }}
      whileHover={{
        background: 'rgba(124,58,237,0.1)',
        borderColor: 'rgba(124,58,237,0.3)',
        x: 4,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 font-bold text-xs"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', borderColor: 'rgba(124,58,237,0.3)' }}>
          {req.employee?.employeeId?.slice(-3) || 'EMP'}
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
            <span>{req.employee?.employeeId || 'Employee'}</span>
            <span className="text-slate-600">•</span>
            <span style={{ color: '#A78BFA' }} className="font-semibold">{req.type} Leave</span>
          </p>
          <p className="text-[11px] text-slate-400">
            {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <StatusBadge status={req.status} />
        <Link href="/leave"
          className="text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all"
          style={{ background: 'rgba(124,58,237,0.2)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.3)' }}>
          Review <ArrowUpRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Main Admin Dashboard ──────────────────────────────────── */
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
        const [dashRes, empRes] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/employees'),
        ]);
        if (dashRes.ok) setAdminDashboardData(await dashRes.json());
        if (empRes.ok) { const d = await empRes.json(); setEmployeeList(d.data || []); }
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const totalEmployees = adminDashboardData?.metrics?.totalEmployees || 18;
  const pendingLeave   = adminDashboardData?.metrics?.pendingLeaveRequests || 0;
  const presentCount   = adminDashboardData?.metrics?.attendanceSummary?.PRESENT || 0;
  const name           = session?.user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: 'var(--hr-bg-deep)' }}>
      {viewingAsEmployee && (
        <ViewingAsBanner
          employeeName={viewingAsEmployee.name}
          employeeId={viewingAsEmployee.id}
          onClear={() => setViewingAsEmployee(null)}
        />
      )}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Cinematic Header with 3D Scene ──────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl relative overflow-hidden glass-hr"
          style={{
            minHeight: '280px',
            border: '1px solid rgba(124,58,237,0.25)',
          }}
        >
          {/* 3D Scene backdrop */}
          <div className="absolute inset-0">
            <AdminOrbScene />
          </div>

          {/* Gradient overlay to ensure text readability */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(10,4,28,0.92) 0%, rgba(10,4,28,0.6) 50%, transparent 100%)' }} />

          {/* Text content */}
          <div className="relative z-10 p-8 flex flex-col justify-between h-full" style={{ minHeight: '280px' }}>
            <div className="space-y-2">
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#A78BFA' }}>
                  HR & Administrative Control Center
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping-soft" />
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Command Nexus,{' '}
                <span className="text-gradient-violet">{name}</span>
              </motion.h1>

              <motion.p
                className="text-xs text-slate-400 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Organization roster oversight, workforce analytics, pending approvals, and context preview.
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-3 mt-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Link href="/reports"
                className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                style={{ background: 'rgba(124,58,237,0.2)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.35)' }}>
                <BarChart3 size={15} />
                Full Analytics
              </Link>
              <Link href="/attendance"
                className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Activity size={15} />
                Attendance
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Day Rail ────────────────────────────────────── */}
        <DayRail pendingApprovalsCount={pendingLeave} />

        {/* ── Context Switcher ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-hr rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.3)' }}>
              <UserCog size={20} style={{ color: '#A78BFA' }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Admin Context Switcher</p>
              <p className="text-[11px] text-slate-400">Preview employee self-service view</p>
            </div>
          </div>
          <select
            value={viewingAsEmployee?.id || ''}
            onChange={(e) => {
              const sel = employeeList.find((emp) => emp.id === e.target.value);
              setViewingAsEmployee(sel ? { id: sel.id, name: sel.employeeId || sel.user?.email || 'Employee' } : null);
            }}
            className="rounded-xl text-xs py-2.5 px-4 font-medium focus:outline-none cursor-pointer w-full sm:w-auto"
            style={{
              background: 'rgba(10,4,28,0.8)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#e2e8f0',
            }}
          >
            <option value="">Default Admin Control View</option>
            {employeeList.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employeeId} — {emp.department} ({emp.user?.email})
              </option>
            ))}
          </select>
        </motion.div>

        {/* ── Loading Skeletons ─────────────────────────────── */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
            <div className="h-72 rounded-2xl skeleton-shimmer" />
            <div className="h-64 rounded-2xl skeleton-shimmer" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* ── KPI Grid ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard
                label="Total Active Staff"
                value={totalEmployees}
                sub="Real-time organization roster"
                icon={Users}
                color="#7C3AED"
                borderColor="rgba(124,58,237,0.3)"
                bgColor="rgba(124,58,237,0.12)"
                delay={0.05}
              />
              <KPICard
                label="Pending Leave Requests"
                value={pendingLeave}
                sub={pendingLeave > 0 ? 'Action required in queue' : 'Queue is clear'}
                icon={ShieldCheck}
                color="#f59e0b"
                borderColor="rgba(245,158,11,0.3)"
                bgColor="rgba(245,158,11,0.1)"
                delay={0.15}
              />
              <KPICard
                label="Today Checked In"
                value={presentCount}
                sub="Live office & remote presence"
                icon={CheckCircle2}
                color="#10b981"
                borderColor="rgba(16,185,129,0.3)"
                bgColor="rgba(16,185,129,0.1)"
                delay={0.25}
              />
            </div>

            {/* ── Workforce Analytics ─────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <WorkforceAnalyticsChart
                presentCount={presentCount}
                totalCount={totalEmployees}
                pendingLeaveCount={pendingLeave}
              />
            </motion.div>

            {/* ── Leave Approval Queue ─────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-hr rounded-2xl p-6 space-y-5"
              style={{ border: '1px solid rgba(124,58,237,0.15)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                    {pendingLeave > 0 && (
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping-soft" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">Leave Approval Queue</h3>
                  {pendingLeave > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.25)', color: '#A78BFA' }}>
                      {pendingLeave} pending
                    </span>
                  )}
                </div>
                <Link href="/leave"
                  className="text-xs font-semibold flex items-center gap-1 group transition-colors"
                  style={{ color: '#A78BFA' }}>
                  Open Approval Portal
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {!adminDashboardData?.leaveApprovalQueue?.length ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-14 rounded-2xl"
                  style={{ background: 'rgba(124,58,237,0.05)', border: '1px dashed rgba(124,58,237,0.2)' }}
                >
                  <Sparkles size={32} style={{ color: '#7C3AED' }} className="mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-bold text-white">Queue is completely clear!</p>
                  <p className="text-xs text-slate-500 mt-1">No pending leave requests requiring review.</p>
                </motion.div>
              ) : (
                <div className="space-y-2.5">
                  {adminDashboardData.leaveApprovalQueue.map((req: any, i: number) => (
                    <LeaveRow key={req.id} req={req} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
