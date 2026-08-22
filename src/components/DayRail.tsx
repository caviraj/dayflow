'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

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
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 glow-emerald',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
        };
      case 'HALF_DAY':
        return {
          label: 'Half-Day',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: Clock,
        };
      case 'LEAVE':
        return {
          label: 'On Leave',
          color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400',
          icon: Calendar,
        };
      case 'ABSENT':
      default:
        return {
          label: 'Not Checked In',
          color: 'bg-rose-500/15 text-rose-300 border-rose-500/30 glow-rose',
          dot: 'bg-rose-400',
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-2xl p-4.5 mb-8 shadow-2xl relative overflow-hidden border border-indigo-500/30 backdrop-blur-xl"
    >
      {/* Background Accent Mesh */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
        {/* Today's Alignment Banner */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                The Day Rail
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[10px] text-slate-400 font-medium">Real-Time Alignment</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
              Today&apos;s Workday Pulse
            </h3>
          </div>
        </div>

        {/* Quick Rail Indicators */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Attendance Indicator */}
          <div className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-all ${statusInfo.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-ping`} />
            <StatusIcon className="w-4 h-4" />
            <span>{statusInfo.label}</span>
          </div>

          {/* Pending Approvals */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50" />
            <span>
              <strong className="text-white font-bold">{pendingApprovalsCount}</strong> Pending Requests
            </span>
          </div>

          {/* Next Holiday */}
          {nextHoliday && (
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5 shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>
                Next: <strong className="text-white font-bold">{nextHoliday.name}</strong> ({nextHoliday.date})
              </span>
            </div>
          )}

          {/* Quick Action Button */}
          {onCheckInClick && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onCheckInClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/30 ml-auto lg:ml-0 border border-indigo-400/30"
            >
              <UserCheck className="w-4 h-4" />
              <span>Check In / Out</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

