import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell } from "@/components/admin-ui";
import Link from "next/link";

export const metadata = { title: "Admin — Visa Management" };

export default async function AdminPage() {
  const session = await requireAdmin();
  const [branches, agencies, collectors, staff, passports] = await Promise.all([
    prisma.branch.count(),
    prisma.agency.count(),
    prisma.collector.count(),
    prisma.staff.count(),
    prisma.passport.count(),
  ]);

  const cards = [
    { href: "/admin/passports", label: "Passports", value: passports },
    { href: "/admin/branches", label: "Branches", value: branches },
    { href: "/admin/agencies", label: "Agencies (allow-list)", value: agencies },
    { href: "/admin/collectors", label: "Collectors", value: collectors },
    { href: "/admin/staff", label: "Staff (allow-list)", value: staff },
    { href: "/admin/reports", label: "Reports", value: null },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin" role="ADMIN" userLabel={session.user.name ?? session.user.email} />
      <PageShell
        title="Admin"
        subtitle="Manage the organization registry — branches, agency and staff Gmail allow-lists, collectors, and reports."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-lg border border-input bg-card p-6 shadow-sm transition-colors hover:border-primary/50"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {card.value !== null ? (
                <p className="mt-1 text-2xl font-bold">{card.value}</p>
              ) : null}
            </Link>
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-input bg-card p-6">
          <h2 className="text-lg font-semibold">Access model</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Only emails allow-listed here (and your bootstrapped admin account) can
            sign in with Google. Agency emails go to <strong>/agency</strong>, staff
            emails to <strong>/staff</strong>. There is exactly one admin account,
            managed outside this screen (bootstrap / recovery).
          </p>
        </div>
      </PageShell>
    </div>
  );
}
