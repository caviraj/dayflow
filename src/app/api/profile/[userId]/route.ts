import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.id !== userId) {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Log Admin viewing another profile
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'VIEW_PROFILE',
          details: `Admin viewed profile for userId: ${userId}`,
        },
      });
    }

    const profile = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, role: true } },
        payrolls: { orderBy: { periodStart: 'desc' } },
        documents: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

const employeePatchSchema = z.object({
  address: z.string().optional(),
  phone: z.string().optional(),
  pictureUrl: z.string().url().optional(),
});

const adminPatchSchema = employeePatchSchema.extend({
  department: z.string().optional(),
  employeeId: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    let updateData;

    if (session.user.role === 'ADMIN') {
      const result = adminPatchSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
      }
      updateData = result.data;
    } else {
      if (session.user.id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const result = employeePatchSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
      }
      updateData = result.data;
    }

    const updatedProfile = await prisma.employee.update({
      where: { userId },
      data: updateData,
    });

    if (session.user.role === 'ADMIN' && session.user.id !== userId) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_PROFILE',
          details: `Admin updated profile fields ${Object.keys(updateData).join(', ')} for userId: ${userId}`,
        },
      });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
