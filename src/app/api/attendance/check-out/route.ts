import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: 'Unauthorized or not an employee' }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'No check-in found for today' }, { status: 400 });
    }

    if (existing.checkOut) {
      return NextResponse.json({ error: 'Already checked out for today' }, { status: 400 });
    }

    const now = new Date();
    
    // Optional: Determine if HALF_DAY based on hours worked
    // (For this phase, sticking to simple update as planned, but we can compute duration if requested)
    let finalStatus = existing.status;
    if (existing.checkIn) {
      const hoursWorked = (now.getTime() - existing.checkIn.getTime()) / (1000 * 60 * 60);
      if (hoursWorked < 4) {
        finalStatus = 'HALF_DAY';
      }
    }

    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: now,
        status: finalStatus,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
