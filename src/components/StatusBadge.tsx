'use client';

import React from 'react';
import { CheckCircle2, XCircle, Clock, Calendar, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PRESENT':
      case 'APPROVED':
        return {
          label: status === 'PRESENT' ? 'Present' : 'Approved',
          className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
        };
      case 'ABSENT':
      case 'REJECTED':
        return {
          label: status === 'ABSENT' ? 'Absent' : 'Rejected',
          className: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
          dot: 'bg-rose-400',
          icon: XCircle,
        };
      case 'HALF_DAY':
        return {
          label: 'Half Day',
          className: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10',
          dot: 'bg-amber-400',
          icon: Clock,
        };
      case 'LEAVE':
        return {
          label: 'On Leave',
          className: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-500/10',
          dot: 'bg-purple-400',
          icon: Calendar,
        };
      case 'PENDING':
      default:
        return {
          label: 'Pending',
          className: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/10',
          dot: 'bg-indigo-400',
          icon: AlertCircle,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}

