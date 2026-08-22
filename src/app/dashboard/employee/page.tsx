'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { DayRail } from '@/components/DayRail';
import { LeaveGauge } from '@/components/LeaveGauge';
import {
  UserCheck, Clock, FileText, User, ArrowUpRight, Plus,
  Calendar, CheckCircle2, ShieldAlert, Zap, X, TrendingUp,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

const EmployeeOrbScene = dynamic(() => import('@/components/3d/EmployeeOrbScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

/* ─── Live Clock ─────────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-right">
      <p className="text-2xl font-black text-white tabular-nums tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {time}
      </p>
      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{date}</p>
    </div>
  );
}

/* ─── Tactile Clock-In Button ────────────────────────────────── */
function ClockInButton({
  isCheckedIn,
  loading,
  onClick,
  checkInTime,
}: {
  isCheckedIn: boolean;
  loading: boolean;
  onClick: () => void;
  checkInTime: string | null;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 25 });
  const sy = useSpring(y, { stiffness: 200, damping: 25 });
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.15);
    y.set((e.clientY - rect.top  - rect.height / 2) * 0.15);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const color  = isCheckedIn ? '#f43f5e' : '#0D9488';
  const soft   = isCheckedIn ? '#fb7185' : '#5EEAD4';
  const label  = loading ? 'Processing…' : isCheckedIn ? 'Clock Out' : 'Clock In';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}40`,
          color: soft,
        }}>
        <div className="relative w-2 h-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          {isCheckedIn && <div className="absolute inset-0 rounded-full animate-ping-soft" style={{ background: color }} />}
        </div>
        {isCheckedIn ? `ON DUTY · In at ${checkInTime}` : 'NOT CHECKED IN'}
      </div>

      {/* Big tactile button */}
      <div className="relative">
        {/* Pulse rings */}
        {isCheckedIn && [0, 1, 2].map((i) => (
          <div key={i} className="absolute rounded-full border-2 inset-0 m-auto"
            style={{
              borderColor: `${color}40`,
              width: `${100 + i * 36}%`,
              height: `${100 + i * 36}%`,
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              animation: `pulse-ring 2s ${i * 0.5}s cubic-bezier(0,0,0.2,1) infinite`,
            }} />
        ))}

        <motion.button
          ref={ref}
          onClick={onClick}
          disabled={loading}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ x: sx, y: sy }}
          whileTap={{ scale: 0.93 }}
          className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 font-black text-white cursor-pointer transition-shadow disabled:opacity-70"
          style={{
            background: isCheckedIn
              ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
              : 'linear-gradient(135deg, #0D9488, #0891B2)',
            boxShadow: `0 0 60px ${color}60, 0 20px 40px ${color}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
          } as any}
        >
          <UserCheck size={32} strokeWidth={2} />
          <span className="text-sm font-black tracking-wide">{label}</span>
        </motion.button>
      </div>

      <p className="text-[11px] text-slate-500 text-center max-w-[180px]">
        {isCheckedIn
          ? 'Your shift duration is being logged in real time'
          : 'Tap to record your entry timestamp for today'}
      </p>
    </div>
  );
}

