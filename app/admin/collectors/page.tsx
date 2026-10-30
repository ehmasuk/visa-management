import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, Field, SubmitButton } from "@/components/admin-ui";
import { createCollector, updateCollector, deleteCollector } from "@/app/actions/registry";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { UsersIcon } from "lucide-react";

export const metadata = { title: "Collectors — Admin" };

export default async function CollectorsPage() {
  await requireAdmin();
  const collectors = await prisma.collector.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/collectors" role="ADMIN" />
      <PageShell
        title="Collectors"
        subtitle="Name-only display records (no login) — the people who carry passports between agencies and the office."
      >
        <Card className="mb-6 gap-0 px-4 py-4">
          <form action={createCollector} className="flex flex-wrap items-end gap-3">
          <div className="grow">
            <Field label="Collector name" name="name" placeholder="e.g. Rakib Hossain" />
          </div>
          <SubmitButton>Add collector</SubmitButton>
          </form>
        </Card>

        {collectors.length === 0 ? (
          <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>No collectors yet</EmptyTitle>
            <EmptyDescription>Add the first one above.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        ) : (
          <ul className="space-y-2">
            {collectors.map((collector) => (
              <li key={collector.id}>
                <Card size="sm" className="gap-0">
                  <CardContent className="flex flex-wrap items-end gap-3">
                <form action={updateCollector} className="flex flex-grow items-end gap-3">
                  <input type="hidden" name="id" value={collector.id} />
                  <div className="grow">
                    <Field label="Collector name" name="name" defaultValue={collector.name} />
                  </div>
                  <SubmitButton variant="ghost">Save</SubmitButton>
                </form>
                <form action={deleteCollector}>
                  <input type="hidden" name="id" value={collector.id} />
                  <SubmitButton variant="danger">Delete</SubmitButton>
                </form>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </div>
  );
}
