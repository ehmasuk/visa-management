import { requireStaff } from "@/lib/guards";
import { PageShell } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Staff — Visa Management" };

export default async function StaffPage() {
  await requireStaff();

  const [receivedPassports, unpaidPassports] = await Promise.all([
    prisma.passport.count({ where: { status: "RECEIVED" } }),
    prisma.payment.count({ where: { status: "UNPAID" } }),
  ]);

  return (
    <PageShell title="Staff workspace" subtitle="Daily passport operations.">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-input bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Received Passports
          </p>
          <p className="mt-1 text-4xl font-bold font-mono text-foreground">
            {receivedPassports}
          </p>
        </div>
        <div className="rounded-xl border border-input bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Unpaid Passports
          </p>
          <p className="mt-1 text-4xl font-bold font-mono text-foreground">
            {unpaidPassports}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
