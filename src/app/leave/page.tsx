'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { LeaveGauge } from '@/components/LeaveGauge';
import { StatusBadge } from '@/components/StatusBadge';
import { CalendarDays, Plus, CheckCircle2, XCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

export default function LeavePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || 'EMPLOYEE';

  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reviewModal, setReviewModal] = useState<{ id: string; action: 'APPROVE' | 'REJECT' } | null>(null);

  const [adminNotes, setAdminNotes] = useState('');
  const [applyForm, setApplyForm] = useState({
    type: 'PAID',
    startDate: '',
    endDate: '',
    remarks: '',
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leave');
      if (res.ok) {
        const data = await res.json();
        setLeaveRequests(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leave/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyForm),
      });
      if (res.ok) {
        setShowApplyModal(false);
        setApplyForm({ type: 'PAID', startDate: '', endDate: '', remarks: '' });
        await fetchLeaves();
      }
    } catch (err) {
      console.error('Error applying for leave:', err);
    }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    try {
      const res = await fetch(`/api/leave/${reviewModal.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: reviewModal.action, adminNotes }),
      });
      if (res.ok) {
        setReviewModal(null);
        setAdminNotes('');
        await fetchLeaves();
      }
    } catch (err) {
      console.error('Error reviewing leave:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header & Apply Action */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Leave & Time-Off Center</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit requests, check balances, and track approval status.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowApplyModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Time-Off</span>
          </motion.button>
        </div>

        {/* Leave Balance Visual Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LeaveGauge label="Paid Leave" used={2} total={18} pending={1} color="indigo" />
          <LeaveGauge label="Sick Leave" used={1} total={12} pending={0} color="emerald" />
          <LeaveGauge label="Unpaid Leave" used={0} total={30} pending={0} color="amber" />
        </div>

        {/* Leave Requests Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200">
            Leave Requests History ({leaveRequests.length})
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading requests...
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No leave requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Type</th>
                    {role === 'ADMIN' && <th className="px-6 py-3.5 font-semibold">Employee</th>}
                    <th className="px-6 py-3.5 font-semibold">Dates</th>
                    <th className="px-6 py-3.5 font-semibold">Remarks</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    {role === 'ADMIN' && <th className="px-6 py-3.5 font-semibold">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-indigo-300">{req.type}</td>
                      {role === 'ADMIN' && (
                        <td className="px-6 py-4 font-medium text-slate-200">
                          {req.employee?.employeeId || 'EMP'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{req.remarks || '—'}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      {role === 'ADMIN' && (
                        <td className="px-6 py-4">
                          {req.status === 'PENDING' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setReviewModal({ id: req.id, action: 'APPROVE' })}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[11px] font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setReviewModal({ id: req.id, action: 'REJECT' })}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-[11px] font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Reviewed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Apply for Time-Off</h3>
            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Leave Type</label>
                <select
                  value={applyForm.type}
                  onChange={(e) => setApplyForm({ ...applyForm, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="PAID">Paid Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Remarks / Reason</label>
                <textarea
                  rows={3}
                  value={applyForm.remarks}
                  onChange={(e) => setApplyForm({ ...applyForm, remarks: e.target.value })}
                  placeholder="Reason for leave request..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Review Leave Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
              {reviewModal.action === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <div className="space-y-3 text-xs">
              <label className="block text-slate-400 font-medium">Admin Notes / Reason</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional notes for employee..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setReviewModal(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  className={`px-4 py-2 rounded-xl font-medium text-white ${
                    reviewModal.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {reviewModal.action}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
