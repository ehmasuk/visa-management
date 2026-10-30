import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Error thrown when a client-supplied payload attempts to set protected
 * user fields (role, agencyId).
 */
export class RoleFieldUpdateError extends Error {}

/**
 * Error thrown when an operation would create or promote a second active
 * ADMIN, violating the single-admin invariant.
 */
export class AdminInvariantError extends Error {}

/**
 * Error thrown when the acting user is not permitted to perform an
 * admin-scoped operation.
 */
export class NotAuthorizedError extends Error {}

export type ActingUser = {
  id: string;
  email: string;
  role: Role;
};

export const ADMIN_ROLE: Role = "ADMIN";

/**
 * Task 3.1 — Server-side validation for user-update payloads.
 *
 * Rejects any client request payload that attempts to set `role` or
 * `agencyId`. Authorized role changes must go through updateUserRoleByAdmin.
 */
export function sanitizeUserUpdate<T extends Record<string, unknown>>(payload: T) {
  if ("role" in payload || "agencyId" in payload) {
    throw new RoleFieldUpdateError(
      "role and agencyId cannot be set through request payloads"
    );
  }
  return payload;
}

/**
 * Task 4.1 — Single-admin invariant check-then-act.
 *
 * Throws when an active ADMIN already exists, so routine creation or
 * promotion of a second ADMIN is rejected.
 */
export async function assertNoActiveAdmin() {
  const adminCount = await prisma.user.count({ where: { role: ADMIN_ROLE } });
  if (adminCount >= 1) {
    throw new AdminInvariantError(
      "An active ADMIN already exists — creating or promoting a second ADMIN is not permitted"
    );
  }
}

/**
 * Task 3.1 (authorized scenario) — An ADMIN changes ANOTHER user's role and
 * the change is recorded. A user cannot change their own role through request
 * payloads; self role changes always take this path, never the generic way.
 */
export async function updateUserRoleByAdmin(
  actor: ActingUser,
  targetEmail: string,
  role: Role,
  reason: string
) {
  if (actor.role !== ADMIN_ROLE) {
    throw new NotAuthorizedError("Only an ADMIN can change another user's role");
  }
  if (targetEmail === actor.email) {
    throw new RoleFieldUpdateError(
      "A user cannot change their own role; use the documented recovery process instead"
    );
  }

  const target = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (!target) {
    throw new RoleFieldUpdateError(`User not found: ${targetEmail}`);
  }

  return prisma.$transaction(async (tx) => {
    // Task 4.1 — no second ADMIN may be created via the admin path.
    if (role === ADMIN_ROLE) {
      const adminCount = await tx.user.count({ where: { role: ADMIN_ROLE } });
      if (adminCount >= 1) {
        throw new AdminInvariantError(
          "Promoting a user to ADMIN is rejected — an active ADMIN already exists"
        );
      }
    }

    const updated = await tx.user.update({
      where: { email: targetEmail },
      data: { role },
    });

    await tx.adminAudit.create({
      data: {
        action: "ROLE_CHANGE",
        actorEmail: actor.email,
        actorRole: actor.role,
        targetEmail,
        fromRole: target.role,
        toRole: role,
        reason,
      },
    });

    return updated;
  });
}

/**
 * Task 5.1 — Controlled bootstrap. Creates the first ACTIVE ADMIN for a
 * configured, verified Google email. Idempotent: a deliberate no-op when an
 * active ADMIN already exists. Refuses when the configured email is unset.
 */
export async function bootstrapAdminByEmail(configuredEmail: string | undefined) {
  if (!configuredEmail) {
    throw new RoleFieldUpdateError(
      "ADMIN_BOOTSTRAP_EMAIL is not configured — the bootstrap email must be a verified Google account"
    );
  }

  const email = configuredEmail.trim().toLowerCase();
  if (!email) {
    throw new RoleFieldUpdateError(
      "ADMIN_BOOTSTRAP_EMAIL is empty — set it to the verified Google email of the business owner"
    );
  }

  return prisma.$transaction(async (tx) => {
    // Single-admin invariant: refuse if any active ADMIN exists.
    const adminCount = await tx.user.count({ where: { role: ADMIN_ROLE } });
    if (adminCount >= 1) {
      return { created: false, promoted: false, email } as const;
    }

    const existing = await tx.user.findUnique({ where: { email } });
    const result = existing
      ? await tx.user.update({
          where: { email },
          data: { role: ADMIN_ROLE, emailVerified: existing.emailVerified ?? new Date() },
        })
      : await tx.user.create({
          data: { email, role: ADMIN_ROLE, emailVerified: new Date() },
        });

    await tx.adminAudit.create({
      data: {
        action: "ADMIN_BOOTSTRAP",
        actorEmail: email,
        actorRole: null,
        targetEmail: email,
        fromRole: existing ? existing.role : null,
        toRole: ADMIN_ROLE,
        reason:
          "Controlled seed/bootstrap of the single ADMIN from ADMIN_BOOTSTRAP_EMAIL",
      },
    });

    const created = !existing;
    return { created, promoted: created, email, user: result } as const;
  });
}

/**
 * Task 6.1 — Restricted admin recovery/replacement. Moves the single ADMIN
 * role from the current admin to a designated new admin email and writes the
 * audit documentation (who, when, why). Must only be invoked from the
 * documented maintenance script (scripts/admin-recovery.ts) or an explicit
 * ADMIN-initiated maintenance action — never from routine request paths.
 */
export async function replaceAdminAccount(configuredEmail: string | undefined, recoveryEmail: string | undefined, reason: string | undefined) {
  if (!configuredEmail) {
    throw new RoleFieldUpdateError(
      "ADMIN_BOOTSTRAP_EMAIL is not configured — the current admin to demote cannot be resolved"
    );
  }
  if (!recoveryEmail) {
    throw new RoleFieldUpdateError(
      "ADMIN_RECOVERY_EMAIL is not configured — the replacement admin email is required"
    );
  }

  const actorEmail = configuredEmail.trim().toLowerCase();
  const recovery = recoveryEmail.trim().toLowerCase();
  if (!reason || reason.trim().length === 0) {
    throw new RoleFieldUpdateError(
      "A documented reason is required for admin recovery/replacement"
    );
  }
  if (recovery === actorEmail) {
    throw new RoleFieldUpdateError(
      "The replacement admin email must differ from the current admin email"
    );
  }

  const actor = await prisma.user.findUnique({ where: { email: actorEmail } });
  if (!actor || actor.role !== ADMIN_ROLE) {
    throw new NotAuthorizedError(
      "No active ADMIN account matched admin recovery configuration"
    );
  }

  return prisma.$transaction(async (tx) => {
    const recoveryUser = await tx.user.findUnique({ where: { email: recovery } });
    if (!recoveryUser) {
      throw new RoleFieldUpdateError(
        `Recovery email ${recovery} is not a registered user — they must sign in with Google once before replacement`
      );
    }

    // Demote the current admin
    const demoted = await tx.user.update({
      where: { email: actorEmail },
      data: { role: "STAFF" },
    });

    // Promote the recovery email to ADMIN
    const promoted = await tx.user.update({
      where: { email: recovery },
      data: { role: ADMIN_ROLE },
    });

    // Audit documentation: who (actor), when (createdAt), why (reason)
    await tx.adminAudit.create({
      data: {
        action: "ADMIN_RECOVERY",
        actorEmail,
        actorRole: ADMIN_ROLE,
        targetEmail: recovery,
        fromRole: recoveryUser.role,
        toRole: ADMIN_ROLE,
        reason,
      },
    });

    return { demoted, promoted, recoveryEmail: recovery } as const;
  });
}
