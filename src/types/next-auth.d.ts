export type Role = 'EMPLOYEE' | 'ADMIN';
import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      employeeId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: Role;
    employeeId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    employeeId?: string;
  }
}
