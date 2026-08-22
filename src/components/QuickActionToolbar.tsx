'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, FileSpreadsheet, CalendarCheck, ShieldCheck, Zap } from 'lucide-react';

export function QuickActionToolbar() {
  const actions = [
    {
      title: 'Employee Directory',
      desc: 'Roster & profiles',
      href: '/reports',
      icon: UserPlus,
      color: 'from-indigo-600/30 to-purple-600/30',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Review Leave Requests',
      desc: 'Approve or reject',
      href: '/leave',
      icon: ShieldCheck,
      color: 'from-amber-600/30 to-orange-600/30',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      title: 'Export Reports',
      desc: 'Attendance & payroll CSV',
      href: '/reports',
      icon: FileSpreadsheet,
      color: 'from-emerald-600/30 to-teal-600/30',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Attendance Log',
      desc: 'Daily timestamps',
      href: '/attendance',
      icon: CalendarCheck,
      color: 'from-purple-600/30 to-pink-600/30',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Zap className="w-4 h-4 text-amber-400" />
        <span>Quick Administrative Controls</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link key={act.title} href={act.href}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`p-4 rounded-xl glass-panel-interactive border ${act.borderColor} bg-gradient-to-br ${act.color} flex items-center gap-3 cursor-pointer shadow-lg transition-all`}
              >
                <div className={`w-10 h-10 rounded-lg bg-slate-950/60 border ${act.borderColor} flex items-center justify-center ${act.iconColor} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-100 truncate">{act.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{act.desc}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
