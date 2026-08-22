'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, AlertCircle, Sparkles, ChevronRight, UserCheck } from 'lucide-react';

interface DayRailProps {
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | null;
  pendingApprovalsCount?: number;
  nextHoliday?: { name: string; date: string } | null;
  onCheckInClick?: () => void;
}

export function DayRail({
  attendanceStatus = 'PRESENT',
  pendingApprovalsCount = 3,
  nextHoliday = { name: 'Labor Day', date: 'Sep 1, 2026' },
  onCheckInClick,
}: DayRailProps) {
  const getStatusBadge = () => {
    switch (attendanceStatus) {
      case 'PRESENT':
        return {
          label: 'Checked In',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
        };
      case 'HALF_DAY':
        return {
          label: 'Half-Day',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: Clock,
        };
      case 'LEAVE':
        return {
          label: 'On Leave',
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          icon: Calendar,
        };
      case 'ABSENT':
      default:
        return {
          label: 'Not Checked In',
          color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 shadow-lg relative overflow-hidden border border-indigo-500/20">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Today's Alignment Banner */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
              The Day Rail
            </span>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Today&apos;s Workday Status
            </h3>
          </div>
        </div>

        {/* Quick Rail Indicators */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Attendance Indicator */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${statusInfo.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{statusInfo.label}</span>
          </div>

          {/* Pending Approvals */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span><strong className="text-slate-100">{pendingApprovalsCount}</strong> Pending Requests</span>
          </div>

          {/* Next Holiday */}
          {nextHoliday && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next: <strong className="text-slate-100">{nextHoliday.name}</strong> ({nextHoliday.date})</span>
            </div>
          )}

          {/* Quick Action */}
          {onCheckInClick && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCheckInClick}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 ml-auto lg:ml-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Quick Action</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
