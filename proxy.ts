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
  // A revoked/offboarded account still has a JWT until expiry. Treat it as
  // logged out so /login stays reachable (no redirect loop) and every
  // protected route sends them back to sign in.
  const isLoggedIn = !!req.auth && req.auth.user.role !== "REVOKED";
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
  // No public homepage: `/` is just an entry redirect.
  const isRoot = pathname === "/";

  // An admin whose re-auth cap expired must be allowed to reach /login to
  // renew the session; bouncing them to /admin would loop forever.
  const isReauth = nextUrl.searchParams.get("reauth") === "1";

  // Signed-in users never see the entry/login pages — go straight to their
  // role home: ADMIN → /admin, STAFF → /staff, AGENCY → /agency.
  if (isLoggedIn && (isAuthRoute || isLegacyDashboard || isRoot) && !isReauth) {
    return NextResponse.redirect(new URL(roleHomePath(role), nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && (isProtectedRoute || isLegacyDashboard || isRoot)) {
    if (isRoot) return NextResponse.redirect(new URL("/login", nextUrl));
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
