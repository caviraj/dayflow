import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');

    let targetUserId = session.user.id;

    // Handle Admin Impersonation
    if (requestedUserId && requestedUserId !== session.user.id) {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden: Only admins can view other dashboards' }, { status: 403 });
      }
      targetUserId = requestedUserId;

      // Log the impersonation action
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'IMPERSONATE_DASHBOARD',
          details: `Admin viewed dashboard for userId: ${targetUserId}`,
        },
      });
    }

    const employeeData = await prisma.employee.findUnique({
      where: { userId: targetUserId },
      include: {
        user: {
          select: { email: true, role: true },
        },
        leaveBalance: true,
      },
    });

    if (!employeeData) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Fetch recent attendance (last 5 records)
    const recentAttendance = await prisma.attendance.findMany({
      where: { employeeId: employeeData.id },
      orderBy: { date: 'desc' },
      take: 5,
    });

    // Fetch recent leave requests
    const recentLeaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employeeData.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Fetch recent notifications
    const recentAlerts = await prisma.notification.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      profileSummary: {
        employeeId: employeeData.employeeId,
        department: employeeData.department,
        email: employeeData.user.email,
        role: employeeData.user.role,
        pictureUrl: employeeData.pictureUrl,
      },
      leaveBalance: employeeData.leaveBalance,
      recentAttendance,
      recentLeaves,
      recentAlerts,
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
