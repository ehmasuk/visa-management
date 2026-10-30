import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { roleHomePath } from "@/lib/routes";

const authRoutes = ["/login"];
// Legacy protected routes (kept for bookkeeping); /dashboard now redirects by role.
const protectedRoutes = ["/dashboard", "/profile", "/settings"];
const adminRoutes = ["/admin"];
const staffRoutes = ["/staff"];
const agencyRoutes = ["/agency"];
const apiAuthPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;
  const role = req.auth?.user?.role;

  // Allow all API auth routes
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isStaffRoute = staffRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAgencyRoute = agencyRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.includes(pathname);
  const isLegacyDashboard = pathname === "/dashboard";

  // Redirect logged-in users away from the login page, landing on their
  // role home: ADMIN → /admin, STAFF → /staff, AGENCY → /agency.
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL(roleHomePath(role), nextUrl));
  }

  // Legacy /dashboard → forward to the user's role home (page kept as shim).
  if (isLoggedIn && isLegacyDashboard) {
    return NextResponse.redirect(new URL(roleHomePath(role), nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && (isProtectedRoute || isLegacyDashboard)) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Role-restricted areas (task 3.5 hardens admin access; /staff and /agency
  // are likewise restricted to their exact role per the registry model).
  const isRoleRestricted =
    (isAdminRoute && role !== "ADMIN") ||
    (isStaffRoute && role !== "STAFF") ||
    (isAgencyRoute && role !== "AGENCY");
  if (isRoleRestricted) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
      );
    }
    return NextResponse.redirect(new URL("/unauthorized", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
