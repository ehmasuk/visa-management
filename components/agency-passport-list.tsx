"use client";

import * as React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  IdCardIcon,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { requestPayment } from "@/app/actions/payment";
import {
  searchAgencyPassports,
  type PassportListResult,
} from "@/app/actions/passport-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { STATUS_BADGE, STATUS_DOT, statusLabel } from "@/lib/passport-format";
import { cn } from "@/lib/utils";

/**
 * Filter + paging island for the agency portal. The browser never loops over
 * the collection: `searchAgencyPassports` re-verifies the session and scopes
 * every query to the acting agency's Gmail server-side (input can't widen
 * it), filtering/counting/paging in MongoDB over the (agencyGmail,
 * receiptDate) compound index. Same UX contract as the internal desks.
 */

const SEARCH_DEBOUNCE_MS = 300;

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

function fmt(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

/** Merge load-more rows into the current page list, dropping duplicates. */
function mergeRows(
  prev: PassportListResult["rows"],
  next: PassportListResult["rows"]
) {
  const seen = new Set(prev.map((row) => row.id));
  return [...prev, ...next.filter((row) => !seen.has(row.id))];
}

/** Today in local time as YYYY-MM-DD — caps the date picker at the present. */
function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

/** The agency-facing passport card (status, fee, custody trail, pay CTA). */
function AgencyPassportCard({
  passport,
}: {
  passport: PassportListResult["rows"][number];
}) {
  const payment = passport.payment;
  const paid = payment?.status === "PAID";
  const requested = payment?.status === "REQUESTED";
  // Payment self-service only makes sense once the passport is DELIVERED and
  // still UNPAID — every other state renders without the pay form.
  const showPay = passport.status === "DELIVERED" && payment?.status === "UNPAID";

  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all">
      <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm font-extrabold text-foreground">
              {passport.passportNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGE[passport.status]}`}
            >
              <span
                className={`size-1.5 rounded-full ${STATUS_DOT[passport.status]}`}
              />
              {statusLabel(passport.status)}
            </span>

            {paid ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3" />
                <span>Paid</span>
              </span>
            ) : requested ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="size-3" />
                <span>Settlement Awaiting Staff Approval</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <span>Unpaid</span>
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-foreground">
            {passport.holderName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              Fee: <strong className="font-mono text-foreground">{taka(passport.fee)}</strong>
            </span>
            <span>•</span>
            <span>Received: {fmt(passport.receiptDate)}</span>
            {passport.deliveryDate ? (
              <>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Delivered: {fmt(passport.deliveryDate)}
                </span>
              </>
            ) : null}
            {passport.deliveryCollectorName ? (
              <>
                <span>•</span>
                <span>Courier: {passport.deliveryCollectorName}</span>
              </>
            ) : null}
          </div>
        </div>

        <div>
          {showPay ? (
            <form action={requestPayment}>
              <input type="hidden" name="id" value={passport.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
              >
                <CreditCard className="size-4" />
                <span>Request Payment Approval</span>
              </button>
            </form>
          ) : null}
          {paid ? (
            <div className="text-right text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Approved {payment?.paidAt ? `on ${fmt(payment.paidAt)}` : ""}</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function AgencyPassportList({ initial }: { initial: PassportListResult }) {
  const [searchText, setSearchText] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [date, setDate] = React.useState("");

  const [result, setResult] = React.useState<PassportListResult>(initial);
  const [busy, setBusy] = React.useState(false);

  // Sequence guard: only the most recent request may commit.
  const seqRef = React.useRef(0);
  // The server already delivered `initial` — skip the first effect run.
  const didMountRef = React.useRef(true);

  React.useEffect(() => {
    const timer = setTimeout(
      () => setSearchQuery(searchText.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  React.useEffect(() => {
    if (didMountRef.current) {
      didMountRef.current = false;
      return;
    }
    let cancelled = false;
    const seq = ++seqRef.current;
    setBusy(true);

    searchAgencyPassports({ q: searchQuery, date, page: 0 })
      .then((res) => {
        if (cancelled || seq !== seqRef.current) return;
        setResult(res);
        setBusy(false);
      })
      .catch(() => {
        if (cancelled || seq !== seqRef.current) return;
        setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, date]);

  const [page, setPage] = React.useState(0);

  const loadMore = () => {
    if (busy || result.capped || result.rows.length >= result.total) return;
    const seq = ++seqRef.current;
    setBusy(true);
    searchAgencyPassports({ q: searchQuery, date, page: page + 1 })
      .then((res) => {
        if (seq !== seqRef.current) return;
        setResult((prev) => ({ ...res, rows: mergeRows(prev.rows, res.rows) }));
        setPage((p) => p + 1);
        setBusy(false);
      })
      .catch(() => {
        if (seq !== seqRef.current) return;
        setBusy(false);
      });
  };

  const flushSearch = () => setSearchQuery(searchText.trim());

  const hasActiveFilters = searchQuery !== "" || date !== "";

  const resetFilters = () => {
    setSearchText("");
    setSearchQuery("");
    setDate("");
  };

  const pickDate = (value: string) => setDate(value);

  return (
    <div className="space-y-4" aria-busy={busy}>
      {/* Filter Controls Bar — search + receipt day; scoping stays server-side */}
      <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:flex-1 sm:min-w-52 sm:max-w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") flushSearch();
              }}
              placeholder="Search passport no. or holder name…"
              aria-label="Search your passports"
              className="pl-9 pr-14 h-9 rounded-xl text-xs"
              type="text"
              autoComplete="off"
            />
            <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {busy ? <Spinner className="size-3.5 text-primary" /> : null}
              {searchText !== "" && (
                <button
                  onClick={() => {
                    setSearchText("");
                    setSearchQuery("");
                  }}
                  aria-label="Clear search"
                  className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-border/80 hidden sm:block" />

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-40 grow">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => pickDate(e.target.value)}
                aria-label="Filter by receipt date"
                title="Show only passports received on this date"
                className="pl-8 pr-2 h-9 w-full sm:w-40 rounded-xl text-xs font-medium cursor-pointer"
              />
            </div>
            {date !== "" && (
              <button
                onClick={() => pickDate("")}
                aria-label="Clear date filter"
                title="Clear date filter"
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              onClick={resetFilters}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Count line — the database total for YOUR agency under these filters */}
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-primary" />
        <p className="text-sm font-bold text-foreground">
          {"All Passports ("}
          <span
            className={cn(
              "tabular-nums transition-opacity",
              busy ? "opacity-50" : "opacity-100"
            )}
          >
            {result.total.toLocaleString("en-US")}
          </span>
          {")"}
        </p>
      </div>

      {result.rows.length === 0 ? (
        <Empty className="border border-border/80 rounded-2xl bg-card p-12">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
              <IdCardIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No passports match these filters"
                : "No passports recorded for your agency yet"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Try a different search or reset the filters."
                : "Our office staff will enter your passports here once they are received via a collector."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="space-y-4">
          {result.rows.map((passport) => (
            <li key={passport.id}>
              <AgencyPassportCard passport={passport} />
            </li>
          ))}
        </ul>
      )}

      {result.rows.length > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          {result.capped ? (
            <p className="text-xs text-muted-foreground">
              You have reached the deepest page we serve ({result.page + 1} of
              the allowed pages). Refine the search or pick a receipt date to
              reach older records.
            </p>
          ) : (
            result.rows.length < result.total && (
              <Button
                onClick={loadMore}
                variant="outline"
                size="sm"
                disabled={busy}
                className="text-xs"
              >
                {busy ? <Spinner className="size-3.5" /> : null}
                <span>
                  Load more
                  {" "}
                  ({result.rows.length.toLocaleString("en-US")} of{" "}
                  {result.total.toLocaleString("en-US")})
                </span>
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
