'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LeaveTypeGaugeProps {
  label: string;
  used: number;
  total: number;
  pending: number;
  color: 'indigo' | 'emerald' | 'amber';
}

export function LeaveGauge({ label, used, total, pending, color }: LeaveTypeGaugeProps) {
  const percentage = Math.min(Math.round((used / total) * 100), 100);
  const remaining = total - used;

  const colorStyles = {
    indigo: {
      bar: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30',
      text: 'text-indigo-400',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      ring: 'border-indigo-500/40',
    },
    emerald: {
      bar: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      ring: 'border-emerald-500/40',
    },
    amber: {
      bar: 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-400 shadow-lg shadow-amber-500/30',
      text: 'text-amber-400',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      ring: 'border-amber-500/40',
    },
  }[color];

  return (
    <div className={`bg-slate-900/80 border ${colorStyles.ring} rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all`}>
      {/* Background Subtle Mesh Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">{label}</span>
        </div>
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${colorStyles.badge}`}>
          {remaining} Days Remaining
        </span>
      </div>

      {/* Visual Bar */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className={`h-full rounded-full ${colorStyles.bar}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5">
          <span>Used: <strong className="text-white">{used}</strong> / {total} days ({percentage}%)</span>
          {pending > 0 ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {pending} Pending
            </span>
          ) : (
            <span className="text-slate-500">No pending</span>
          )}
        </div>
      </div>
    </div>
  );
}
