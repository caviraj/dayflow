'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User } from 'lucide-react';

type Role = 'ADMIN' | 'EMPLOYEE';

interface RoleTransitionOverlayProps {
  role: Role;
  visible: boolean;
  onComplete: () => void;
}

/**
 * RoleTransitionOverlay
 * Full-screen cinematic transition played after login before route push.
 * HR/Admin:  Purple crystallization shards from center → fade out
 * Employee:  Teal ripple rings from center → fade out
 * Duration:  ~900ms total, then calls onComplete()
 */
export function RoleTransitionOverlay({
  role,
  visible,
  onComplete,
}: RoleTransitionOverlayProps) {
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onComplete, 950);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  const primaryColor = isAdmin ? '#7C3AED' : '#0D9488';
  const softColor    = isAdmin ? '#A78BFA' : '#5EEAD4';
  const bgColor      = isAdmin ? 'rgba(12,4,30,0.97)' : 'rgba(4,18,18,0.97)';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: bgColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.15 }}
        >
          {/* Ripple / Shard rings */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{ borderColor: primaryColor }}
              initial={{ width: 80, height: 80, opacity: 0.9 }}
              animate={{
                width:   80 + i * 220,
                height:  80 + i * 220,
                opacity: 0,
              }}
              transition={{
                duration: 0.8,
                delay:    i * 0.12,
                ease:     'easeOut',
              }}
            />
          ))}

          {/* Center icon burst */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
          >
            {/* Glow backdrop */}
            <div
              className="absolute w-40 h-40 rounded-full blur-2xl"
              style={{ background: `${primaryColor}55` }}
            />

            {/* Icon container */}
            <div
              className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}33, ${softColor}22)`,
                border: `2px solid ${primaryColor}60`,
                boxShadow: `0 0 50px ${primaryColor}80`,
              }}
            >
              {isAdmin ? (
                <ShieldCheck size={44} style={{ color: softColor }} strokeWidth={1.5} />
              ) : (
                <User size={44} style={{ color: softColor }} strokeWidth={1.5} />
              )}
            </div>
          </motion.div>

          {/* Role label */}
          <motion.div
            className="absolute bottom-[38%] text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <p
              className="text-sm font-semibold tracking-[0.25em] uppercase"
              style={{ color: softColor }}
            >
              {isAdmin ? 'Command Nexus' : 'My Flow'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin ? 'Loading HR workspace…' : 'Loading your dashboard…'}
            </p>
          </motion.div>

          {/* Diagonal shards (admin only — crystallization effect) */}
          {isAdmin &&
            [0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.div
                key={`shard-${i}`}
                className="absolute w-[2px] rounded-full"
                style={{
                  height: '120px',
                  background: `linear-gradient(to top, ${primaryColor}, transparent)`,
                  transformOrigin: 'bottom center',
                  transform: `rotate(${angle}deg)`,
                  bottom: '50%',
                  left: '50%',
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: [0, 1, 0] }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.04, ease: 'easeOut' }}
              />
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
