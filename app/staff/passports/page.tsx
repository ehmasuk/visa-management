import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { Field, PageShell, Select, SubmitButton } from "@/components/admin-ui";
import { createPassport } from "@/app/actions/passport";
import { PassportCard } from "@/components/passport-card";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { IdCardIcon } from "lucide-react";

export const metadata = { title: "Passports — Staff" };

export default async function StaffPassportsPage() {
  await requireStaff();

  const [passports, agencies, collectors, visaTypes, services] = await Promise.all([
    prisma.passport.findMany({ orderBy: { receiptDate: "desc" }, include: { payment: true } }),
    prisma.agency.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.visaType.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.service.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/staff/passports" role="STAFF" />
      <PageShell
        title="Passports"
        subtitle="Enter passports received from agencies via collectors; track status, dates, and comments."
      >
        {/* Entry form: eight required fields + optional comment. Agency/collector/
            visa type/service are selects fed from the admin registries; receipt
            date is set automatically */}
        <Card className="mb-8 gap-0 px-5 py-5">
          <form action={createPassport}>
          <h2 className="mb-4 text-lg font-semibold">New passport entry</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Select
                label="Agency name"
                name="agencyName"
                defaultValue=""
                options={[
                  {
                    value: "",
                    label:
                      agencies.length === 0 ? "No agencies registered yet" : "Select an agency",
                  },
                  ...agencies.map((agency) => ({ value: agency.name, label: agency.name })),
                ]}
              />
            </div>
            <div>
              <Select
                label="Collector (brought the passport)"
                name="collectorName"
                defaultValue=""
                options={[
                  {
                    value: "",
                    label:
                      collectors.length === 0
                        ? "No collectors registered yet"
                        : "Select a collector",
                  },
                  ...collectors.map((collector) => ({
                    value: collector.name,
                    label: collector.name,
                  })),
                ]}
              />
            </div>
            <div>
              <Select
                label="Visa type"
                name="visaTypeName"
                defaultValue=""
                options={[
                  {
                    value: "",
                    label:
                      visaTypes.length === 0
                        ? "No visa types registered yet"
                        : "Select a visa type",
                  },
                  ...visaTypes.map((visaType) => ({
                    value: visaType.name,
                    label: visaType.name,
                  })),
                ]}
              />
            </div>
            <div>
              <Select
                label="Service"
                name="serviceName"
                defaultValue=""
                options={[
                  {
                    value: "",
                    label:
                      services.length === 0
                        ? "No services registered yet"
                        : "Select a service",
                  },
                  ...services.map((service) => ({
                    value: service.name,
                    label: service.name,
                  })),
                ]}
              />
            </div>
            <div className="grow">
              <Field label="Passport number" name="passportNumber" placeholder="e.g. AF1234567" />
            </div>
            <div className="grow">
              <Field label="Passport holder name" name="holderName" placeholder="e.g. Md. Rahim" />
            </div>
            <div className="grow">
              <Field label="Contact number" name="contactNumber" placeholder="e.g. 017XXXXXXXX" />
            </div>
            <div className="grow md:col-span-2 lg:col-span-2">
              <Field
                label="Comment (optional)"
                name="comment"
                placeholder="e.g. 2 years validity, urgent processing"
                required={false}
                multiline
              />
            </div>
            <div className="w-32">
              <Field label="Fee (taka)" name="fee" type="number" placeholder="3500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <SubmitButton>Receive passport</SubmitButton>
            <p className="text-xs text-muted-foreground">
              Receipt date is set automatically. New entries start as <strong>Received</strong>.
            </p>
          </div>
          </form>
        </Card>

        <h2 className="mb-3 text-lg font-semibold">
          All passports <span className="text-sm font-normal text-muted-foreground">({passports.length})</span>
        </h2>
        {passports.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IdCardIcon />
              </EmptyMedia>
              <EmptyTitle>No passports recorded yet</EmptyTitle>
              <EmptyDescription>
                Enter the first passport above — it will appear here with its status and
                payment trail.
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
      </PageShell>
    </div>
  );
}
