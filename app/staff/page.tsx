import { requireStaff } from "@/lib/guards";
import { PageShell } from "@/components/admin-ui";
import Link from "next/link";

export const metadata = { title: "Staff — Visa Management" };

export default async function StaffPage() {
  await requireStaff();

  const cards = [
    {
      href: "/staff/passports",
      label: "Passports",
      description: "Enter new passports, change statuses, edit comments.",
    },
    {
      href: "/staff/payments",
      label: "Payments",
      description: "Review and approve/reject agency payment requests.",
    },
  ];

  return (
    <PageShell title="Staff workspace" subtitle="Daily passport operations.">
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-lg border border-input bg-card p-6 shadow-sm transition-colors hover:border-primary/50"
            >
              <p className="text-sm font-semibold">{card.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
            </Link>
          ))}
        </div>
      </PageShell>
  );
}
