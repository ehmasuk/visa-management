import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/admin-ui";
import { PassportCard } from "@/components/passport-card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IdCardIcon, FileText } from "lucide-react";

export const metadata = { title: "Passports — Staff Desk" };

export default async function StaffPassportsPage() {
  await requireStaff();

  const [passports, collectors] = await Promise.all([
    prisma.passport.findMany({ orderBy: { receiptDate: "desc" }, include: { payment: true } }),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <PageShell
      title="Passports Desk"
      subtitle="Enter incoming passports received from travel agencies via couriers; track statuses, timestamps, and fees."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              All Passports ({passports.length})
            </h2>
          </div>
        </div>

        {passports.length === 0 ? (
          <Empty className="border border-border/80 rounded-2xl bg-card p-12">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
                <IdCardIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No passports recorded yet</EmptyTitle>
              <EmptyDescription>
                Record your first passport on the Passport Entry page — it will appear here with its status and payment custody trail.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {passports.map((passport) => (
              <li key={passport.id}>
                <PassportCard passport={passport} collectors={collectors} returnTo="/staff/passports" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
