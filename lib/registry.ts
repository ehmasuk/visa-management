import { prisma } from "@/lib/prisma";

/**
 * Registry-driven registration lookup.
 *
 * After Google sign-in, the account's email is matched against the
 * admin-defined registry (see spec admin/registry). Resolution priority:
 *   1. bootstrap ADMIN   — the `users` collection with role ADMIN
 *                          (managed exclusively by scripts/bootstrap-admin.ts
 *                          and scripts/admin-recovery.ts)
 *   2. Staff registry    — `staffs` collection (gmail allow-list)
 *   3. Agency allow-list — `agencies` collection (gmail allow-list)
 * Null means the email is NOT allow-listed and must be denied sign-in.
 */
export type ResolvedRegistration = {
  role: "ADMIN" | "STAFF" | "AGENCY";
  name: string | null;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function resolveRegistration(email: string): Promise<ResolvedRegistration | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  // 1) Bootstrap admin account (create by admin only — never via this app's UI)
  const dbUser = await prisma.user.findUnique({ where: { email: normalized } });
  if (dbUser?.role === "ADMIN") {
    return { role: "ADMIN", name: dbUser.name };
  }

  // 2) Staff registry
  const staff = await prisma.staff.findUnique({ where: { gmail: normalized } });
  if (staff) {
    return { role: "STAFF", name: staff.name };
  }

  // 3) Agency allow-list
  const agency = await prisma.agency.findUnique({ where: { gmail: normalized } });
  if (agency) {
    return { role: "AGENCY", name: agency.name };
  }

  // Not allow-listed → deny
  return null;
}
