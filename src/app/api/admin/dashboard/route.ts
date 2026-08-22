import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // High level metrics
    const totalEmployees = await prisma.employee.count();

    const pendingLeaveRequests = await prisma.leaveRequest.count({
      where: { status: 'PENDING' },
    });

    // Get today's attendance summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysAttendance = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: today,
      },
      _count: {
        _all: true,
      },
    });

    const attendanceSummary = todaysAttendance.reduce((acc, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    // Fetch the 5 most recent pending leave requests for the queue preview
    const leaveApprovalQueue = await prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        employee: {
          select: { employeeId: true, department: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 5,
    });

    return NextResponse.json({
      metrics: {
        totalEmployees,
        pendingLeaveRequests,
        attendanceSummary,
      },
      leaveApprovalQueue,
    });
  } catch (error) {
    console.error('Admin Dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
