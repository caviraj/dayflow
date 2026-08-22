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

    // Get today's date at midnight for the unique constraint
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already checked in for today' }, { status: 400 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT',
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
