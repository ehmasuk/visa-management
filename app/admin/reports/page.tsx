import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, Field, Select, SubmitButton } from "@/components/admin-ui";
import {
  passportCountReport,
  moneyReport,
  parseGroupBy,
} from "@/lib/reports";

// Reports are computed on demand from live data (recorded assumption),
// so never serve a cached render.
export const dynamic = "force-dynamic";
export const metadata = { title: "Reports — Admin" };

const GROUP_OPTIONS = [
  { value: "day", label: "By day" },
  { value: "month", label: "By month" },
  { value: "agency", label: "By agency" },
];

const taka = (n: number) => `৳${n.toLocaleString("en-US")}`;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; from?: string; to?: string; agency?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const groupBy = parseGroupBy(sp.group);
  const from = typeof sp.from === "string" ? sp.from : "";
  const to = typeof sp.to === "string" ? sp.to : "";
  const agencyGmail = typeof sp.agency === "string" ? sp.agency : "";

  const [agencies, passportRows, moneyRows] = await Promise.all([
    prisma.agency.findMany({ orderBy: { name: "asc" }, select: { name: true, gmail: true } }),
    passportCountReport({ groupBy, from, to, agencyGmail }),
    moneyReport({ groupBy, from, to, agencyGmail }),
  ]);

  const passportTotal = passportRows.reduce((sum, row) => sum + row.count, 0);
  const moneyGrand = moneyRows.reduce(
    (acc, row) => ({
      paid: acc.paid + row.paidTotal,
      unpaid: acc.unpaid + row.unpaidTotal,
      paidCount: acc.paidCount + row.paidCount,
      unpaidCount: acc.unpaidCount + row.unpaidCount,
    }),
    { paid: 0, unpaid: 0, paidCount: 0, unpaidCount: 0 }
  );

  const scopeAgency =
    agencyGmail && agencies.find((a) => a.gmail === agencyGmail)?.name;

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/admin/reports" role="ADMIN" />
      <PageShell
        title="Reports"
        subtitle="Passport volumes and money collected (paid vs unpaid), grouped by day, month, or agency."
      >
        {/* Task 8.3 — date range + agency filters (plain GET form, no JS) */}
        <form
          method="get"
          action="/admin/reports"
          className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-input bg-card p-4"
        >
          <div className="w-36">
            <Select label="Group by" name="group" defaultValue={groupBy} options={GROUP_OPTIONS} />
          </div>
          <Field label="From date" name="from" type="date" defaultValue={from} required={false} />
          <Field label="To date" name="to" type="date" defaultValue={to} required={false} />
          <div className="w-56">
            <Select
              label="Agency"
              name="agency"
              defaultValue={agencyGmail}
              options={[
                { value: "", label: "All agencies" },
                ...agencies.map((agency) => ({ value: agency.gmail, label: agency.name })),
              ]}
            />
          </div>
          <SubmitButton>Apply filters</SubmitButton>
        </form>

        <p className="mb-4 text-xs text-muted-foreground">
          Showing{" "}
          <strong>{GROUP_OPTIONS.find((option) => option.value === groupBy)?.label.toLowerCase()}</strong>{" "}
          · <strong>{from && to ? `${from} → ${to}` : from ? `from ${from}` : to ? `until ${to}` : "all time"}</strong> ·{" "}
          <strong>{scopeAgency ?? "all agencies"}</strong>
          {scopeAgency ? null : ""}
        </p>

        {/* Task 8.1 — passport count report */}
        <section className="mb-8 rounded-lg border border-input bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Passports collected</h2>
          {passportRows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-input p-6 text-center text-sm text-muted-foreground">
              No passports in the selected period.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-input text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">{groupBy === "agency" ? "Agency" : "Date"}</th>
                  <th className="py-2 font-medium">Passports</th>
                </tr>
              </thead>
              <tbody>
                {passportRows.map((row) => (
                  <tr key={row.key} className="border-b border-input/50 last:border-0">
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className="py-2 font-semibold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-input font-semibold">
                  <td className="py-2 pr-4">Total</td>
                  <td className="py-2">{passportTotal}</td>
                </tr>
              </tfoot>
            </table>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Passports are grouped by their receipt date (when they were collected).
          </p>
        </section>

        {/* Task 8.2 — money collected report, paid vs unpaid separately */}
        <section className="rounded-lg border border-input bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Money collected</h2>
          {moneyRows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-input p-6 text-center text-sm text-muted-foreground">
              No payment requests in the selected period.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-input text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">{groupBy === "agency" ? "Agency" : "Date"}</th>
                  <th className="py-2 pr-4 font-medium">Paid (৳)</th>
                  <th className="py-2 pr-4 font-medium">Unpaid (৳)</th>
                  <th className="py-2 font-medium">Requests</th>
                </tr>
              </thead>
              <tbody>
                {moneyRows.map((row) => (
                  <tr key={row.key} className="border-b border-input/50 last:border-0">
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className="py-2 pr-4 font-semibold text-emerald-700">{taka(row.paidTotal)}</td>
                    <td className="py-2 pr-4 font-semibold text-amber-700">{taka(row.unpaidTotal)}</td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {row.paidCount} paid · {row.unpaidCount} unpaid
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-input font-semibold">
                  <td className="py-2 pr-4">Total</td>
                  <td className="py-2 pr-4 text-emerald-700">{taka(moneyGrand.paid)}</td>
                  <td className="py-2 pr-4 text-amber-700">{taka(moneyGrand.unpaid)}</td>
                  <td className="py-2 text-xs font-normal text-muted-foreground">
                    {moneyGrand.paidCount} paid · {moneyGrand.unpaidCount} unpaid
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Payment requests are grouped by their request date. Unpaid includes rejected
            requests not yet re-submitted — that money is still outstanding.
          </p>
        </section>
      </PageShell>
    </div>
  );
}
