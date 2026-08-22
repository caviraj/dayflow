'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { CalendarCheck, Clock, UserCheck, Filter, LogOut, Sparkles, AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || 'EMPLOYEE';

  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterUserId, setFilterUserId] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let query = '/api/attendance?limit=50';
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;
      if (filterUserId && role === 'ADMIN') query += `&userId=${filterUserId}`;

      const res = await fetch(query);
      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(data.data || []);

        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = (data.data || []).find((r: any) =>
          new Date(r.date).toISOString().startsWith(todayStr)
        );

        if (todayRecord) {
          setCheckedInToday(!!todayRecord.checkIn && !todayRecord.checkOut);
        }
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate, filterUserId]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/attendance/check-in', { method: 'POST' });
      if (res.ok) {
        await fetchAttendance();
      }
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/attendance/check-out', { method: 'POST' });
      if (res.ok) {
        await fetchAttendance();
      }
    } catch (err) {
      console.error('Check-out error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Attendance Banner & Clock In Action Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 sm:p-7 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4.5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 shrink-0 border border-emerald-400/30">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Time & Presence Engine
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h1 className="text-xl font-black text-slate-100 mt-0.5">Attendance Tracker</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time clock-in, clock-out, and daily workday verification log.
              </p>
            </div>
          </div>

          {/* Interactive Clock Button */}
          <div className="relative z-10 w-full md:w-auto flex justify-center">
            {!checkedInToday ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all disabled:opacity-50 border border-emerald-400/40"
              >
                <UserCheck className="w-4.5 h-4.5" />
                <span>{actionLoading ? 'Verifying...' : 'Clock In Now'}</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/30 transition-all disabled:opacity-50 border border-amber-400/40"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>{actionLoading ? 'Verifying...' : 'Clock Out Now'}</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Filter Toolbar */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Attendance Logs</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs py-2 px-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs py-2 px-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 font-bold text-sm text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Recent Workday Logs</span>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-semibold">
              {attendanceRecords.length} Entries
            </span>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto opacity-50" />
              <p className="font-semibold text-slate-300">No attendance logs match your filters.</p>
              <p className="text-xs text-slate-500">Clock in today or adjust your date filter above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Date</th>
                    {role === 'ADMIN' && <th className="px-6 py-4 font-bold">Employee ID</th>}
                    <th className="px-6 py-4 font-bold">Clock In</th>
                    <th className="px-6 py-4 font-bold">Clock Out</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-100">
                        {new Date(record.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      {role === 'ADMIN' && (
                        <td className="px-6 py-4 font-semibold text-purple-300">
                          {record.employee?.employeeId || 'EMP-000'}
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium text-emerald-400">
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 font-medium text-amber-400">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

