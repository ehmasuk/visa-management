import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell } from "@/components/admin-ui";
import { PassportListClient } from "@/components/passport-list-client";
import { searchInternalPassports } from "@/app/actions/passport-search";

export const metadata = { title: "Passports — Admin" };

/**
 * Admin passport list: every passport across agencies, shown in the same
 * fixed-height, horizontally scrollable table as the staff desk — all fields
 * in columns, icon-only View/Edit actions, and a separate status-change column
 * (all stamped with the acting user as last editor). The staff-only entry form
 * is deliberately absent (entry stays a staff workflow). Paged and searchable
 * exactly like the staff desk via the shared island; the registry list feeds
 * the table's Deliver dialog.
 */
export default async function AdminPassportsPage() {
  await requireAdmin();

  const [initial, collectors] = await Promise.all([
    searchInternalPassports({}),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/passports" role="ADMIN" />
      <PageShell
        title="Passports"
        subtitle="View, edit, and drive every passport across agencies; the last editor is recorded on each change."
      >
        <PassportListClient
          initial={initial}
          collectors={collectors}
          returnTo="/admin/passports"
          view="table"
          emptyHint="Passports entered by staff appear here immediately, with their status and payment state."
        />
      </PageShell>
    </div>
  );
}
