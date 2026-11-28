import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageShell, Field, Select, SubmitButton } from "@/components/admin-ui";
import { createPayment } from "@/app/actions/payment";
import { Card } from "@/components/ui/card";
import { fmt } from "@/lib/passport-format";

export const metadata = { title: "Payments — Staff" };

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

export default async function StaffPaymentsPage() {
  await requireStaff();

  const [agencies, collectors, payments, feeGroups, paidGroups] = await Promise.all([
    prisma.agency.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.payment.findMany({ take: 50, orderBy: { receivedAt: "desc" } }),
    prisma.passport.groupBy({ by: ["agencyName"], _sum: { fee: true } }),
    prisma.payment.groupBy({ by: ["agencyName"], _sum: { amount: true } }),
  ]);

  const feeByAgency = new Map(feeGroups.map((g) => [g.agencyName, g._sum.fee ?? 0]));
  const paidByAgency = new Map(paidGroups.map((g) => [g.agencyName, g._sum.amount ?? 0]));
  const balances = agencies.map((agency) => {
    const fees = feeByAgency.get(agency.name) ?? 0;
    const paid = paidByAgency.get(agency.name) ?? 0;
    return { name: agency.name, fees, paid, due: fees - paid };
  });

  const registryOptions = (rows: Array<{ name: string }>, emptyLabel: string) => [
    { value: "", label: rows.length === 0 ? emptyLabel : "Select" },
    ...rows.map((row) => ({ value: row.name, label: row.name })),
  ];

  return (
    <PageShell
      title="Payments"
      subtitle="Record money received from an agency via a collector. Due is the agency's total passport fees minus payments recorded here."
    >
      <div className="space-y-8">
        {/* Record a payment */}
        <Card className="gap-0 px-5 py-5">
          <h2 className="mb-4 text-sm font-bold text-foreground">Record a payment</h2>
          <form action={createPayment} className="grid gap-4 md:grid-cols-5 md:items-end">
            <div>
              <Select
                label="Agency"
                name="agencyName"
                defaultValue=""
                options={registryOptions(agencies, "No agencies registered yet")}
              />
            </div>
            <div>
              <Select
                label="Collector (brought the payment)"
                name="collectorName"
                defaultValue=""
                options={registryOptions(collectors, "No collectors registered yet")}
              />
            </div>
            <div>
              <Field label="Amount (৳)" name="amount" type="number" placeholder="40000" />
            </div>
            <div>
              <Field
                label="Number of passports"
                name="passportCount"
                type="number"
                placeholder="3"
              />
            </div>
            <div>
              <SubmitButton>Record payment</SubmitButton>
            </div>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            The payment date and the staff member receiving it are recorded automatically.
          </p>
        </Card>

        {/* Agency balances */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Agency balances</h2>
          <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Agency</th>
                  <th className="px-4 py-3">Total fees</th>
                  <th className="px-4 py-3">Payments received</th>
                  <th className="px-4 py-3">Due Fees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {balances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      No agencies registered yet.
                    </td>
                  </tr>
                ) : (
                  balances.map((row) => (
                    <tr key={row.name} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                      <td className="px-4 py-3 font-mono">{taka(row.fees)}</td>
                      <td className="px-4 py-3 font-mono">{taka(row.paid)}</td>
                      <td
                        className={`px-4 py-3 font-mono font-bold ${
                          row.due > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : row.due < 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {row.due > 0
                          ? taka(row.due)
                          : row.due < 0
                            ? `Credit ${taka(-row.due)}`
                            : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Payment history */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Recent payments</h2>
          <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Agency</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Passports</th>
                  <th className="px-4 py-3">Collector</th>
                  <th className="px-4 py-3">Received by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{fmt(payment.receivedAt)}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{payment.agencyName}</td>
                      <td className="px-4 py-3 font-mono font-bold">{taka(payment.amount)}</td>
                      <td className="px-4 py-3 tabular-nums">{payment.passportCount}</td>
                      <td className="px-4 py-3 text-muted-foreground">{payment.collectorName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{payment.receivedByName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {payments.length === 50 && (
            <p className="text-xs text-muted-foreground">Showing the 50 most recent payments.</p>
          )}
        </section>
      </div>
    </PageShell>
  );
}
