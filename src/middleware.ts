import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Simple in-memory rate limiter for the Edge runtime
// Note: This state resets per isolate, so it's a lightweight MVP solution.
const rateLimitMap = new Map<string, { count: number; startTime: number }>();

export default withAuth(
  function middleware(req) {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    
    // Rate limit configuration
    const limit = 100; // max 100 requests
    const windowMs = 60 * 1000; // per 1 minute
    
    const now = Date.now();
    const current = rateLimitMap.get(ip) || { count: 0, startTime: now };
    
    if (now - current.startTime > windowMs) {
        // Reset window
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
    
    // Auth and Rate Limits passed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Apply middleware to all protected API routes
export const config = {
  matcher: [
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
