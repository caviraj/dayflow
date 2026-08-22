'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { DollarSign, Download, Plus, Edit3, FileText, CheckCircle2 } from 'lucide-react';

export default function PayrollPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || 'EMPLOYEE';

  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Create/Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    periodStart: '',
    periodEnd: '',
    baseSalary: 5000,
    deductions: 200,
  });

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll');
      if (res.ok) {
        const data = await res.json();
        setPayrolls(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleDownloadPayslip = (id: string, employeeId: string) => {
    window.open(`/api/payroll/${id}/payslip`, '_blank');
  };

  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/payroll/${editingId}` : '/api/admin/payroll';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        await fetchPayrolls();
      }
    } catch (err) {
      console.error('Save payroll error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Payroll & Payslips</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly salary breakdowns, deductions, and downloadable PDF payslips.
              </p>
            </div>
          </div>

          {role === 'ADMIN' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingId(null);
                setFormData({ employeeId: '', periodStart: '', periodEnd: '', baseSalary: 5000, deductions: 200 });
                setShowModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Payroll Record</span>
            </motion.button>
          )}
        </div>

        {/* Salary Structure Overview Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100">Salary Structure Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Base Monthly Pay</span>
              <span className="text-xl font-bold text-white">$5,000.00</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Standard Deductions</span>
              <span className="text-xl font-bold text-rose-400">-$200.00</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Net Monthly Salary</span>
              <span className="text-xl font-bold text-emerald-400">$4,800.00</span>
            </div>
          </div>
        </div>

        {/* Payslip History Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200">
            Payslip History ({payrolls.length})
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading payroll records...
            </div>
          ) : payrolls.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No payslip records available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Period</th>
                    <th className="px-6 py-3.5 font-semibold">Employee ID</th>
                    <th className="px-6 py-3.5 font-semibold">Base Salary</th>
                    <th className="px-6 py-3.5 font-semibold">Deductions</th>
                    <th className="px-6 py-3.5 font-semibold">Net Pay</th>
                    <th className="px-6 py-3.5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {new Date(p.periodStart).toLocaleDateString()} to {new Date(p.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-indigo-300 font-medium">{p.employeeId}</td>
                      <td className="px-6 py-4">${p.baseSalary?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-rose-400">-${p.deductions?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">${p.netPay?.toFixed(2)}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadPayslip(p.id, p.employeeId)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-medium flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Payslip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Admin Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
              {editingId ? 'Edit Payroll Record' : 'Create Payroll Record'}
            </h3>
            <form onSubmit={handleSavePayroll} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Employee CUID / ID</label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="Employee record ID"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Period Start</label>
                  <input
                    type="date"
                    required
                    value={formData.periodStart}
                    onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Period End</label>
                  <input
                    type="date"
                    required
                    value={formData.periodEnd}
                    onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Base Salary ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Deductions ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium">
                  Save Record
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
