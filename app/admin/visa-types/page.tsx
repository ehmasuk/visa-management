import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, Field, SubmitButton } from "@/components/admin-ui";
import { createVisaType, updateVisaType, deleteVisaType } from "@/app/actions/registry";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { StampIcon } from "lucide-react";

export const metadata = { title: "Visa Types — Admin" };

export default async function VisaTypesPage() {
  await requireAdmin();
  const visaTypes = await prisma.visaType.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/visa-types" role="ADMIN" />
      <PageShell
        title="Visa Types"
        subtitle="Visa types staff can pick from when entering a passport."
      >
        <Card className="mb-6 gap-0 px-4 py-4">
          <form action={createVisaType} className="flex flex-wrap items-end gap-3">
          <div className="grow">
            <Field label="Visa type name" name="name" placeholder="e.g. Tourist Visa" />
          </div>
          <SubmitButton>Add visa type</SubmitButton>
          </form>
        </Card>

        {visaTypes.length === 0 ? (
          <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <StampIcon />
            </EmptyMedia>
            <EmptyTitle>No visa types yet</EmptyTitle>
            <EmptyDescription>Add the first one above.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        ) : (
          <ul className="space-y-2">
            {visaTypes.map((visaType) => (
              <li key={visaType.id}>
                <Card size="sm" className="gap-0">
                  <CardContent className="flex flex-wrap items-end gap-3">
                <form action={updateVisaType} className="flex flex-grow items-end gap-3">
                  <input type="hidden" name="id" value={visaType.id} />
                  <div className="grow">
                    <Field label="Visa type name" name="name" defaultValue={visaType.name} />
                  </div>
                  <SubmitButton variant="ghost">Save</SubmitButton>
                </form>
                <form action={deleteVisaType}>
                  <input type="hidden" name="id" value={visaType.id} />
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
