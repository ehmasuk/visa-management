"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { PassportTable } from "@/components/passport-table";
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

interface AdminReportsClientProps {
  agencies: Array<{ name: string }>;
  branches: Array<{ name: string }>;
  collectors: Array<{ name: string }>;
  /** First snapshot rendered on the server so mounting is not empty. */
  initial: ReportResult;
}

const RETURN_TO = "/admin/reports";

export function AdminReportsClient({
  agencies,
  branches,
  collectors,
  initial,
}: AdminReportsClientProps) {
  const [searchText, setSearchText] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [timeWindow, setTimeWindow] = React.useState("all");
  const [date, setDate] = React.useState("");
  const [agency, setAgency] = React.useState("");
  const [branch, setBranch] = React.useState("");
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
      branch,
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
  }, [searchQuery, date, timeWindow, agency, branch, status, payment, page]);

  const flushSearch = () => setSearchQuery(searchText.trim());

  const hasActiveFilters =
    searchQuery !== "" ||
    date !== "" ||
    timeWindow !== "all" ||
    agency !== "" ||
    branch !== "" ||
    status !== "" ||
    payment !== "";

  const resetFilters = () => {
    setSearchText("");
    setSearchQuery("");
    setDate("");
    setTimeWindow("all");
    setAgency("");
    setBranch("");
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
  const changeBranch = change<string>(setBranch);
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
    <div className="w-full min-w-0 space-y-6" aria-busy={busy}>
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
                aria-label="Filter by received date"
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
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          {/* Branch Filter */}
          <div className="w-full sm:w-auto">
            <NativeSelect
              value={branch}
              onChange={(e) => changeBranch(e.target.value)}
              className="h-9 w-full sm:w-44 text-xs font-medium rounded-xl"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
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
              <option value="">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
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
            Marked paid by staff
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
            Still unpaid
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

      {/* Filtered Passport Table — the same surface as the staff/admin desks */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
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
                {formatNum(result.rows.length)} shown of {formatNum(result.total)}
              </>
            )}
          </span>
        </div>

        {result.rows.length === 0 && !busy ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm font-bold text-foreground">
              No passports found
              {searchQuery ? ` for “${searchQuery}”` : ""}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different search or clear the filters.
            </p>
          </div>
        ) : (
          <>
            <PassportTable
              rows={result.rows}
              collectors={collectors}
              returnTo={RETURN_TO}
            />
            {result.rows.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 px-4 py-3 text-xs">
                <span className="font-semibold text-foreground">
                  Total ({formatNum(result.kpis.totalPassports)} items)
                </span>
                <span className="font-mono text-foreground">
                  Fees: <span className="font-bold">{taka(result.kpis.totalFees)}</span>
                </span>
                <span className="font-mono text-foreground">
                  Paid:{" "}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {taka(result.kpis.totalPaid)}
                  </span>
                </span>
              </div>
            )}
          </>
        )}

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
