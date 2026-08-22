import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Example RBAC: Admin only routes
    if (path.startsWith('/api/admin') && token?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Example RBAC: Employee specific routes
    if (path.startsWith('/api/employee') && token?.role !== 'EMPLOYEE' && token?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized: Employee access required' }, { status: 403 });
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
    '/api/admin/:path*',
    '/api/employee/:path*',
  ],
};
