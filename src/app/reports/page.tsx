'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import {
  BarChart3,
  Download,
  CalendarCheck,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ReportsPage() {
  const attendanceData = [
    { day: 'Mon', Present: 42, Absent: 3, Leave: 5 },
    { day: 'Tue', Present: 45, Absent: 2, Leave: 3 },
    { day: 'Wed', Present: 48, Absent: 1, Leave: 1 },
    { day: 'Thu', Present: 44, Absent: 4, Leave: 2 },
    { day: 'Fri', Present: 40, Absent: 5, Leave: 5 },
  ];

  const leaveUtilizationData = [
    { name: 'Paid Leave', value: 65, color: '#6366f1' },
    { name: 'Sick Leave', value: 25, color: '#10b981' },
    { name: 'Unpaid Leave', value: 10, color: '#f59e0b' },
  ];

  const handleExportAttendance = () => {
    window.open('/api/reports/attendance', '_blank');
  };

  const handleExportPayroll = () => {
    window.open('/api/reports/payroll', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 shrink-0 border border-indigo-400/30">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                  Analytics & Intelligence
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              </div>
              <h1 className="text-xl font-black text-slate-100 mt-0.5">HR Analytics & Export Center</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Attendance trends, leave utilization breakdown, and exportable CSV reports.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportAttendance}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Attendance CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportPayroll}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Payroll CSV</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend Bar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Weekly Attendance Trends</h3>
              </div>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 92% Average
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="Present" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Absent" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Leave" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Leave Utilization Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100">Leave Utilization Breakdown</h3>
              </div>
              <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-semibold">
                YTD 2026
              </span>
            </div>

            <div className="h-64 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveUtilizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {leaveUtilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      color: '#f8fafc',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-300 pt-2 font-medium">
              {leaveUtilizationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>
                    {item.name} <strong className="text-white">({item.value}%)</strong>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

