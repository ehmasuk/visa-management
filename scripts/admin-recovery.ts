/**
 * Task 6.1 — Restricted admin recovery/replacement script.
 *
 * This is the documented, restricted maintenance process for admin recovery
 * or replacement. It is the ONLY path that may replace the active ADMIN; it
 * is not reachable from application request routes. Every run writes an
 * audit record (who, when, why) to the admin_audit collection.
 *
 * Required environment:
 *   ADMIN_BOOTSTRAP_EMAIL  — current admin email (the account being demoted)
 *   ADMIN_RECOVERY_EMAIL   — the replacement admin email (must be registered)
 *   ADMIN_RECOVERY_REASON  — documented reason for the replacement
 *
 * Usage:
 *   pnpm dlx tsx --env-file=.env scripts/admin-recovery.ts
 */
import { replaceAdminAccount } from "@/lib/role-service";
import { prisma } from "@/lib/prisma";

async function main() {
  const currentAdmin = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const recoveryEmail = process.env.ADMIN_RECOVERY_EMAIL;
  const reason = process.env.ADMIN_RECOVERY_REASON;

  if (!currentAdmin || !recoveryEmail || !reason) {
    console.error(
      "Refused: admin recovery requires ADMIN_BOOTSTRAP_EMAIL, ADMIN_RECOVERY_EMAIL,\n" +
        "and ADMIN_RECOVERY_REASON. Set them in .env (or the invocation environment) and re-run."
    );
    process.exit(1);
  }

  const result = await replaceAdminAccount(currentAdmin, recoveryEmail, reason);

  console.log(
    `Admin replacement complete. ${result.demoted.email} demoted to STAFF; ` +
      `${result.promoted.email} promoted to ADMIN. Audit documentation written.`
  );

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Admin recovery failed:", message);
  process.exit(1);
});
