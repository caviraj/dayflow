'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { CalendarCheck, Clock, UserCheck, Filter, Calendar as CalendarIcon, CheckCircle2, LogOut } from 'lucide-react';

export default function AttendancePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || 'EMPLOYEE';

  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [activeCheckInId, setActiveCheckInId] = useState<string | null>(null);
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

        // Check today's status
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = (data.data || []).find((r: any) =>
          new Date(r.date).toISOString().startsWith(todayStr)
        );

        if (todayRecord) {
          setCheckedInToday(!!todayRecord.checkIn && !todayRecord.checkOut);
          setActiveCheckInId(todayRecord.id);
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Attendance Banner & Action Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Attendance Tracker</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time check-in, check-out, and workday history.
              </p>
            </div>
          </div>

          {/* Interactive Action Button */}
          <div className="flex items-center gap-3">
            {!checkedInToday ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{actionLoading ? 'Processing...' : 'Clock In Now'}</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{actionLoading ? 'Processing...' : 'Clock Out Now'}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Attendance Records</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl text-xs py-2 px-3 text-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-slate-500 text-xs">to</span>
            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl text-xs py-2 px-3 text-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200">
            Recent Attendance Logs ({attendanceRecords.length})
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading records...
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No attendance records found for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Date</th>
                    {role === 'ADMIN' && <th className="px-6 py-3.5 font-semibold">Employee ID</th>}
                    <th className="px-6 py-3.5 font-semibold">Clock In</th>
                    <th className="px-6 py-3.5 font-semibold">Clock Out</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {new Date(record.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      {role === 'ADMIN' && (
                        <td className="px-6 py-4 font-medium text-indigo-300">
                          {record.employee?.employeeId || 'EMP-000'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-300">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
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
