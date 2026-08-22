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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const whereClause: Prisma.LeaveRequestWhereInput = {};

    if (session.user.role !== 'ADMIN') {
      if (!session.user.employeeId) {
        return NextResponse.json({ error: 'Employee profile missing' }, { status: 404 });
      }
      // Employee sees only their own requests
      whereClause.employee = {
        userId: session.user.id
      };
    }

    if (status) {
      whereClause.status = status as any;
    }

    const [leaves, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: whereClause,
        include: session.user.role === 'ADMIN' ? {
          employee: { select: { employeeId: true, department: true } }
        } : undefined,
        orderBy: [
          { status: 'asc' }, // PENDING usually comes first alphabetically over APPROVED, but let's just order by createdAt
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.leaveRequest.count({ where: whereClause }),
    ]);

    // Custom sorting if needed, but for now ordering by createdAt desc is standard
    // If we strictly want PENDING first, we can fetch all or sort in memory if payload is small, 
    // or rely on the frontend to query `?status=PENDING`.

    return NextResponse.json({
      data: leaves,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Leave query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
