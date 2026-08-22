'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  BarChart3,
  LogOut,
  Shield,
  Bell,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || 'EMPLOYEE';

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Attendance', href: '/attendance', icon: CalendarCheck },
    { label: 'Leave', href: '/leave', icon: CalendarDays },
    { label: 'Payroll', href: '/payroll', icon: DollarSign },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <nav className="glass-panel border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-white text-lg tracking-tighter">D</span>
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              Dayflow
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-medium">HRMS</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info & Notifications Dropdown */}
        <div className="flex items-center gap-3">
          {role === 'ADMIN' && (
            <span className="bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Admin</span>
            </span>
          )}

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090d16]" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 shadow-2xl border border-slate-800 z-50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      In-App Notifications
                    </h4>
                    <span className="text-[10px] text-indigo-400 font-semibold">
                      {unreadCount} Unread
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No notifications.</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs transition-colors flex items-start justify-between gap-2 ${
                            n.isRead
                              ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                              : 'bg-indigo-600/10 border-indigo-500/30 text-slate-200'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-200">{n.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="p-1 hover:bg-indigo-500/20 rounded-md text-indigo-400 shrink-0"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
