import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

/**
 * Hard cap on how long an admin may keep using one sign-in, regardless of
 * activity. JWT sessions roll forward on every request, so without this an
 * active admin is never asked to authenticate again. 12h matches a workday;
 * /login normally re-authenticates via Google SSO without a password prompt.
 */
const ADMIN_REAUTH_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * Server-side role guards. Every server action and protected page calls one
 * of these FIRST — the web proxy is only an optimistic first line; direct
 * POSTs to server actions bypass it (see Next data-security guidance).
 */

export async function requireSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/unauthorized");

  // Session callback verifies the live registry role; this additionally
  // forces a fresh Google sign-in after the admin re-auth cap.
  const authAt = session.user.authAt;
  if (!authAt || Date.now() - authAt * 1000 > ADMIN_REAUTH_MAX_AGE_MS) {
    // The proxy must let a signed-in admin reach /login?reauth=1 (otherwise
    // it bounces straight back here), and the login page signs out + forces
    // a fresh Google prompt before returning to the requested page.
    redirect(`/login?reauth=1&callbackUrl=${encodeURIComponent("/admin")}`);
  }
  return session;
}

export async function requireStaff(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "STAFF") redirect("/unauthorized");
  return session;
}

// Internal passport operators: staff members and the single admin both act on
// passport records (view/edit). Only these two roles exist.
export async function requireStaffOrAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "STAFF" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return session;
}
