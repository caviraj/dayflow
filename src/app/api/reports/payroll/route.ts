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

    const whereClause: Prisma.PayrollWhereInput = {};

    if (startDate || endDate) {
      whereClause.periodStart = {};
      whereClause.periodEnd = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.periodStart.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.periodEnd.lte = end;
      }
    }

    const payrollRecords = await prisma.payroll.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { employeeId: true, department: true }
        }
      },
      orderBy: [{ periodStart: 'asc' }, { employee: { employeeId: 'asc' } }],
    });

    // Construct CSV
    const headers = ['Period Start', 'Period End', 'Employee ID', 'Department', 'Base Salary', 'Deductions', 'Net Pay'];
    const rows = payrollRecords.map(record => {
      const pStart = record.periodStart.toISOString().split('T')[0];
      const pEnd = record.periodEnd.toISOString().split('T')[0];
      
      return [
        pStart,
        pEnd,
        `"${record.employee.employeeId}"`,
        `"${record.employee.department}"`,
        Number(record.baseSalary).toFixed(2),
        Number(record.deductions).toFixed(2),
        Number(record.netPay).toFixed(2)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payroll_report_${new Date().getTime()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Payroll Report error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
