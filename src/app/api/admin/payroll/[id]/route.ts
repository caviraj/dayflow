import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePayrollSchema = z.object({
  baseSalary: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: payrollId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const result = updatePayrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existingPayroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
    });

    if (!existingPayroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    const baseSalary = result.data.baseSalary !== undefined ? result.data.baseSalary : Number(existingPayroll.baseSalary);
    const deductions = result.data.deductions !== undefined ? result.data.deductions : Number(existingPayroll.deductions);
    const netPay = baseSalary - deductions;

    const updatedPayroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        baseSalary,
        deductions,
        netPay,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_PAYROLL',
        details: `Admin updated payroll record ${payrollId}. Base: ${baseSalary}, Deductions: ${deductions}`,
      },
    });

    return NextResponse.json(updatedPayroll);
  } catch (error) {
    console.error('Update Payroll error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
