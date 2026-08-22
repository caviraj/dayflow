import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { LeaveType } from '@prisma/client';

const applyLeaveSchema = z.object({
  type: z.enum(['PAID', 'SICK', 'UNPAID']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  remarks: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: 'Unauthorized or not an employee' }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      include: { leaveBalance: true },
    });

    if (!employee || !employee.leaveBalance) {
      return NextResponse.json({ error: 'Employee or balance not found' }, { status: 404 });
    }

    const body = await req.json();
    const result = applyLeaveSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { type, startDate, endDate, remarks } = result.data;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      return NextResponse.json({ error: 'startDate must be before or equal to endDate' }, { status: 400 });
    }

    // Simple calendar day calculation
    const daysRequested = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Validate balance before creating
    if (type === 'PAID' && employee.leaveBalance.paid < daysRequested) {
      return NextResponse.json({ error: `Insufficient PAID leave balance. Available: ${employee.leaveBalance.paid}, Requested: ${daysRequested}` }, { status: 400 });
    }
    if (type === 'SICK' && employee.leaveBalance.sick < daysRequested) {
      return NextResponse.json({ error: `Insufficient SICK leave balance. Available: ${employee.leaveBalance.sick}, Requested: ${daysRequested}` }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        type: type as LeaveType,
        startDate: start,
        endDate: end,
        remarks,
        status: 'PENDING',
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Leave apply error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
