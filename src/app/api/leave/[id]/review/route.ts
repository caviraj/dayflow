import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const reviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  adminNotes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leaveRequestId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { action, adminNotes } = result.data;

    // Transaction to ensure atomicity
    const reviewResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch leave request
      const leaveRequest = await tx.leaveRequest.findUnique({
        where: { id: leaveRequestId },
        include: { employee: { include: { user: true } } },
      });

      if (!leaveRequest) {
        throw new Error('Leave request not found');
      }

      if (leaveRequest.status !== 'PENDING') {
        throw new Error('Leave request is already processed');
      }

      // 2. Process Approval
      if (action === 'APPROVE') {
        const daysToDeduct = Math.round((leaveRequest.endDate.getTime() - leaveRequest.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (leaveRequest.type === 'PAID' || leaveRequest.type === 'SICK') {
          const balance = await tx.leaveBalance.findUnique({
            where: { employeeId: leaveRequest.employeeId },
          });

          if (!balance) throw new Error('Leave balance not found');

          if (leaveRequest.type === 'PAID') {
            if (balance.paid < daysToDeduct) throw new Error('Insufficient PAID leave balance');
            await tx.leaveBalance.update({
              where: { id: balance.id },
              data: { paid: balance.paid - daysToDeduct },
            });
          } else if (leaveRequest.type === 'SICK') {
            if (balance.sick < daysToDeduct) throw new Error('Insufficient SICK leave balance');
            await tx.leaveBalance.update({
              where: { id: balance.id },
              data: { sick: balance.sick - daysToDeduct },
            });
          }
        }

        // Generate Attendance rows for the dates
        const attendanceData: Prisma.AttendanceCreateManyInput[] = [];
        const currentDate = new Date(leaveRequest.startDate);
        
        while (currentDate <= leaveRequest.endDate) {
          attendanceData.push({
            employeeId: leaveRequest.employeeId,
            date: new Date(currentDate),
            status: 'LEAVE',
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Upsert is safer in case they checked in and then leave was approved for today
        // But createMany doesn't support update on conflict natively in Prisma easily for composite keys, 
        // so we'll loop upserts for atomicity
        for (const att of attendanceData) {
          await tx.attendance.upsert({
            where: {
              employeeId_date: {
                employeeId: att.employeeId,
                date: att.date as Date,
              }
            },
            update: { status: 'LEAVE' },
            create: att as any,
          });
        }
      }

      // 3. Update Leave Request Status
      const updatedLeave = await tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          adminNotes,
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: `LEAVE_${action}`,
          details: `Admin ${action} leave request ${leaveRequestId} for employee ${leaveRequest.employeeId}`,
        },
      });

      // 5. Notification
      await tx.notification.create({
        data: {
          userId: leaveRequest.employee.userId,
          title: `Leave Request ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
          message: `Your leave request from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()} has been ${action.toLowerCase()}. ${adminNotes ? `Note: ${adminNotes}` : ''}`,
        },
      });

      return updatedLeave;
    });

    return NextResponse.json(reviewResult);
  } catch (error: any) {
    console.error('Leave review error:', error);
    if (error.message === 'Leave request not found' || error.message === 'Leave request is already processed' || error.message.includes('Insufficient')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
