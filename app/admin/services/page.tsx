import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, Field, SubmitButton } from "@/components/admin-ui";
import { createService, updateService, deleteService } from "@/app/actions/registry";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { BriefcaseIcon } from "lucide-react";

export const metadata = { title: "Services — Admin" };

export default async function ServicesPage() {
  await requireAdmin();
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/services" role="ADMIN" />
      <PageShell
        title="Services"
        subtitle="Services staff can pick from when entering a passport."
      >
        <Card className="mb-6 gap-0 px-4 py-4">
          <form action={createService} className="flex flex-wrap items-end gap-3">
          <div className="grow">
            <Field label="Service name" name="name" placeholder="e.g. Express Processing" />
          </div>
          <SubmitButton>Add service</SubmitButton>
          </form>
        </Card>

        {services.length === 0 ? (
          <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BriefcaseIcon />
            </EmptyMedia>
            <EmptyTitle>No services yet</EmptyTitle>
            <EmptyDescription>Add the first one above.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        ) : (
          <ul className="space-y-2">
            {services.map((service) => (
              <li key={service.id}>
                <Card size="sm" className="gap-0">
                  <CardContent className="flex flex-wrap items-end gap-3">
                <form action={updateService} className="flex flex-grow items-end gap-3">
                  <input type="hidden" name="id" value={service.id} />
                  <div className="grow">
                    <Field label="Service name" name="name" defaultValue={service.name} />
                  </div>
                  <SubmitButton variant="ghost">Save</SubmitButton>
                </form>
                <form action={deleteService}>
                  <input type="hidden" name="id" value={service.id} />
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
