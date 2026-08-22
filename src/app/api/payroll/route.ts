import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
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
        } else {
          targetEmployeeId = 'not-found';
        }
      } else {
        targetEmployeeId = undefined as any; 
      }
    } else {
      if (!session.user.employeeId) {
         return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
      }
    }

    const whereClause: Prisma.PayrollWhereInput = {};
    if (targetEmployeeId !== undefined) {
      if (targetEmployeeId === 'not-found') {
        return NextResponse.json({ data: [], meta: { total: 0, page, limit, totalPages: 0 } });
      }
      whereClause.employeeId = targetEmployeeId;
    }

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where: whereClause,
        include: session.user.role === 'ADMIN' && !targetEmployeeId ? {
          employee: { select: { employeeId: true, department: true } }
        } : undefined,
        orderBy: { periodStart: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payroll.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: payrolls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Payroll GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
