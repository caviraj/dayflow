import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: payrollId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: { select: { userId: true, employeeId: true, department: true } }
      }
    });

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    // RBAC Check
    if (session.user.role !== 'ADMIN' && payroll.employee.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Payroll details GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
