'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, X, User } from 'lucide-react';

interface ViewingAsBannerProps {
  employeeName: string;
  employeeId: string;
  onClear: () => void;
}

export function ViewingAsBanner({ employeeName, employeeId, onClear }: ViewingAsBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-amber-200 text-xs sm:text-sm font-medium relative z-50 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
        <Eye className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Viewing as employee: <strong className="text-white underline">{employeeName} ({employeeId})</strong>
        </span>
        <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ml-2 hidden sm:inline-block">
          Admin Preview Mode
        </span>
      </div>

      <button
        onClick={onClear}
        className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-100 px-2.5 py-1 rounded-lg transition-all text-xs"
      >
        <span>Exit View</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
