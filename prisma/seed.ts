import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const Role = { ADMIN: 'ADMIN', EMPLOYEE: 'EMPLOYEE' } as const;

const DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Marketing'];

async function main() {
  console.log('Seeding database...');

  // Clean up existing data (due to cascading deletes, deleting users covers most)
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 12);

  // Create an Admin user (HR)
  await prisma.user.create({
    data: {
      email: 'admin@dayflow.local',
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
      employee: {
        create: {
          employeeId: 'EMP-001',
          department: 'HR',
          address: '123 Admin St, Cityville',
          phone: '555-0101',
          leaveBalance: {
            create: {
              paid: 20,
              sick: 10,
              unpaid: 5,
            },
          },
        },
      },
    },
  });

  console.log('Admin user created: admin@dayflow.local / Password@123');

  // Create 15 Employees
  for (let i = 2; i <= 16; i++) {
    const employeeId = `EMP-${i.toString().padStart(3, '0')}`;
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const email = `employee${i}@dayflow.local`;

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.EMPLOYEE,
        emailVerified: new Date(),
        employee: {
          create: {
            employeeId,
            department,
            address: `${i * 10} Employee Ave, Cityville`,
            phone: `555-01${i.toString().padStart(2, '0')}`,
            leaveBalance: {
              create: {
                paid: 15,
                sick: 5,
                unpaid: 0,
              },
            },
          },
        },
      },
    });
  }

  console.log('15 Employee users created (e.g. employee2@dayflow.local / Password@123).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
