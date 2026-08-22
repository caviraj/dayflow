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
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
        };
      case 'ABSENT':
      case 'REJECTED':
        return {
          label: status === 'ABSENT' ? 'Absent' : 'Rejected',
          className: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: XCircle,
        };
      case 'HALF_DAY':
        return {
          label: 'Half Day',
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: Clock,
        };
      case 'LEAVE':
        return {
          label: 'On Leave',
          className: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: Calendar,
        };
      case 'PENDING':
      default:
        return {
          label: 'Pending',
          className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: AlertCircle,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
