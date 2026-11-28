"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/passport-format";
import {
  searchAgencyPayments,
  type AgencyPaymentResult,
} from "@/app/actions/agency-payments";
import {
  CalendarDays,
  FileText,
  Receipt,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;
const formatNum = (n: number) => n.toLocaleString("en-US");
const SEARCH_DEBOUNCE_MS = 300;

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

const KPI_VALUE = "mt-2 font-mono text-2xl font-extrabold tracking-tight";
const KPI_NOTE = "mt-1 text-xs text-muted-foreground";

export function AdminPaymentsClient({ initial }: { initial: AgencyPaymentResult }) {
  const [searchText, setSearchText] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [timeWindow, setTimeWindow] = React.useState("all");
  const [date, setDate] = React.useState("");
  const [page, setPage] = React.useState(0);

  const [result, setResult] = React.useState<AgencyPaymentResult>(initial);
  const [busy, setBusy] = React.useState(false);

  const seqRef = React.useRef(0);
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
    searchAgencyPayments({ q: searchQuery, timeWindow, date, page })
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
  }, [searchQuery, timeWindow, date, page]);

  const hasActiveFilters =
    searchQuery !== "" || timeWindow !== "all" || date !== "";

  const resetFilters = () => {
    setSearchText("");
    setSearchQuery("");
    setDate("");
    setTimeWindow("all");
    setPage(0);
  };

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

  return (
    <div className="w-full min-w-0 space-y-6" aria-busy={busy}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Agency Payments
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Payments received per agency, with fees and outstanding dues for the selected period.
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
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:flex-1 sm:min-w-52 sm:max-w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(0);
              }}
              placeholder="Search agency…"
              aria-label="Search agencies"
              className="pl-9 pr-10 h-9 rounded-xl text-xs"
              autoComplete="off"
            />
            {searchText !== "" && (
              <button
                onClick={() => {
                  setSearchText("");
                  setSearchQuery("");
                  setPage(0);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/60">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => changeWindow(option.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all",
                  timeWindow === option.id && date === ""
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-40 grow">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => pickDate(e.target.value)}
                aria-label="Filter by date"
                className="pl-8 pr-2 h-9 w-full sm:w-40 rounded-xl text-xs font-medium cursor-pointer"
              />
            </div>
            {date !== "" && (
              <button
                onClick={() => pickDate("")}
                aria-label="Clear date"
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Passport Fees
          </span>
          <p className={cn(KPI_VALUE, "text-blue-600 dark:text-blue-400")}>
            {taka(result.kpis.totalFees)}
          </p>
          <p className={KPI_NOTE}>
            {formatNum(result.kpis.totalPassports)} passports in period
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Payments Received
          </span>
          <p className={cn(KPI_VALUE, "text-emerald-600 dark:text-emerald-400")}>
            {taka(result.kpis.totalPaid)}
          </p>
          <p className={KPI_NOTE}>Recorded in selected period</p>
        </div>
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Total Due
          </span>
          <p className={cn(KPI_VALUE, "text-rose-600 dark:text-rose-400")}>
            {taka(result.kpis.totalDue)}
          </p>
          <p className={KPI_NOTE}>Fees minus payments received</p>
        </div>
      </div>

      {/* Agency summary */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Agency wise summary</h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Passports</th>
                <th className="px-4 py-3">Fees</th>
                <th className="px-4 py-3">Payments</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Last payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {result.agencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No agencies match this filter.
                  </td>
                </tr>
              ) : (
                result.agencies.map((agency) => (
                  <tr key={agency.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{agency.name}</td>
                    <td className="px-4 py-3 tabular-nums">{agency.passportCount}</td>
                    <td className="px-4 py-3 font-mono">{taka(agency.totalFees)}</td>
                    <td className="px-4 py-3 font-mono">
                      {taka(agency.totalPaid)}
                      <span className="block text-[10px] text-muted-foreground">
                        {formatNum(agency.paymentCount)} payment(s)
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 font-mono font-bold",
                        agency.due > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : agency.due < 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                      )}
                    >
                      {agency.due > 0
                        ? taka(agency.due)
                        : agency.due < 0
                          ? `Credit ${taka(-agency.due)}`
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmt(agency.lastPaymentAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment records */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-foreground">Payment records</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {busy ? "updating…" : `${formatNum(result.totalRecords)} total`}
          </span>
        </div>
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
              {result.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No payments in this period.
                  </td>
                </tr>
              ) : (
                result.records.map((payment) => (
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

        {result.capped ? (
          <p className="text-xs text-muted-foreground">
            Deep paging limit reached — refine the filters to see older records.
          </p>
        ) : (
          <div className="flex items-center justify-center gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={busy || result.page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="text-xs"
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground font-mono">
              {result.page + 1} / {result.pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || result.page + 1 >= result.pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs"
            >
              {busy ? <Spinner className="size-3.5" /> : null}
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