/* ─── Quick Nav Card ─────────────────────────────────────────── */
function QuickCard({
  href, icon: Icon, label, sub, color, borderColor, delay,
}: {
  href: string; icon: React.ElementType; label: string; sub: string;
  color: string; borderColor: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="glass-emp p-5 rounded-2xl space-y-3 cursor-pointer transition-all"
          style={{ border: `1px solid ${borderColor}` }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}35`, boxShadow: `0 0 15px ${color}20` }}>
            <Icon size={22} style={{ color }} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              {label} <ArrowUpRight size={14} className="text-slate-500" />
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─── Leave history row ──────────────────────────────────────── */
function LeaveHistoryRow({ req, index }: { req: any; index: number }) {
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    PENDING:  { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
    APPROVED: { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
    REJECTED: { bg: 'rgba(244,63,94,0.1)',  text: '#fb7185', border: 'rgba(244,63,94,0.25)' },
  };
  const sc = statusColors[req.status] || statusColors.PENDING;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="flex items-center justify-between p-3.5 rounded-xl transition-all"
      style={{ background: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.1)' }}
      whileHover={{ background: 'rgba(13,148,136,0.09)', borderColor: 'rgba(13,148,136,0.2)' } as any}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold"
          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
          {req.type?.slice(0, 2)}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">{req.type} Leave</p>
          <p className="text-[10px] text-slate-500">
            {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
        {req.status}
      </span>
    </motion.div>
  );
}

/* ─── Apply Leave Modal ──────────────────────────────────────── */
function ApplyLeaveModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (form: any) => Promise<void>;
}) {
  const [form, setForm] = useState({ type: 'PAID', startDate: '', endDate: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    setForm({ type: 'PAID', startDate: '', endDate: '', remarks: '' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-3xl p-6 space-y-5"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              background: 'rgba(4, 14, 14, 0.95)',
              border: '1px solid rgba(13,148,136,0.3)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 40px 100px -20px rgba(13,148,136,0.4)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Apply for Time-Off</h3>
                <p className="text-xs text-slate-400 mt-0.5">Submit a leave request for HR review</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Leave type */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Leave Type
                </label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none cursor-pointer"
                  style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.25)', color: '#e2e8f0' }}>
                  <option value="PAID">Paid Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                {[{ label: 'Start Date', key: 'startDate' }, { label: 'End Date', key: 'endDate' }].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">{label}</label>
                    <input type="date"
                      value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required
                      className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                      style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.25)', color: '#e2e8f0' }}
                    />
                  </div>
                ))}
              </div>

              {/* Remarks */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Remarks (Optional)</label>
                <textarea value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  rows={3}
                  placeholder="Reason for leave…"
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
                  style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.25)', color: '#e2e8f0' }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #0D9488, #0891B2)',
                  boxShadow: '0 0 30px rgba(13,148,136,0.4)',
                }}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Plus size={16} /> Submit Leave Request</>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Employee Dashboard ────────────────────────────────── */
export default function EmployeeDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employee/dashboard');
      if (res.ok) setDashboardData(await res.json());
    } catch (err) {
      console.error('Error loading employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCheckInToggle = async () => {
    setCheckInLoading(true);
    try {
      const isIn = dashboardData?.todayAttendance?.checkIn && !dashboardData?.todayAttendance?.checkOut;
      await fetch(isIn ? '/api/attendance/check-out' : '/api/attendance/check-in', { method: 'POST' });
      await loadData();
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleApplyLeave = async (form: any) => {
    const res = await fetch('/api/leave/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowApplyModal(false);
      await loadData();
    }
  };

  const isCheckedIn = dashboardData?.todayAttendance?.checkIn && !dashboardData?.todayAttendance?.checkOut;
  const checkInTime = dashboardData?.todayAttendance?.checkIn
    ? new Date(dashboardData.todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  const name = session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0] || 'Team Member';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: 'var(--emp-bg-deep)' }}>
      <Navbar />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSubmit={handleApplyLeave}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Cinematic Header with 3D Employee Scene ───────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl relative overflow-hidden glass-emp"
          style={{ minHeight: '280px', border: '1px solid rgba(13,148,136,0.25)' }}
        >
          {/* 3D Scene */}
          <div className="absolute inset-0">
            <EmployeeOrbScene />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(4,14,14,0.93) 0%, rgba(4,14,14,0.6) 50%, transparent 100%)' }} />

          {/* Content */}
          <div className="relative z-10 p-8 flex flex-col justify-between h-full" style={{ minHeight: '280px' }}>
            <div className="space-y-2 flex-1">
              <motion.div className="flex items-center gap-2" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#5EEAD4' }}>
                  Employee Self-Service Portal
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping-soft" />
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl font-black text-white tracking-tight"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                My Flow,{' '}
                <span className="text-gradient-teal">{name}</span>
              </motion.h1>

              <motion.p
                className="text-xs text-slate-400 max-w-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Attendance log, leave quotas, payslips, and personal requests — all in one place.
              </motion.p>
            </div>

            {/* Live clock + CTA */}
            <motion.div
              className="flex items-end justify-between mt-6 flex-wrap gap-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <LiveClock />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowApplyModal(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all text-white cursor-pointer"
                style={{
                  background: 'rgba(13,148,136,0.2)',
                  border: '1px solid rgba(13,148,136,0.35)',
                  color: '#5EEAD4',
                }}
              >
                <Plus size={15} /> Apply for Time-Off
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Day Rail ────────────────────────────────────── */}
        <DayRail attendanceStatus={isCheckedIn ? 'PRESENT' : 'ABSENT'} onCheckInClick={handleCheckInToggle} />

        {/* ── Loading Skeletons ─────────────────────────────── */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-56 rounded-3xl skeleton-shimmer" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />)}
            </div>
            <div className="h-64 rounded-2xl skeleton-shimmer" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Clock-In Widget ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-emp rounded-3xl p-8 relative overflow-hidden"
              style={{ border: '1px solid rgba(13,148,136,0.2)' }}
            >
              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                {/* Left — status text */}
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-[11px] uppercase font-bold tracking-widest" style={{ color: '#5EEAD4' }}>
                    Today&apos;s Attendance
                  </p>
                  <h3 className="text-2xl font-black text-white">
                    {isCheckedIn ? `In since ${checkInTime}` : 'Ready to begin your workday?'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {isCheckedIn
                      ? 'Your shift duration is being logged in real time.'
                      : 'Tap the clock to record your entry timestamp.'}
                  </p>
                </div>

                {/* Center — big tactile clock-in button */}
                <div className="flex items-center justify-center flex-1">
                  <ClockInButton
                    isCheckedIn={!!isCheckedIn}
                    loading={checkInLoading}
                    onClick={handleCheckInToggle}
                    checkInTime={checkInTime}
                  />
                </div>

                {/* Right — stats */}
                <div className="hidden md:flex flex-col gap-3 text-right">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">This Month</p>
                    <p className="text-2xl font-black text-white">{dashboardData?.monthStats?.present || 0}</p>
                    <p className="text-[11px] text-teal-400 font-medium">Days Present</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{dashboardData?.monthStats?.leaves || 0}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Days on Leave</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Quick Nav Cards ─────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickCard href="/attendance" icon={UserCheck} label="Attendance"    sub="Clock logs & records"  color="#0D9488" borderColor="rgba(13,148,136,0.2)"  delay={0.05} />
              <QuickCard href="/leave"      icon={Clock}      label="Leave Quotas" sub="Apply for time-off"   color="#a855f7" borderColor="rgba(168,85,247,0.2)"  delay={0.12} />
              <QuickCard href="/payroll"    icon={FileText}   label="My Payslips"  sub="Salary & download PDF" color="#3b82f6" borderColor="rgba(59,130,246,0.2)" delay={0.19} />
              <QuickCard href="/profile"    icon={User}       label="My Profile"   sub="Personal info & docs"  color="#f59e0b" borderColor="rgba(245,158,11,0.2)" delay={0.26} />
            </div>

            {/* ── Leave Gauges ────────────────────────────────── */}
            {dashboardData?.leaveBalance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <LeaveGauge leaveBalance={dashboardData.leaveBalance} />
              </motion.div>
            )}

            {/* ── Leave History ────────────────────────────────── */}
            {dashboardData?.leaveHistory?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-emp rounded-2xl p-6 space-y-4"
                style={{ border: '1px solid rgba(13,148,136,0.15)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <h3 className="text-base font-bold text-white">Leave History</h3>
                  </div>
                  <Link href="/leave" className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{ color: '#5EEAD4' }}>
                    View All <ArrowUpRight size={13} />
                  </Link>
                </div>
                <div className="space-y-2">
                  {dashboardData.leaveHistory.slice(0, 5).map((req: any, i: number) => (
                    <LeaveHistoryRow key={req.id} req={req} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
