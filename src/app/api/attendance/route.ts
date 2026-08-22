import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: 'Unauthorized or not an employee' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate'); // YYYY-MM-DD
    const endDate = searchParams.get('endDate');     // YYYY-MM-DD
    const requestedUserId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    let targetEmployeeId = session.user.employeeId;

    if (session.user.role === 'ADMIN') {
      if (requestedUserId) {
        const targetEmployee = await prisma.employee.findUnique({
          where: { userId: requestedUserId },
        });
        if (targetEmployee) {
          targetEmployeeId = targetEmployee.id;
        }
      } else {
        // If Admin and no userId is provided, fetch for ALL employees
        targetEmployeeId = undefined as any; 
      }
    }

    const whereClause: Prisma.AttendanceWhereInput = {};

    if (targetEmployeeId) {
      whereClause.employeeId = targetEmployeeId;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.date.lte = end;
      }
    }

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where: whereClause,
        include: session.user.role === 'ADMIN' && !targetEmployeeId ? {
          employee: { select: { employeeId: true, department: true } }
        } : undefined,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: attendance,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
