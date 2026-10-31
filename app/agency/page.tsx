import { requireAgency } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell } from "@/components/admin-ui";
import { AgencyPassportList } from "@/components/agency-passport-list";
import { searchAgencyPassports } from "@/app/actions/passport-search";

export const metadata = { title: "Agency Portal — Visa Management" };

export default async function AgencyPage() {
  const session = await requireAgency();
  const agencyGmail = session.user.email.toLowerCase();

  // Task 6.1 — data isolation: every figure and row below is scoped to THIS
  // agency. The ribbon is four DB count() queries on indexed predicates (the
  // (agencyGmail, receiptDate) compound covers all of them); the list is one
  // page from the search action, which re-injects the session Gmail itself.
  // Nothing counts by loading the collection into JS.
  const [totalCount, receivedCount, deliveredCount, unpaidCount, initial] =
    await Promise.all([
      prisma.passport.count({ where: { agencyGmail } }),
      prisma.passport.count({ where: { agencyGmail, status: "RECEIVED" } }),
      prisma.passport.count({ where: { agencyGmail, status: "DELIVERED" } }),
      prisma.passport.count({
        where: { agencyGmail, payment: { status: "UNPAID" } },
      }),
      searchAgencyPassports({}),
    ]);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <RoleNav pathname="/agency" role="AGENCY" userLabel={session.user.name ?? session.user.email} />
      <PageShell
        title="Agency Passport Portal"
        subtitle={`Signed in as ${agencyGmail}. Self-service tracking for your submitted client passports.`}
      >
        <div className="space-y-6">
          {/* Agency Summary KPI Ribbon — all four figures are DB counts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Submitted
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                {totalCount}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                In Processing
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">
                {receivedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Delivered
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {deliveredCount}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pending Settlement
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-amber-700 dark:text-amber-300">
                {unpaidCount}
              </p>
            </div>
          </div>

          {/* Passports list — paged/searchable island, agency-scoped server-side */}
          <AgencyPassportList initial={initial} />
        </div>
      </PageShell>
    </div>
  );
}
