'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
      bar: 'bg-indigo-500',
      text: 'text-indigo-400',
      badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    },
    emerald: {
      bar: 'bg-emerald-500',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    amber: {
      bar: 'bg-amber-500',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
  }[color];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorStyles.badge}`}>
          {remaining} Days Left
        </span>
      </div>

      {/* Visual Bar */}
      <div className="space-y-1">
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${colorStyles.bar}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Used: {used} / {total} days</span>
          {pending > 0 && <span className="text-amber-400 font-medium">{pending} Pending</span>}
        </div>
      </div>
    </div>
  );
}
