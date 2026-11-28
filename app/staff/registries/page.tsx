import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageShell, Field, SubmitButton } from "@/components/admin-ui";
import { createAgency, createCollector } from "@/app/actions/registry";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";

export const metadata = { title: "Registries — Staff" };

export default async function StaffRegistriesPage() {
  await requireStaff();

  const [agencies, collectors] = await Promise.all([
    prisma.agency.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.collector.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <PageShell
      title="Registries"
      subtitle="Add agencies and collectors you need at the counter. Admin handles renaming and removal."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agencies */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-foreground">Agencies</h2>
          </div>
          <Card className="gap-0 px-4 py-4">
            <form action={createAgency} className="flex flex-wrap items-end gap-3">
              <div className="grow">
                <Field label="Agency name" name="name" placeholder="e.g. Sun Travels" />
              </div>
              <SubmitButton>Add agency</SubmitButton>
            </form>
          </Card>
          <ul className="space-y-2">
            {agencies.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No agencies yet — add the first one above.
              </li>
            ) : (
              agencies.map((agency) => (
                <li key={agency.id}>
                  <Card size="sm" className="gap-0">
                    <CardContent className="px-4 py-2.5 text-xs font-medium text-foreground">
                      {agency.name}
                    </CardContent>
                  </Card>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Collectors */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-foreground">Collectors</h2>
          </div>
          <Card className="gap-0 px-4 py-4">
            <form action={createCollector} className="flex flex-wrap items-end gap-3">
              <div className="grow">
                <Field label="Collector name" name="name" placeholder="e.g. Rakib Hossain" />
              </div>
              <SubmitButton>Add collector</SubmitButton>
            </form>
          </Card>
          <ul className="space-y-2">
            {collectors.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No collectors yet — add the first one above.
              </li>
            ) : (
              collectors.map((collector) => (
                <li key={collector.id}>
                  <Card size="sm" className="gap-0">
                    <CardContent className="px-4 py-2.5 text-xs font-medium text-foreground">
                      {collector.name}
                    </CardContent>
                  </Card>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
