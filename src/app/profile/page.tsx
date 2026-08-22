'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { User, Building, Mail, Phone, MapPin, Shield, Edit3, Save, CheckCircle2, Lock, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Profile Header */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/20 shrink-0">
              {profile?.user?.email ? profile.user.email[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{profile?.employeeId || 'Employee Profile'}</h1>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {role}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{profile?.user?.email}</p>
              <p className="text-xs text-slate-500 mt-0.5">Department: {profile?.department || 'N/A'}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Profile Content Form */}
        <form onSubmit={handleSave} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Personal & Work Information</h3>
            <span className="text-xs text-slate-400">
              {role === 'ADMIN' ? 'Full Edit Rights (Admin)' : 'Field-level restricted edit rights'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone (Editable by both) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Phone Number</span>
                <span className="text-[10px] text-emerald-400">Editable</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 disabled:opacity-60 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Address (Editable by both) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Residential Address</span>
                <span className="text-[10px] text-emerald-400">Editable</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 disabled:opacity-60 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Department (Editable ONLY by Admin) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Department</span>
                {role === 'ADMIN' ? (
                  <span className="text-[10px] text-emerald-400">Admin Editable</span>
                ) : (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Admin Only
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
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Employee ID (Editable ONLY by Admin) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Employee Code</span>
                {role === 'ADMIN' ? (
                  <span className="text-[10px] text-emerald-400">Admin Editable</span>
                ) : (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Admin Only
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
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Read-Only Salary Structure Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Salary Structure (Read-Only View)</span>
            </h4>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Base Pay</span>
                <span className="text-slate-200 font-semibold text-sm">$5,000.00 / mo</span>
              </div>
              <div>
                <span className="text-slate-500 block">Standard Deductions</span>
                <span className="text-slate-200 font-semibold text-sm">$200.00 / mo</span>
              </div>
              <div>
                <span className="text-slate-500 block">Net Monthly Pay</span>
                <span className="text-emerald-400 font-bold text-sm">$4,800.00 / mo</span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
