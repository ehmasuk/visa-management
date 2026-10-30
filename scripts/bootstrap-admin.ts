/**
 * Task 5.1 — Controlled admin bootstrap script.
 *
 * Creates the single active ADMIN account from the configured verified
 * Google email in ADMIN_BOOTSTRAP_EMAIL. Idempotent: a deliberate no-op when
 * an active ADMIN already exists. Refuses to run when the email is unset.
 *
 * Usage:
 *   pnpm dlx tsx --env-file=.env scripts/bootstrap-admin.ts
 */
import { bootstrapAdminByEmail } from "@/lib/role-service";
import { prisma } from "@/lib/prisma";

async function main() {
  const configured = process.env.ADMIN_BOOTSTRAP_EMAIL;

  if (!configured) {
    console.error(
      "Refused: ADMIN_BOOTSTRAP_EMAIL is not configured.\n" +
        "Add ADMIN_BOOTSTRAP_EMAIL=<verified-google-email> to .env and re-run."
    );
    process.exit(1);
  }

  const result = await bootstrapAdminByEmail(configured);

  if (!result.created && !result.promoted) {
    console.log(
      `No-op: an active ADMIN already exists. Bootstrap of ${result.email} skipped by the single-admin invariant.`
    );
  } else {
    console.log(`Bootstrap complete: ADMIN account for ${result.email} is active.`);
  }

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Bootstrap failed:", message);
  process.exit(1);
});
