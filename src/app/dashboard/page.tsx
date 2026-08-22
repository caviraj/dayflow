'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardRootRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const role = session?.user?.role || 'EMPLOYEE';
      if (role === 'ADMIN') {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/dashboard/employee');
      }
    } else if (status === 'unauthenticated') {
      router.replace('/signin');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Redirecting to role-based dashboard...</span>
      </div>
    </div>
  );
}
