import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

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
  return session;
}

export async function requireStaff(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "STAFF") redirect("/unauthorized");
  return session;
}

// Internal passport operators: staff members and the single admin both act on
// passport records (view/edit). Agencies never pass, even for their own passports.
export async function requireStaffOrAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "STAFF" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return session;
}

export async function requireAgency(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "AGENCY") redirect("/unauthorized");
  return session;
}
