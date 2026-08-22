'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import {
  BarChart3,
  Download,
  CalendarCheck,
  PieChart as PieChartIcon,
  FileSpreadsheet,
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Analytics & HR Reports</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Attendance trends, leave utilization, and exportable organization CSV reports.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportAttendance}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Attendance CSV</span>
            </button>
            <button
              onClick={handleExportPayroll}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Payroll CSV</span>
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend Bar Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-400" />
                <span>Weekly Attendance Trends</span>
              </h3>
              <span className="text-xs text-slate-400">This Week</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Leave" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Utilization Pie Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                <span>Leave Utilization Breakdown</span>
              </h3>
              <span className="text-xs text-slate-400">YTD</span>
            </div>

            <div className="h-64 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveUtilizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leaveUtilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
              {leaveUtilizationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
