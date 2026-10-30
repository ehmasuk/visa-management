import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, Field, SubmitButton } from "@/components/admin-ui";
import { createAgency, updateAgency, deleteAgency } from "@/app/actions/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ShieldCheckIcon } from "lucide-react";

export const metadata = { title: "Agencies — Admin" };

export default async function AgenciesPage() {
  await requireAdmin();
  const agencies = await prisma.agency.findMany({ orderBy: { name: "asc" } });
  // Gmail → count of passports owned, for the immutability hint in the UI
  const linkedCounts = await Promise.all(
    agencies.map((a) => prisma.passport.count({ where: { agencyGmail: a.gmail } }))
  );

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/agencies" role="ADMIN" />
      <PageShell
        title="Agencies"
        subtitle="Agency Gmail allow-list: only registered Gmail addresses can sign in as an agency."
      >
        <Card className="mb-6 gap-0 px-4 py-4">
          <form action={createAgency} className="flex flex-wrap items-end gap-3">
          <div className="grow">
            <Field label="Agency name" name="name" placeholder="e.g. Sun Travels" />
          </div>
          <div className="grow">
            <Field label="Gmail address" name="gmail" type="email" placeholder="agency.name@gmail.com" />
          </div>
          <SubmitButton>Allow-list agency</SubmitButton>
          </form>
        </Card>

        {agencies.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheckIcon />
            </EmptyMedia>
            <EmptyTitle>No agencies yet</EmptyTitle>
            <EmptyDescription>Allow-list the first one above.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        ) : (
          <ul className="space-y-2">
            {agencies.map((agency, i) => (
              <li key={agency.id}>
                <Card size="sm" className="gap-0">
                  <CardContent className="flex flex-wrap items-end gap-3">
                <form action={updateAgency} className="flex flex-grow items-end gap-3">
                  <input type="hidden" name="id" value={agency.id} />
                  <div className="grow md:grow-0 md:w-56">
                    <Field label="Agency name" name="name" defaultValue={agency.name} />
                  </div>
                  <div className="grow">
                    <Field label="Gmail address" name="gmail" type="email" defaultValue={agency.gmail} />
                  </div>
                  <SubmitButton variant="ghost">Save</SubmitButton>
                </form>
                <div className="flex items-end gap-2">
                  <Badge
                    variant="secondary"
                    title={linkedCounts[i] > 0 ? "Gmail is immutable while passports reference it" : undefined}
                  >
                    {linkedCounts[i]} passport{linkedCounts[i] === 1 ? "" : "s"}
                  </Badge>
                  <form action={deleteAgency}>
                    <input type="hidden" name="id" value={agency.id} />
                    <SubmitButton variant="danger">Delete</SubmitButton>
                  </form>
                </div>
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
