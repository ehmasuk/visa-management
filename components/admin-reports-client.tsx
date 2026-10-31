"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { STATUS_BADGE, STATUS_DOT, statusLabel } from "@/lib/passport-format";
import {
  searchReportData,
  type ReportResult,
} from "@/app/actions/reports";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Receipt,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import React from "react";

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;
const formatNum = (n: number) => n.toLocaleString("en-US");

const PAGE_SIZE = 50;
/** Delay before a keystroke becomes a server query (typing-intent throttle). */
const SEARCH_DEBOUNCE_MS = 300;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Merge load-more rows into the current page list, dropping duplicates. */
function mergeRows(prev: ReportResult["rows"], next: ReportResult["rows"]) {
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

function SkeletonCell({ wide }: { wide?: boolean }) {
  return (
    <td className="px-4 py-3.5">
      <span
        className={cn(
          "block h-3 rounded-full bg-muted animate-pulse",
          wide ? "w-16" : "w-24"
        )}
      />
    </td>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      <SkeletonCell />
      <SkeletonCell wide />
      <SkeletonCell wide />
      <SkeletonCell wide />
      <SkeletonCell />
      <SkeletonCell wide />
      <SkeletonCell />
      <SkeletonCell wide />
    </tr>
  );
}

interface AdminReportsClientProps {
  agencies: Array<{ name: string; gmail: string }>;
  /** First snapshot rendered on the server so mounting is not empty. */
  initial: ReportResult;
}

export function AdminReportsClient({
  agencies,
  initial,
}: AdminReportsClientProps) {
  const [searchText, setSearchText] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [timeWindow, setTimeWindow] = React.useState("all");
  const [date, setDate] = React.useState("");
  const [agency, setAgency] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [payment, setPayment] = React.useState("");
  const [page, setPage] = React.useState(0);

  const [result, setResult] = React.useState<ReportResult>(initial);
  const [busy, setBusy] = React.useState(false);

  // Sequence guard: only the most recent request may commit, so a slow
  // earlier query can never overwrite a newer result set.
  const seqRef = React.useRef(0);
  // The server already delivered `initial` for the default view — skip the
  // very first effect run rather than re-querying identical state on mount.
  const didMountRef = React.useRef(false);

  // Debounce keystrokes into committed search text; the timeout is cleared
  // on every change, so fast typing only ever sends the final value.
  React.useEffect(() => {
    const timer = setTimeout(
      () => setSearchQuery(searchText.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  // Server-backed search: the database filters, aggregates and paginates;
  // this component never loops over the whole collection.
  React.useEffect(() => {
    if (didMountRef.current) {
      didMountRef.current = false;
      return;
    }
    let cancelled = false;
    const seq = ++seqRef.current;
    setBusy(true);

    searchReportData({
      q: searchQuery,
      date,
      timeWindow,
      agency,
      status,
      payment,
      page,
    })
      .then((res) => {
        if (cancelled || seq !== seqRef.current) return;
        setResult((prev) =>
          page === 0 ? res : { ...res, rows: mergeRows(prev.rows, res.rows) }
        );
        setBusy(false);
      })
      .catch(() => {
        if (cancelled || seq !== seqRef.current) return;
        // Keep the previous snapshot on failure instead of blanking out.
        setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, date, timeWindow, agency, status, payment, page]);

  const flushSearch = () => setSearchQuery(searchText.trim());

  const hasActiveFilters =
    searchQuery !== "" ||
    date !== "" ||
    timeWindow !== "all" ||
    agency !== "" ||
    status !== "" ||
    payment !== "";

  const resetFilters = () => {
    setSearchText("");
    setSearchQuery("");
    setDate("");
    setTimeWindow("all");
    setAgency("");
    setStatus("");
    setPayment("");
    setPage(0);
  };

  // Any filter change re-queries from the first page.
  const change = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  const changeAgency = change<string>(setAgency);
  const changeStatus = change<string>(setStatus);
  const changePayment = change<string>(setPayment);
  // The two time mechanisms are mutually exclusive: a picked day replaces the
  // range window and vice versa. No-op writes (same value) still fall out of
  // the fetch effect because its deps do not change, so re-selecting the
  // active control never re-queries.
  const changeWindow = (id: string) => {
    setDate("");
    setTimeWindow(id);
    setPage(0);
  };
  const pickDate = (value: string) => {
    setTimeWindow("all");
    setDate(value);
    setPage(0);
  };

  const canLoadMore =
    !result.capped && result.rows.length < result.total;

  const loadMore = () => {
    if (busy || !canLoadMore) return;
    setPage((p) => p + 1);
  };

  const kpiValueClass = cn(
    "mt-3 font-mono text-3xl font-extrabold transition-opacity",
    busy ? "opacity-50" : "opacity-100"
  );
  const kpiNoteClass = cn(
    "mt-1 text-xs transition-opacity",
    busy ? "opacity-50" : "opacity-100"
  );

  return (
    <div className="space-y-6" aria-busy={busy}>
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Financial &amp; Volume Reports
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Audited passport counts and settlement totals (Paid vs. Unpaid).
          </p>
        </div>

        {hasActiveFilters && (
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto text-xs gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search field — debounced; Enter flushes immediately. Filters,
              counting and paging all happen server-side (indexed queries),
              so only the current page of rows reaches the browser. */}
          <div className="relative w-full sm:flex-1 sm:min-w-52 sm:max-w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") flushSearch();
              }}
              placeholder="Search passport no., holder name or phone…"
              aria-label="Search passports"
              className="pl-9 pr-14 h-9 rounded-xl text-xs"
              type="text"
              autoComplete="off"
            />
            <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {busy ? (
                <Spinner className="size-3.5 text-primary" />
              ) : null}
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

          <div className="h-6 w-px bg-border/80 hidden lg:block" />

          {/* Timeline Pills */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/60">
            {(
              [
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => changeWindow(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  timeWindow === t.id && date === ""
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/80 hidden sm:block" />

          {/* Specific Date Filter — picked day replaces the range pills and
              combines (AND) with agency/status/settlement/search filters. */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-40 grow">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => pickDate(e.target.value)}
                aria-label="Filter by receipt date"
                title="Show only records received on this date"
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

          {/* Agency Filter */}
          <div className="w-full sm:w-auto">
            <NativeSelect
              value={agency}
              onChange={(e) => changeAgency(e.target.value)}
              className="h-9 w-full sm:w-44 text-xs font-medium rounded-xl"
            >
              <option value="">All Agencies</option>
              {agencies.map((a) => (
                <option key={a.gmail} value={a.name}>
                  {a.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-auto">
            <NativeSelect
              value={status}
              onChange={(e) => changeStatus(e.target.value)}
              className="h-9 w-full sm:w-36 text-xs font-medium rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="DELIVERED">Delivered</option>
            </NativeSelect>
          </div>

          {/* Payment Status Filter */}
          <div className="w-full sm:w-auto">
            <NativeSelect
              value={payment}
              onChange={(e) => changePayment(e.target.value)}
              className="h-9 w-full sm:w-44 text-xs font-medium rounded-xl"
            >
              <option value="">All Settlements</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="REQUESTED">Awaiting Approval</option>
            </NativeSelect>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards (computd server-side per query) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Passports */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Passports
            </span>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="size-4" />
            </div>
          </div>
          <p className={kpiValueClass}>{formatNum(result.kpis.totalPassports)}</p>
          <p className={cn(kpiNoteClass, "text-muted-foreground")}>
            Total fee: <span className="font-mono">{taka(result.kpis.totalFees)}</span>
          </p>
        </div>

        {/* Total Paid */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Paid Volume
            </span>
            <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className={cn(kpiValueClass, "text-emerald-600 dark:text-emerald-400")}>
            {taka(result.kpis.totalPaid)}
          </p>
          <p className={cn(kpiNoteClass, "text-emerald-600/80 dark:text-emerald-400/80 font-medium")}>
            Settlement approved
          </p>
        </div>

        {/* Unpaid Count */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Unpaid Records
            </span>
            <div className="size-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <p className={cn(kpiValueClass, "text-amber-700 dark:text-amber-300")}>
            {formatNum(result.kpis.unpaidCount)}
          </p>
          <p className={cn(kpiNoteClass, "text-amber-600/80 dark:text-amber-400/80 font-medium")}>
            Awaiting full payment
          </p>
        </div>

        {/* Total Unpaid Amount */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Unpaid Balance
            </span>
            <div className="size-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
          </div>
          <p className={cn(kpiValueClass, "text-rose-600 dark:text-rose-400")}>
            {taka(result.kpis.totalUnpaid)}
          </p>
          <p className={cn(kpiNoteClass, "text-rose-600/80 dark:text-rose-400/80 font-medium")}>
            Outstanding fees
          </p>
        </div>
      </div>

      {/* Filtered Passport Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Records</h2>
          </div>
          <span
            aria-live="polite"
            className="font-mono text-xs text-muted-foreground font-semibold"
          >
            {busy ? (
              <span className="inline-flex items-center gap-1.5">
                <Spinner className="size-3.5" />
                <span>updating…</span>
              </span>
            ) : (
              <>
                {formatNum(result.rows.length)} shown of{" "}
                {formatNum(result.total)}
              </>
            )}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table
            aria-busy={busy && page === 0}
            className="w-full text-left text-xs"
          >
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Passport No.</th>
                <th className="px-4 py-3">Holder</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Intake Collector</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Fee</th>
                <th className="px-4 py-3 text-center">Settlement</th>
                <th className="px-4 py-3 text-right">Receipt Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {busy && page === 0 ? (
                // First query in flight: skeleton rows keep the layout stable
                // instead of flashing an empty table.
                Array.from({ length: 6 }, (_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} />
                ))
              ) : result.rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-xs text-muted-foreground"
                    colSpan={8}
                  >
                    No passports found
                    {searchQuery
                      ? ` for “${searchQuery}”`
                      : ""}{" "}
                    matching current filter criteria.
                  </td>
                </tr>
              ) : (
                <>
                  {result.rows.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        {p.passportNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {p.holderName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.agencyName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.collectorName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[p.status]}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${STATUS_DOT[p.status]}`}
                          />
                          {statusLabel(p.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                        {taka(p.fee)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.paymentStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="size-3" />
                            <span>Paid</span>
                          </span>
                        ) : p.paymentStatus === "REQUESTED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="size-3" />
                            <span>Awaiting</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <span>Unpaid</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {formatDate(p.receiptDate)}{" "}
                        <span className="text-[10px] opacity-75">
                          {formatTime(p.receiptDate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {busy && page > 0 && (
                    // "Load more" in flight: an appended indicator row rather
                    // than a full-table swap, so visible rows don't flicker.
                    <tr>
                      <td colSpan={8} className="px-4 py-5">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Spinner className="size-4 text-primary" />
                          <span className="text-xs font-medium">
                            Loading more records…
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
            {result.rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border/80 bg-muted/40 font-bold text-foreground">
                  <td className="px-4 py-3" colSpan={3}>
                    Total ({formatNum(result.kpis.totalPassports)} items)
                  </td>
                  <td className="px-4 py-3 text-center font-mono" colSpan={2}>
                    —
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground text-sm font-extrabold">
                    {taka(result.kpis.totalFees)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs" colSpan={2}>
                    Paid: {taka(result.kpis.totalPaid)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Load-more / end-of-results footer */}
        <div
          className={`border-t border-border/60 px-5 py-3.5 flex items-center justify-center transition-opacity ${
            busy && page === 0 ? "opacity-0" : "opacity-100"
          }`}
        >
          {result.capped ? (
            <p className="text-center text-xs text-muted-foreground">
              Showing the first {formatNum(result.rows.length)} matches — refine
              the search or filters to narrow results.
            </p>
          ) : canLoadMore ? (
            <Button
              onClick={loadMore}
              variant="outline"
              size="sm"
              disabled={busy}
              className="gap-2 text-xs"
            >
              {busy ? (
                <>
                  <Spinner className="size-3.5" />
                  <span>Loading more…</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="size-3.5" />
                  <span>
                    Load {Math.min(PAGE_SIZE, result.total - result.rows.length)}{" "}
                    more
                  </span>
                </>
              )}
            </Button>
          ) : (
            result.total > 0 && (
              <p className="text-center text-xs text-muted-foreground font-medium">
                All {formatNum(result.total)} matching records loaded
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
