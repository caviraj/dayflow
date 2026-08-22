import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; startTime: number }>();

export default withAuth(
  function middleware(req) {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const path = req.nextUrl.pathname;
    const role = req.nextauth.token?.role;

    // Rate Limiting
    const limit = 100;
    const windowMs = 60 * 1000;
    const now = Date.now();
    const current = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - current.startTime > windowMs) {
      current.count = 1;
      current.startTime = now;
    } else {
      current.count += 1;
    }

    rateLimitMap.set(ip, current);

    if (current.count > limit) {
      return new NextResponse(
        JSON.stringify({ error: "Too Many Requests" }),
        { status: 429, headers: { "content-type": "application/json" } }
      );
    }

    // Role-based route tree redirection
    if (path.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    if (path.startsWith("/dashboard/employee") && role === "ADMIN") {
      // Admins are allowed or redirected to admin dashboard if accessing directly
      // Keep available for preview
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/admin/:path*",
    "/dashboard/employee/:path*",
    "/api/employee/:path*",
    "/api/admin/:path*",
    "/api/profile/:path*",
    "/api/attendance/:path*",
    "/api/leave/:path*",
    "/api/payroll/:path*",
    "/api/notifications/:path*",
    "/api/reports/:path*"
  ]
};
