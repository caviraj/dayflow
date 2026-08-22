'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { LeaveGauge } from '@/components/LeaveGauge';
import { StatusBadge } from '@/components/StatusBadge';
import { CalendarDays, Plus, Clock, Sparkles, X, CheckCircle2, XCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header & Apply Action */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/25 shrink-0 border border-purple-400/30">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                  Time-Off Portal
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              </div>
              <h1 className="text-xl font-black text-slate-100 mt-0.5">Leave & Vacation Center</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit requests, check visual quota balances, and manage team approvals.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowApplyModal(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 transition-all border border-purple-400/30 relative z-10"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Apply for Time-Off</span>
          </motion.button>
        </motion.div>

        {/* Leave Balance Visual Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LeaveGauge label="Paid Leave" used={2} total={18} pending={1} color="indigo" />
          <LeaveGauge label="Sick Leave" used={1} total={12} pending={0} color="emerald" />
          <LeaveGauge label="Unpaid Leave" used={0} total={30} pending={0} color="amber" />
        </div>

        {/* Leave Requests Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 font-bold text-sm text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Leave Request History</span>
            </div>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-semibold">
              {leaveRequests.length} Total
            </span>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
              <p className="font-semibold text-slate-300">No leave requests recorded.</p>
              <p className="text-xs text-slate-500">Click &quot;Apply for Time-Off&quot; to request leave.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Type</th>
                    {role === 'ADMIN' && <th className="px-6 py-4 font-bold">Employee</th>}
                    <th className="px-6 py-4 font-bold">Duration</th>
                    <th className="px-6 py-4 font-bold">Remarks</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    {role === 'ADMIN' && <th className="px-6 py-4 font-bold">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-300">{req.type} LEAVE</td>
                      {role === 'ADMIN' && (
                        <td className="px-6 py-4 font-semibold text-purple-300">
                          {req.employee?.employeeId || 'EMP-001'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-200 font-medium">
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
                                className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => setReviewModal({ id: req.id, action: 'REJECT' })}
                                className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-medium">Completed</span>
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
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel max-w-md w-full rounded-2xl p-6 border border-indigo-500/30 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CalendarDays className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Apply for Time-Off</span>
                </h3>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Leave Type</label>
                  <select
                    value={applyForm.type}
                    onChange={(e) => setApplyForm({ ...applyForm, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="PAID">Paid Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Start Date</label>
                    <input
                      type="date"
                      required
                      value={applyForm.startDate}
                      onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">End Date</label>
                    <input
                      type="date"
                      required
                      value={applyForm.endDate}
                      onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Remarks / Reason</label>
                  <textarea
                    rows={3}
                    value={applyForm.remarks}
                    onChange={(e) => setApplyForm({ ...applyForm, remarks: e.target.value })}
                    placeholder="Provide details for leave approval..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Leave Modal */}
      <AnimatePresence>
        {reviewModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-800 space-y-4 shadow-2xl"
            >
              <h3 className="text-base font-bold text-slate-100">
                {reviewModal.action === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Admin Notes / Feedback</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add feedback for employee..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setReviewModal(null)}
                    className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReview}
                    className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-lg ${
                      reviewModal.action === 'APPROVE'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    }`}
                  >
                    Confirm {reviewModal.action}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

