import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell } from "@/components/admin-ui";
import { PassportCard } from "@/components/passport-card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IdCardIcon } from "lucide-react";

export const metadata = { title: "Passports — Admin" };

/**
 * Admin passport list: every passport across agencies, rendered with the
 * same shared cards the staff list uses — View/Edit buttons and the inline
 * status/comment forms, all stamped with the acting user as last editor.
 * The staff-only entry form is deliberately absent (entry stays a staff
 * workflow).
 */
export default async function AdminPassportsPage() {
  await requireAdmin();

  const [passports, collectors] = await Promise.all([
    prisma.passport.findMany({ orderBy: { receiptDate: "desc" }, include: { payment: true } }),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/passports" role="ADMIN" />
      <PageShell
        title="Passports"
        subtitle="View, edit, and drive every passport across agencies; the last editor is recorded on each change."
      >
        {passports.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IdCardIcon />
              </EmptyMedia>
              <EmptyTitle>No passports recorded yet</EmptyTitle>
              <EmptyDescription>
                Passports entered by staff appear here immediately, with their status and
                payment trail.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {passports.map((passport) => (
              <li key={passport.id}>
                <PassportCard passport={passport} collectors={collectors} returnTo="/admin/passports" />
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </div>
  );
}
