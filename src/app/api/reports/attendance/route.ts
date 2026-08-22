import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: Prisma.AttendanceWhereInput = {};

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

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { employeeId: true, department: true }
        }
      },
      orderBy: [{ date: 'asc' }, { employee: { employeeId: 'asc' } }],
    });

    // Construct CSV
    const headers = ['Date', 'Employee ID', 'Department', 'Check-In', 'Check-Out', 'Status'];
    const rows = attendanceRecords.map(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      const checkInStr = record.checkIn ? record.checkIn.toISOString() : 'N/A';
      const checkOutStr = record.checkOut ? record.checkOut.toISOString() : 'N/A';
      
      return [
        dateStr,
        `"${record.employee.employeeId}"`,
        `"${record.employee.department}"`,
        `"${checkInStr}"`,
        `"${checkOutStr}"`,
        record.status
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="attendance_report_${new Date().getTime()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Attendance Report error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
