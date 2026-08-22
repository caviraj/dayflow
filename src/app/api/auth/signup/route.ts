import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

const signupSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['EMPLOYEE', 'ADMIN']).default('EMPLOYEE'),
  department: z.string().optional().default('Management'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { employeeId, email, password, role, department } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    const existingEmployee = await prisma.employee.findUnique({ where: { employeeId } });
    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee ID already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const deptValue = (department && department.trim() !== '') ? department : 'Management';

    // Create User and Employee in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        employee: {
          create: {
            employeeId,
            department: deptValue,
          },
        },
      },
      include: {
        employee: true,
      },
    });

    // Send verification email
    // For Phase 1, we will generate a dummy token (in reality, store token in DB/Redis)
    // To meet requirements, we'll just simulate a verification token (e.g. JWT or DB token)
    // using the user's ID.
    const verificationToken = Buffer.from(user.id).toString('base64');
    const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`;

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789') {
      await resend.emails.send({
        from: 'Dayflow HRMS <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your Dayflow Account',
        html: `<p>Please click <a href="${verificationLink}">here</a> to verify your account.</p>`,
      });
    } else {
      console.log('Verification Link (Simulated):', verificationLink);
    }

    return NextResponse.json(
      { message: 'User created successfully. Please verify your email.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
