"use client";

import * as React from "react";
import { CalendarDays, FileText, RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { PassportCard } from "@/components/passport-card";
import { cn } from "@/lib/utils";
import {
  searchInternalPassports,
  type PassportListResult,
} from "@/app/actions/passport-search";

/**
 * Filter + paging island for the staff/admin passport desks. Mirrors the
 * admin-reports client: the server page renders the first snapshot SSR, this
 * component re-queries the (indexed) search action on debounced keystrokes
 * and day picks, merging one page at a time — the browser never loops over
 * the collection.
 */

const SEARCH_DEBOUNCE_MS = 300;

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

interface PassportListClientProps {
  /** First snapshot rendered on the server so mounting is not empty. */
  initial: PassportListResult;
  collectors: Array<{ name: string }>;
  /** The list page the card actions should redirect back to. */
  returnTo: string;
  /** Where a "no passports recorded yet" empty state points for entry. */
  emptyHint: string;
}

export function PassportListClient({
  initial,
  collectors,
  returnTo,
  emptyHint,
}: PassportListClientProps) {
  const [searchText, setSearchText] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [date, setDate] = React.useState("");

  const [result, setResult] = React.useState<PassportListResult>(initial);
  const [busy, setBusy] = React.useState(false);

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
      page: 0,
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
  }, [searchQuery, date]);

  const [page, setPage] = React.useState(0);

  const loadMore = () => {
    if (busy || result.capped || result.rows.length >= result.total) return;
    const seq = ++seqRef.current;
    setBusy(true);
    searchInternalPassports({
      q: searchQuery,
      date,
      page: page + 1,
    })
      .then((res) => {
        if (seq !== seqRef.current) return;
        setResult((prev) => ({
          ...res,
          rows: mergeRows(prev.rows, res.rows),
        }));
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

      {/* One page of cards, merged up by load-more. */}
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
      ) : (
        <ul className="space-y-3">
          {result.rows.map((passport) => (
            <li key={passport.id}>
              <PassportCard
                passport={passport}
                collectors={collectors}
                returnTo={returnTo}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Paging footer: load-more, or the deep-paging refine hint at the cap. */}
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
                {busy ? (
                  <Spinner className="size-3.5" />
                ) : null}
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
