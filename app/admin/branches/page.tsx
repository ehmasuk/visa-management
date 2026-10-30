import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, Field, SubmitButton } from "@/components/admin-ui";
import { createBranch, updateBranch, deleteBranch } from "@/app/actions/registry";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Building2Icon } from "lucide-react";

export const metadata = { title: "Branches — Admin" };

export default async function BranchesPage() {
  await requireAdmin();
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/branches" role="ADMIN" />
      <PageShell
        title="Branches"
        subtitle="Branch office records of the business."
      >
        <Card className="mb-6 gap-0 px-4 py-4">
          <form action={createBranch} className="flex flex-wrap items-end gap-3">
          <div className="grow">
            <Field label="Branch name" name="name" placeholder="e.g. Uttara Branch" />
          </div>
          <SubmitButton>Add branch</SubmitButton>
          </form>
        </Card>

        {branches.length === 0 ? (
          <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>No branches yet</EmptyTitle>
            <EmptyDescription>Add the first one above.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        ) : (
          <ul className="space-y-2">
            {branches.map((branch) => (
              <li key={branch.id}>
                <Card size="sm" className="gap-0">
                  <CardContent className="flex flex-wrap items-end gap-3">
                <form action={updateBranch} className="flex flex-grow items-end gap-3">
                  <input type="hidden" name="id" value={branch.id} />
                  <div className="grow">
                    <Field label="Branch name" name="name" defaultValue={branch.name} />
                  </div>
                  <SubmitButton variant="ghost">Save</SubmitButton>
                </form>
                <form action={deleteBranch}>
                  <input type="hidden" name="id" value={branch.id} />
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
