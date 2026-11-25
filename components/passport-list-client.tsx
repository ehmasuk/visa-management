"use client";

import * as React from "react";
import { CalendarDays, FileText, RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { PassportCard } from "@/components/passport-card";
import { PassportTable } from "@/components/passport-table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import {
  searchInternalPassports,
  type PassportListResult,
} from "@/app/actions/passport-search";

/**
 * Filter + paging island for the staff/admin passport desks. Mirrors the
 * admin-reports client: the server page renders the first snapshot SSR, this
 * component re-queries the (indexed) search action on debounced keystrokes,
 * day picks and page changes. Only the current 20-row page is loaded and
 * rendered — the browser never loops over the collection.
 */

const SEARCH_DEBOUNCE_MS = 300;

/**
 * A short, bounded page window: first, last, and neighbours of the current
 * page, with gaps as ellipses. Keeps the control small even for 1M records.
 */
function pageWindow(current: number, count: number): Array<number | "…"> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);
  const keep = new Set([
    0,
    count - 1,
    current - 1,
    current,
    current + 1,
  ]);
  const pages = [...keep]
    .filter((p) => p >= 0 && p < count)
    .sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

/** Today in local time as YYYY-MM-DD — caps the date picker at the present. */
function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

interface PassportListClientProps {
  /** First snapshot rendered on the server so mounting is not empty. */
  initial: PassportListResult;
  collectors: Array<{ name: string }>;
  /** The list page the card actions should redirect back to. */
  returnTo: string;
  /** Where a "no passports recorded yet" empty state points for entry. */
  emptyHint: string;
  /** Staff desk confirms each stage change before submitting it. */
  confirmStatusChanges?: boolean;
  /** Staff desk uses the scanable fixed-height table; admin keeps cards. */
  view?: "cards" | "table";
}

export function PassportListClient({
  initial,
  collectors,
  returnTo,
  emptyHint,
  confirmStatusChanges = false,
  view = "cards",
}: PassportListClientProps) {
  const [searchText, setSearchText] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [date, setDate] = React.useState("");

  const [result, setResult] = React.useState<PassportListResult>(initial);
  const [busy, setBusy] = React.useState(false);
  const [page, setPage] = React.useState(0);

  // Sequence guard: only the most recent request may commit, so a slow
  // earlier query can never overwrite a newer result set.
  const seqRef = React.useRef(0);
  // The server already delivered `initial` for the default view — skip the
  // very first effect run rather than re-querying identical state on mount.
  const didMountRef = React.useRef(true);

  // Debounce keystrokes into committed search text; the timeout is cleared
  // on every change, so fast typing only ever sends the final value.
  React.useEffect(() => {
    const timer = setTimeout(
      () => setSearchQuery(searchText.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  // Server-backed search: the database filters, counts and pages; this
  // component never loops over the whole collection.
  React.useEffect(() => {
    if (didMountRef.current) {
      didMountRef.current = false;
      return;
    }
    let cancelled = false;
    const seq = ++seqRef.current;
    setBusy(true);

    searchInternalPassports({
      q: searchQuery,
      date,
      page,
    })
      .then((res) => {
        if (cancelled || seq !== seqRef.current) return;
        setResult(res);
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
  }, [searchQuery, date, page]);

  /** One page at a time — the effect above owns the single server query. */
  const goToPage = (next: number) => {
    if (busy || next < 0 || next >= result.pageCount || next === page) return;
    setPage(next);
  };

  const flushSearch = () => setSearchQuery(searchText.trim());

  const hasActiveFilters = searchQuery !== "" || date !== "";

  const resetFilters = () => {
    setSearchText("");
    setSearchQuery("");
    setDate("");
    setPage(0);
  };

  const pickDate = (value: string) => {
    setDate(value);
    setPage(0);
  };

  return (
    <div className="space-y-4" aria-busy={busy}>
      {/* Filter Controls Bar — search + receipt day only, by design */}
      <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search field — debounced; Enter flushes immediately. Filtering,
              counting and paging all happen server-side (indexed queries),
              so only the current page of rows reaches the browser. */}
          <div className="relative w-full sm:flex-1 sm:min-w-52 sm:max-w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(0);
                }}
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
              {busy ? <Spinner className="size-3.5 text-primary" /> : null}
              {searchText !== "" && (
                <button
                  onClick={() => {
                    setSearchText("");
                    setSearchQuery("");
                    setPage(0);
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

          {/* Receipt-day filter — picked day combines (AND) with search. */}
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

      {/* Count line — the database total for the applied filters. */}
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

      {/* Only the current page of rows is ever rendered. */}
      {result.rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-bold text-foreground">
            {hasActiveFilters ? "No passports match these filters" : "No passports recorded yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasActiveFilters
              ? "Try a different search, clear the date, or reset the filters."
              : emptyHint}
          </p>
        </div>
      ) : view === "table" ? (
        <PassportTable
          rows={result.rows}
          collectors={collectors}
          returnTo={returnTo}
        />
      ) : (
        <ul className="space-y-3">
          {result.rows.map((passport) => (
            <li key={passport.id}>
              <PassportCard
                passport={passport}
                collectors={collectors}
                returnTo={returnTo}
                confirmStatusChanges={confirmStatusChanges}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination — shared UI component, bounded page window. */}
      {result.rows.length > 0 && (
        <div className="space-y-1.5 pt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`?page=${result.page}`}
                  aria-disabled={busy || result.page === 0}
                  className={cn(
                    "text-xs",
                    (busy || result.page === 0) && "pointer-events-none opacity-50"
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    goToPage(result.page - 1);
                  }}
                />
              </PaginationItem>
              {pageWindow(result.page, result.pageCount).map((p, i) =>
                p === "…" ? (
                  <PaginationItem key={`gap-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`page-${p}`}>
                    <PaginationLink
                      href={`?page=${p + 1}`}
                      isActive={p === result.page}
                      size="sm"
                      aria-disabled={busy || p === result.page}
                      className={cn(
                        "min-w-8 text-xs tabular-nums",
                        (busy || p === result.page) && "pointer-events-none"
                      )}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(p);
                      }}
                    >
                      {p + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href={`?page=${result.page + 2}`}
                  aria-disabled={busy || result.page >= result.pageCount - 1}
                  className={cn(
                    "text-xs",
                    (busy || result.page >= result.pageCount - 1) &&
                      "pointer-events-none opacity-50"
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    goToPage(result.page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-center text-xs text-muted-foreground tabular-nums">
            Page {result.page + 1} of {result.pageCount.toLocaleString("en-US")} ·{" "}
            {result.total.toLocaleString("en-US")} records
          </p>
        </div>
      )}
      {result.capped && (
        <p className="text-center text-xs text-muted-foreground">
          Refine the search or pick a receipt date to reach older records beyond
          the deepest reachable page.
        </p>
      )}
    </div>
  );
}
