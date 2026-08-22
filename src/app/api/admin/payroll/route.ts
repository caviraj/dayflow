import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPayrollSchema = z.object({
  employeeId: z.string(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  baseSalary: z.number().min(0),
  deductions: z.number().min(0).default(0),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const result = createPayrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { employeeId, periodStart, periodEnd, baseSalary, deductions } = result.data;
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      return NextResponse.json({ error: 'periodStart must be before or equal to periodEnd' }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const netPay = baseSalary - deductions;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        periodStart: start,
        periodEnd: end,
        baseSalary,
        deductions,
        netPay,
        payslipUrl: null, // Will be generated on the fly via the /payslip endpoint
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PAYROLL',
        details: `Admin created payroll record ${payroll.id} for employee ${employeeId}`,
      },
    });

    return NextResponse.json(payroll, { status: 201 });
  } catch (error) {
    console.error('Create Payroll error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
