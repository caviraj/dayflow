import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';

function generatePayslipPDF(payroll: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header
      doc.fontSize(20).text('DAYFLOW HRMS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('Salary Slip', { align: 'center', underline: true });
      doc.moveDown(2);

      // Employee Details
      doc.fontSize(12).text(`Employee ID: ${payroll.employee.employeeId}`);
      doc.text(`Department: ${payroll.employee.department}`);
      doc.text(`Email: ${payroll.employee.user.email}`);
      doc.moveDown();

      // Period
      doc.text(`Period Start: ${payroll.periodStart.toISOString().split('T')[0]}`);
      doc.text(`Period End:   ${payroll.periodEnd.toISOString().split('T')[0]}`);
      doc.moveDown(2);

      // Salary Details
      doc.text(`Base Salary: $${Number(payroll.baseSalary).toFixed(2)}`);
      doc.text(`Deductions:  $${Number(payroll.deductions).toFixed(2)}`);
      doc.moveDown();
      doc.fontSize(14).text(`Net Pay:     $${Number(payroll.netPay).toFixed(2)}`);

      // Footer
      doc.moveDown(5);
      doc.fontSize(10).text('This is a computer-generated document. No signature is required.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

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
        employee: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    // RBAC Check
    if (session.user.role !== 'ADMIN' && payroll.employee.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pdfBuffer = await generatePayslipPDF(payroll);

    // Return the PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payslip-${payroll.employee.employeeId}-${payroll.periodStart.toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Payslip generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
