'use client';

import React, { useState, Suspense, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  Lock, Mail, AlertCircle, ArrowRight, CheckCircle2,
  Sparkles, ShieldCheck, Users, Eye, EyeOff, Zap,
} from 'lucide-react';
import { RoleTransitionOverlay } from '@/components/RoleTransitionOverlay';

/* ─── Animated input field ──────────────────────────────────── */
function FormInput({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  accentColor,
  showToggle,
  onToggle,
  showValue,
}: {
  icon: React.ElementType;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  accentColor: string;
  showToggle?: boolean;
  onToggle?: () => void;
  showValue?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      {/* Floating label */}
      <motion.label
        animate={{
          y: focused || hasValue ? -22 : 0,
          scale: focused || hasValue ? 0.82 : 1,
          color: focused ? accentColor : 'rgba(148,163,184,1)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute left-12 top-3.5 text-xs font-semibold pointer-events-none origin-left z-10"
        style={{ color: 'rgba(148,163,184,1)' }}
      >
        {label}
      </motion.label>

      {/* Icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
        <Icon
          size={17}
          style={{ color: focused ? accentColor : 'rgba(100,116,139,1)' }}
          className="transition-colors duration-200"
        />
      </div>

      {/* Input */}
      <input
        type={showToggle ? (showValue ? 'text' : 'password') : type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={focused || hasValue ? placeholder : ''}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-white/5 border rounded-xl pt-5 pb-2 pl-11 pr-11 text-sm text-slate-100 font-medium placeholder:text-slate-600 focus:outline-none transition-all duration-200"
        style={{
          borderColor: focused ? accentColor + '80' : 'rgba(51,65,85,0.8)',
          boxShadow: focused
            ? `0 0 0 3px ${accentColor}18, 0 0 20px ${accentColor}12`
            : 'none',
          background: focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        }}
      />

      {/* Password toggle */}
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}

      {/* Focus glow line */}
      <motion.div
        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full origin-center"
        style={{ background: accentColor }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />
    </div>
  );
}

/* ─── Magnetic CTA Button ────────────────────────────────────── */
function MagneticButton({
  children,
  loading,
  accentColor,
  gradientClass,
}: {
  children: React.ReactNode;
  loading: boolean;
  accentColor: string;
  gradientClass: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    x.set((e.clientX - cx) * 0.18);
    y.set((e.clientY - cy) * 0.18);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      type="submit"
      disabled={loading}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.97 }}
      className={`w-full text-white font-bold py-4 px-4 rounded-xl shadow-xl flex items-center justify-center gap-2.5 transition-shadow disabled:opacity-50 text-sm relative overflow-hidden cursor-pointer ${gradientClass}`}
    >
      {/* Shine sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}

/* ─── Feature badge ──────────────────────────────────────────── */
function FeatureBadge({ icon: Icon, text, delay }: { icon: React.ElementType; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-2.5 p-2.5 rounded-xl"
      style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.2)' }}>
        <Icon size={14} style={{ color: '#A78BFA' }} />
      </div>
      <span className="text-[11px] text-slate-400 font-medium">{text}</span>
    </motion.div>
  );
}

/* ─── Main Sign-In Form ──────────────────────────────────────── */
function SignInContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const registered  = searchParams.get('registered') === 'true';

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [detectedRole, setDetectedRole] = useState<'ADMIN' | 'EMPLOYEE' | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const pendingUrl = useRef<string>('');

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    router.push(pendingUrl.current);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', { redirect: false, email, password });

      if (res?.error) {
        setError(
          res.error === 'CredentialsSignin'
            ? 'Invalid email or password. Please verify your credentials.'
            : res.error || 'Authentication failed. Please try again.',
        );
        setLoading(false);
      } else if (res?.ok) {
        const sessionRes = await fetch('/api/profile/me');
        if (sessionRes.ok) {
          const profile = await sessionRes.json();
          const role    = profile.user?.role as 'ADMIN' | 'EMPLOYEE';
          const target  = role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/employee';
          pendingUrl.current = callbackUrl || target;
          setDetectedRole(role);
          setShowTransition(true);
          router.refresh();
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Role Cinematic Transition */}
      {detectedRole && (
        <RoleTransitionOverlay
          role={detectedRole}
          visible={showTransition}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Main Card */}
      <motion.div
        className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 relative z-10"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(10, 5, 25, 0.85)',
          border: '1px solid rgba(124,58,237,0.25)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 40px 120px -20px rgba(124,58,237,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* ── Left Column — Brand Showcase ───────────────────── */}
        <div className="p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(20,5,50,0.9) 0%, rgba(10,4,30,0.95) 100%)' }}>

          {/* Glow orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

          <div className="space-y-6 relative z-10">
            {/* Logo */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <Link href="/" className="flex items-center gap-3 group w-fit">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg relative"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
                  <span className="font-black text-white text-xl tracking-tighter">D</span>
                  <div className="absolute inset-0 rounded-2xl border border-violet-400/30" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-white tracking-tight group-hover:text-violet-300 transition-colors">
                      Dayflow
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                      Pro
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block -mt-0.5 font-medium">HR Alignment Engine</span>
                </div>
              </Link>
            </motion.div>

            <motion.div className="space-y-3 pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#A78BFA' }}>
                Welcome Back
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                Every workday,<br />
                <span className="text-gradient-violet">perfectly aligned.</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access your real-time attendance, leave quotas, payroll, and role-scoped HR controls.
              </p>
            </motion.div>
          </div>

          {/* Feature badges */}
          <div className="pt-8 space-y-2 relative z-10">
            <FeatureBadge icon={ShieldCheck} text="Role-based access — auto-redirect after login" delay={0.35} />
            <FeatureBadge icon={Zap}         text="Real-time attendance & live clock-in tracking"  delay={0.45} />
            <FeatureBadge icon={Users}        text="HR command center & employee self-service"       delay={0.55} />
          </div>
        </div>

        {/* ── Right Column — Form ─────────────────────────────── */}
        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6"
          style={{ background: 'rgba(8, 4, 20, 0.6)' }}>

          <motion.div className="space-y-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-xl font-black text-white">Sign In</h3>
            <p className="text-xs text-slate-500">Enter your work credentials to continue</p>
          </motion.div>

          {/* Success banner */}
          <AnimatePresence>
            {registered && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="p-3.5 rounded-xl flex items-start gap-3 text-xs"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-300">Registration Successful!</p>
                  <p className="text-emerald-400/70 mt-0.5">You can now sign in with your email & password.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="p-3.5 rounded-xl flex items-start gap-3 text-xs"
                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}
              >
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="font-medium text-rose-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FormInput
              icon={Mail}
              label="Work Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              accentColor="#7C3AED"
            />
            <FormInput
              icon={Lock}
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              accentColor="#7C3AED"
              showToggle
              onToggle={() => setShowPass(!showPass)}
              showValue={showPass}
            />

            <MagneticButton
              loading={loading}
              accentColor="#7C3AED"
              gradientClass="bg-gradient-to-r from-violet-700 via-indigo-600 to-violet-700 hover:from-violet-600 hover:to-indigo-600"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight size={16} />
            </MagneticButton>
          </motion.form>

          {/* Footer link */}
          <motion.p
            className="text-center text-xs text-slate-500 pt-2 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold transition-colors hover:opacity-80" style={{ color: '#A78BFA' }}>
              Register Account
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Page Wrapper ───────────────────────────────────────────── */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#06010f]">
      {/* Aurora glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 65%)', filter: 'blur(50px)' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-100" />

      <Suspense fallback={
        <div className="text-slate-500 text-xs flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          Loading authentication…
        </div>
      }>
        <SignInContent />
      </Suspense>
    </div>
  );
}
