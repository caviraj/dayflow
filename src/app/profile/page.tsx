'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { User, Building, Phone, MapPin, Edit3, Save, CheckCircle2, Lock, FileText, Sparkles, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || 'EMPLOYEE';

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    pictureUrl: '',
    department: '',
    employeeId: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile/me');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData({
            phone: data.phone || '',
            address: data.address || '',
            pictureUrl: data.pictureUrl || '',
            department: data.department || '',
            employeeId: data.employeeId || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/profile/${profile?.id || 'me'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
        setSuccessMsg('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 sm:p-7 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/30 shrink-0 border border-indigo-400/30">
                {profile?.user?.email ? profile.user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{profile?.employeeId || 'Employee Profile'}</h1>
                <span className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  {role}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 font-medium">{profile?.user?.email}</p>
              <p className="text-xs text-slate-500 mt-0.5">Department: <strong className="text-slate-300">{profile?.department || 'Operations'}</strong></p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsEditing(!isEditing)}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-md relative z-10"
          >
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </motion.button>
        </motion.div>

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* Profile Content Form */}
        <form onSubmit={handleSave} className="glass-panel rounded-2xl p-6 sm:p-7 border border-slate-800 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">Personal & Employment Details</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage your contact information and permissions</p>
            </div>
            <span className="text-[11px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-medium border border-slate-700">
              {role === 'ADMIN' ? 'Full Admin Rights' : 'Restricted Employee Access'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone (Editable by both) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Phone Number</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Editable</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Address (Editable by both) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Residential Address</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Editable</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Department (Editable ONLY by Admin) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Department</span>
                {role === 'ADMIN' ? (
                  <span className="text-[10px] text-emerald-400 font-semibold">Admin Editable</span>
                ) : (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                    <Lock className="w-3 h-3" /> Admin Protected
                  </span>
                )}
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  disabled={!isEditing || role !== 'ADMIN'}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-100 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Employee ID (Editable ONLY by Admin) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Employee Code</span>
                {role === 'ADMIN' ? (
                  <span className="text-[10px] text-emerald-400 font-semibold">Admin Editable</span>
                ) : (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                    <Lock className="w-3 h-3" /> Admin Protected
                  </span>
                )}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  disabled={!isEditing || role !== 'ADMIN'}
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-100 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Read-Only Salary Structure Section */}
          <div className="pt-5 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Salary Structure (Read-Only Overview)</span>
            </h4>
            <div className="bg-slate-900/70 rounded-2xl p-5 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Base Monthly Pay</span>
                <span className="text-white font-bold text-base mt-0.5 block">$5,000.00</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Standard Deductions</span>
                <span className="text-slate-300 font-bold text-base mt-0.5 block">$200.00</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Net Disbursed Salary</span>
                <span className="text-emerald-400 font-black text-base mt-0.5 block">$4,800.00</span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 border border-indigo-400/30"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </motion.button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

