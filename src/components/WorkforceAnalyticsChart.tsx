'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, CalendarCheck, Clock, ShieldAlert } from 'lucide-react';

interface WorkforceAnalyticsChartProps {
  presentCount?: number;
  totalCount?: number;
  pendingLeaveCount?: number;
}

export function WorkforceAnalyticsChart({
  presentCount = 12,
  totalCount = 18,
  pendingLeaveCount = 3,
}: WorkforceAnalyticsChartProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'weekly'>('attendance');

  const absentCount = Math.max(0, totalCount - presentCount - pendingLeaveCount);
  const presentPct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
  const leavePct = totalCount > 0 ? Math.round((pendingLeaveCount / totalCount) * 100) : 0;
  const absentPct = totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0;

  const weeklyData = [
    { day: 'Mon', present: 16, leave: 1, absent: 1 },
    { day: 'Tue', present: 17, leave: 1, absent: 0 },
    { day: 'Wed', present: 15, leave: 2, absent: 1 },
    { day: 'Thu', present: 18, leave: 0, absent: 0 },
    { day: 'Fri', present: 14, leave: 3, absent: 1 },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 relative overflow-hidden backdrop-blur-xl">
      {/* Ambient background light */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Tab Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Workforce Pulse & Analytics</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time daily presence distribution & weekly attendance trends
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today&apos;s Split
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'weekly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly Trend
          </button>
        </div>
      </div>

      {activeTab === 'attendance' ? (
        <div className="space-y-6">
          {/* Multi-Segment Stacked Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Staff Distribution Ratio</span>
              <span className="font-bold text-indigo-300">{presentPct}% Active Today</span>
            </div>
            <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800 gap-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${presentPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-lg shadow-emerald-500/20"
                title={`Present: ${presentCount}`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${leavePct}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full shadow-lg shadow-amber-500/20"
                title={`On Leave / Pending: ${pendingLeaveCount}`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${absentPct}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-lg shadow-rose-500/20"
                title={`Absent: ${absentCount}`}
              />
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Checked In</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">{presentCount}</span>
                  <span className="text-xs text-emerald-400 font-bold">({presentPct}%)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Pending Leave</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">{pendingLeaveCount}</span>
                  <span className="text-xs text-amber-400 font-bold">({leavePct}%)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Unaccounted / Out</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">{absentCount}</span>
                  <span className="text-xs text-rose-400 font-bold">({absentPct}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Weekly Bar Visualizer */
        <div className="space-y-4 pt-2">
          <div className="flex items-end justify-between gap-3 h-44 px-2">
            {weeklyData.map((item, idx) => {
              const maxVal = 18;
              const heightPct = Math.round((item.present / maxVal) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] text-indigo-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.present}/{maxVal}
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-900 rounded-xl overflow-hidden flex flex-col justify-end p-1 border border-slate-800 h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="w-full bg-gradient-to-t from-indigo-600 via-purple-500 to-indigo-400 rounded-lg group-hover:brightness-125 transition-all shadow-md shadow-indigo-500/20"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-400 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Average Attendance Rate: 88%
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> +4.2% vs last week
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
