import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaffOrAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { Field, PageShell, Select, SubmitButton } from "@/components/admin-ui";
import { updatePassportDetails } from "@/app/actions/passport";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Edit passport" };

/**
 * Internal passport edit view: prefilled with the passport's current values
 * for every user-maintained field; agency/collector/visa type/service are
 * validates against their admin registries on save. The form intentionally
 * carries nothing system-managed (status, receipt date, delivery date,
 * delivery collector) — the status/delivery flow governs those, and the
 * details action ignores any posted values for them anyway.
 */
export default async function PassportEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStaffOrAdmin();
  const { id } = await params;

  const [passport, agencies, collectors, visaTypes, services] = await Promise.all([
    prisma.passport.findUnique({ where: { id } }),
    prisma.agency.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.visaType.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.service.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  if (!passport) notFound();

  const registryOptions = (rows: Array<{ name: string }>, emptyLabel: string) => [
    { value: "", label: rows.length === 0 ? emptyLabel : "Select" },
    ...rows.map((row) => ({ value: row.name, label: row.name })),
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav
        pathname={`/passports/${id}/edit`}
        role={session.user.role}
        userLabel={session.user.name ?? session.user.email}
      />
      <PageShell
        title="Edit passport"
        subtitle={`${passport.passportNumber} · ${passport.holderName} · ${passport.agencyName}`}
      >
        <Card className="mb-8 gap-0 px-5 py-5">
          <form action={updatePassportDetails}>
            <input type="hidden" name="id" value={passport.id} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Select
                  label="Agency name"
                  name="agencyName"
                  defaultValue={passport.agencyName}
                  options={registryOptions(agencies, "No agencies registered yet")}
                />
              </div>
              <div>
                <Select
                  label="Intake collector (brought the passport)"
                  name="collectorName"
                  defaultValue={passport.collectorName}
                  options={registryOptions(collectors, "No collectors registered yet")}
                />
              </div>
              <div>
                <Select
                  label="Visa type"
                  name="visaTypeName"
                  defaultValue={passport.visaTypeName ?? ""}
                  options={registryOptions(visaTypes, "No visa types registered yet")}
                />
              </div>
              <div>
                <Select
                  label="Service"
                  name="serviceName"
                  defaultValue={passport.serviceName ?? ""}
                  options={registryOptions(services, "No services registered yet")}
                />
              </div>
              <div className="grow">
                <Field label="Passport number" name="passportNumber" defaultValue={passport.passportNumber} />
              </div>
              <div className="grow">
                <Field label="Passport holder name" name="holderName" defaultValue={passport.holderName} />
              </div>
              <div className="grow">
                <Field label="Contact number" name="contactNumber" defaultValue={passport.contactNumber} />
              </div>
              <div className="w-32">
                <Field label="Fee (taka)" name="fee" type="number" defaultValue={String(passport.fee)} />
              </div>
              <div className="grow md:col-span-2 lg:col-span-4">
                <Field
                  label="Comment (optional)"
                  name="comment"
                  placeholder="e.g. 2 years validity, urgent processing"
                  defaultValue={passport.comment}
                  required={false}
                  multiline
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <SubmitButton>Save changes</SubmitButton>
              <Link href={`/passports/${id}`} className={cn(buttonVariants({ variant: "ghost" }))}>
                Cancel
              </Link>
              <p className="text-xs text-muted-foreground">
                Agency, collector, visa type, and service must be registered. Changing the agency re-homes the passport
                on the dashboard of the new agency. Status, receipt date, delivery date, and delivery collector are
                managed by the status flow — they are not editable here.
              </p>
            </div>
          </form>
        </Card>
      </PageShell>
    </div>
  );
}
