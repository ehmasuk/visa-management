import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Field, PageShell, Select, SubmitButton } from "@/components/admin-ui";
import { createPassport } from "@/app/actions/passport";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export const metadata = { title: "Passport Entry — Staff Desk" };

export default async function StaffPassportEntryPage() {
  await requireStaff();

  const [agencies, collectors, visaTypes, services] = await Promise.all([
    prisma.agency.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.visaType.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.service.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <PageShell
      title="New Passport Entry"
      subtitle="Receive an incoming passport from a travel agency via courier."
    >
      {/* Entry form: eight required fields + optional comment. Agency/collector/
          visa type/service are selects fed from the admin registries; receipt
          date is set automatically */}
      <Card className="p-6 shadow-sm">
        <form action={createPassport}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border/60">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <PlusCircle className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                New Passport Entry
              </h2>
              <p className="text-xs text-muted-foreground">
                Receipt timestamp is recorded automatically by the system.
              </p>
            </div>
          </div>

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
                label="Intake collector (courier)"
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
                label="Service tier"
                name="serviceName"
                defaultValue=""
                options={[
                  {
                    value: "",
                    label:
                      services.length === 0
                        ? "No services registered yet"
                        : "Select a service tier",
                  },
                  ...services.map((service) => ({
                    value: service.name,
                    label: service.name,
                  })),
                ]}
              />
            </div>
            <div>
              <Field label="Passport number" name="passportNumber" placeholder="e.g. AF1234567" />
            </div>
            <div>
              <Field label="Passport holder name" name="holderName" placeholder="e.g. Mohammad Al-Amin" />
            </div>
            <div>
              <Field label="Contact number" name="contactNumber" placeholder="e.g. 017XXXXXXXX" />
            </div>
            <div>
              <Field label="Service fee (৳ Taka)" name="fee" type="number" placeholder="8500" />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <Field
                label="Operational Comment (optional)"
                name="comment"
                placeholder="e.g. 2 years validity, urgent stamping requested by agency"
                required={false}
                multiline
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
            <SubmitButton>Receive Passport at Counter</SubmitButton>
            <p className="text-xs text-muted-foreground">
              New entry initializes in <strong className="text-blue-600 dark:text-blue-400">Received</strong> status.
            </p>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
