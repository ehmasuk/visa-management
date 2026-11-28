import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, Field, SubmitButton } from "@/components/admin-ui";
import { createAgency, updateAgency, deleteAgency } from "@/app/actions/registry";
import { RegistryEditDialog } from "@/components/registry-edit-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Building2 } from "lucide-react";

export const metadata = { title: "Agencies — Admin" };

export default async function AgenciesPage() {
  await requireAdmin();
  const agencies = await prisma.agency.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/agencies" role="ADMIN" />
      <PageShell
        title="Agencies"
        subtitle="Client agencies used for passport entry. Agencies are records only — they do not sign in."
      >
        <Card className="mb-6 gap-0 px-4 py-4">
          <form action={createAgency} className="flex flex-wrap items-end gap-3">
            <div className="grow">
              <Field label="Agency name" name="name" placeholder="e.g. Sun Travels" />
            </div>
            <SubmitButton>Add Agency</SubmitButton>
          </form>
        </Card>

        {agencies.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 />
              </EmptyMedia>
              <EmptyTitle>No agencies yet</EmptyTitle>
              <EmptyDescription>Add the first one above.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-2">
            {agencies.map((agency) => (
              <li key={agency.id}>
                <Card size="sm" className="gap-0">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{agency.name}</span>
                    <div className="flex items-center gap-2">
                      <RegistryEditDialog
                        item={agency}
                        label="Agency name"
                        title="Edit agency"
                        description="Rename this client agency for future passport entries. Existing passports keep the name recorded at entry."
                        updateAction={updateAgency}
                      />
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
