import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, Field, SubmitButton } from "@/components/admin-ui";
import { createStaff, deleteStaff } from "@/app/actions/registry";
import { StaffEditDialog } from "@/components/staff-edit-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { UserRoundIcon } from "lucide-react";

export const metadata = { title: "Staff — Admin" };

export default async function StaffPage() {
  await requireAdmin();
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/staff" role="ADMIN" />
      <PageShell
        title="Staff"
        subtitle="Staff Gmail allow-list: registered staff Gmail addresses sign in to /staff."
      >
        <Card className="mb-6 gap-0 px-4 py-4">
          <form action={createStaff} className="flex flex-wrap items-end gap-3">
          <div className="grow">
            <Field label="Staff name" name="name" placeholder="e.g. Sumaiya Akter" />
          </div>
          <div className="grow">
            <Field label="Gmail address" name="gmail" type="email" placeholder="staff.name@gmail.com" />
          </div>
          <SubmitButton>Allow-list staff</SubmitButton>
          </form>
        </Card>

        {staff.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRoundIcon />
            </EmptyMedia>
            <EmptyTitle>No staff members yet</EmptyTitle>
            <EmptyDescription>Allow-list the first one above.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        ) : (
          <ul className="space-y-2">
            {staff.map((member) => (
              <li key={member.id}>
                <Card size="sm" className="gap-0">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground">{member.name}</span>
                      <span className="block text-xs text-muted-foreground">{member.gmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StaffEditDialog member={member} />
                      <form action={deleteStaff}>
                        <input type="hidden" name="id" value={member.id} />
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
