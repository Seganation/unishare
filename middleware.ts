import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";

/**
 * Middleware for protecting routes based on authentication and user role.
 *
 * Role-based redirects:
 * - PENDING users → /waiting-approval
 * - Non-ADMIN users accessing /admin → /dashboard
 * - Unauthenticated users → /login
 */
export default auth((req) => {
  const session = req.auth;
  const path = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/", "/articles"];
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated
  if (session?.user) {
    // Admin routes - only accessible by ADMIN role
    if (path.startsWith("/admin")) {
      if (session.user.role !== "ADMIN") {
        const coursesUrl = new URL("/courses", req.url);
        return NextResponse.redirect(coursesUrl);
      }
    }

    // Student routes - accessible by APPROVED and ADMIN
    if (
      path.startsWith("/courses") ||
      path.startsWith("/timetable") ||
      path.startsWith("/articles/new")
    ) {
      // PENDING users should wait for approval
      if (session.user.role === "PENDING") {
        const waitingUrl = new URL("/waiting-approval", req.url);
        return NextResponse.redirect(waitingUrl);
      }

      // Only APPROVED and ADMIN can access
      if (session.user.role !== "APPROVED" && session.user.role !== "ADMIN") {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // If on login/signup pages and already authenticated, redirect to courses
    if (path === "/login" || path === "/signup") {
      if (session.user.role === "PENDING") {
        const waitingUrl = new URL("/waiting-approval", req.url);
        return NextResponse.redirect(waitingUrl);
      }
      const coursesUrl = new URL("/courses", req.url);
      return NextResponse.redirect(coursesUrl);
    }
  }

  return NextResponse.next();
});

/**
 * Matcher configuration - routes that require authentication
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
