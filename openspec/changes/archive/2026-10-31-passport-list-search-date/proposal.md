# Proposal

## Why

The passport lists at `/staff/passports`, `/admin/passports`, and `/agency` currently `findMany` the entire collection and render every record server-side with no search and no date filter. They also count KPIs (agency ribbon) in JavaScript over the full result. At the stated target volume of 1M passports (built up over years of daily entries) these pages collapse on payload size, render time, and memory long before any user can "filter out their preferred passport." The admin reports module already proves a database-side search pattern (indexed predicates, one page per request, debounced client); the remaining passport surfaces need the same treatment — minus the extra filter axes the desk pages don't need.

## What Changes

- Add a shared filter bar (free-text search + receipt-day date picker + reset) to the staff passport desk, the admin passport list, and the agency passport portal.
- Search matches passport number (prefix, ahead of the unique index), holder name, and — for internal users — contact number digits, evaluated entirely in MongoDB, never in the browser.
- Serve every list as ONE page of ~50 rows per request, server-filtered and server-sorted with load-more paging capped at 200 pages; total counts come from `count()` on the same indexed predicates.
- **BREAKING (rendering only)**: list pages no longer render the whole collection server-side — the counts under card lists change from "rows in DB on this render" to the database total, and a fourth page of data requires load-more rather than scrolling/SSR.
- Agency ribbon KPIs (total / in-processing / delivered / settlement-pending) become DB count queries instead of JS loops over all agency passports.
- Replace the agency's single-field `agencyGmail` index with a `(agencyGmail, receiptDate)` compound so the agency's default listing filters AND sorts from one index.
- Audit result (no code change needed): admin/reports search, dashboards' recent queues (`take 5/6`), and the staff payments queue (`status: REQUESTED` only, indexed) are already bounded/indexed; registry CRUD pages are bounded small. Documented in design.

## Capabilities

### New Capabilities
- `visa/passport-browse`: the searchable, dated, paginated passport list surfaces used by staff (`/staff/passports`) and admin (`/admin/passports`) — filter semantics, server-side execution, and scale guarantees.

### Modified Capabilities
- `agency/dashboard`: the agency's passport list gains the same search + receipt-day filter and becomes a server-paged view; "sees only its own passports" is preserved server-side (the acting Gmail is injected by the action, never taken from client input); ribbon counts move to database aggregation.

## Impact

- `app/staff/passports/page.tsx`, `app/admin/passports/page.tsx`, `app/agency/page.tsx` — switch to initial-snapshot + client island.
- New `app/actions/passport-search.ts` (internal + agency search actions; PAGE_SIZE/MAX_PAGES like `app/actions/reports.ts`).
- New client components: shared internal list island (`components/passport-list-client.tsx`) and agency list island (`components/agency-passport-list.tsx`); existing `components/passport-card.tsx` reused unchanged.
- `prisma/schema.prisma` — one index swap + `prisma db push` (no data change).
- No API/dependency changes; auth guards unchanged (`requireStaffOrAdmin` re-verified inside actions).
