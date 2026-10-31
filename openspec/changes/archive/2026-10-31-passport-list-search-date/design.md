# Design

## Context

The admin reports module (see `openspec/specs/admin/reports/spec.md`) already established the project's large-collection search pattern: an indexed server action (`app/actions/reports.ts`) filters/sorts/pages inside MongoDB with `PAGE_SIZE = 50`, `MAX_PAGES = 200` deep-paging cap, a 300 ms debounced client driving plain server-action calls with a sequence guard and load-more row merging. This change reuses that pattern verbatim rather than inventing a second one. Current pain points (verified in code): `/staff/passports` and `/admin/passports` `findMany` the whole `passports` collection; `/agency` does the same per agency AND computes its 4 ribbon figures with JS `filter`/`length` over the full agency result set. Indexes already exist for `passportNumber` (unique), `status`, `agencyName`, `agencyGmail`, `receiptDate`, and `payments.status`.

## Goals / Non-Goals

**Goals:**
- One shared UX + one shared server pattern across the three passport lists (staff desk, admin list, agency portal), search + receipt day only.
- Every list request's payload bounded by PAGE_SIZE; totals and agency ribbon figures via `count()`/aggregation.
- The agency's default browsing (no filters) filter+sort from a single compound index.

**Non-Goals:**
- No status/agency/payment dropdowns on these three lists — the user asked for search + date only (admin reports keeps the full filter set).
- No full-text/geospatial engine, no new external dependency (MongoDB is retained).
- No change to the admin reports module, dashboards, payments queue, or registry pages (audit verdict: already bounded; see Audit below).
- No delivered-date filtering — receipt day is the date the desks reason about (spec'd accordingly).

## Decisions

1. **New action module `app/actions/passport-search.ts`** (not appended to `app/actions/passport.ts`): keeps the mutating stage/entry actions and the read/search API separate; `"use server"` modules may only export async actions, so the two search actions live together with their own `PAGE_SIZE`/`MAX_PAGES` copies (constants cannot be shared out of an action module).
   - `searchInternalPassports({ q, date, page, returnTo? })` → `requireStaffOrAdmin`; `searchAgencyPassports({ q, date, page })` → `requireAgency` with `where.agencyGmail = session.user.email` injected server-side.
   - Rows return the full `Prisma.PassportGetPayload<{include:{payment:true}}>` shape (Dates ride React-flight serialization both directions) so `components/passport-card.tsx` is reused unchanged, and agency rows the same minus nothing (agency cards read a subset).
2. **Search clauses** — same semantics as reports, minus the fields each audience never sees: internal = `passportNumber startsWith (uppercased + typed)` OR `holderName contains` OR digits→`contactNumber startsWith`; agency = number + holder only. Date = reuse `parseDay` (validate `YYYY-MM-DD`, two-point `[start, next-start)` range on the `receiptDate` index, rollover rejected → ignored).
3. **Client islands, no URL state**: `components/passport-list-client.tsx` (staff/admin) and `components/agency-passport-list.tsx` mirror `admin-reports-client.tsx`: server page renders the initial snapshot (so first paint matches today's SSR), the island re-queries via the action on debounce/filter change with the same sequence-guard/setBusy/mergeRows/Reset/capped-flag behavior. Alternative considered — `searchParams` + full server re-render — rejected: 1M-scale searches would re-SSR 50 heavy cards per keystroke flush; the island updates the card list while headers/KPI shells stay mounted.
4. **Agency extraction**: the inline passport `Card` markup moves into `components/agency-passport-list.tsx` (client component hosting the filter bar + rows); the `requestPayment` form (imported server action) still works inside a client component. Ribbon KPI grid stays a server-rendered section computed by `prisma.passport.count({ where })` × 4.
5. **Index swap**: replace `@@index([agencyGmail])` with `@@index([agencyGmail, receiptDate])` — equality-prefixed compound also serves the `receiptDate desc` sort via reverse traversal, so the agency's default view and date-ranged views are index-only walks. The sole field `agencyGmail` index becomes redundant (compound prefix) — dropping it saves write amplification. `db push` is additive/one-index-swap with no data migration; rollback = push the previous schema.
   - Note: Prisma unsupported `sort: Desc` on MongoDB index fields => plain ascending pair; forward scan + reverse walk covers desc sort demand.
6. **Audit (recorded, no code)**: `admin/reports` — already this pattern. Staff/admin dashboards — `take 5/6` recent queues. Staff payments — `payment.findMany({ status: "REQUESTED" })`, indexed, drained daily by design. Registry CRUD pages — row counts of admin-managed registries (tens). `searchReportData`, `getInitialReport` — unchanged.

## Risks / Trade-offs

- [Unanchored holder-name `contains` is a collection scan at 1M] → runs in MongoDB C++ (never app memory), throttled by the 300 ms debounce, page ≤ 50; accepted cost, same as reports.
- [`skip n` is O(n) in MongoDB] → `MAX_PAGES = 200` guardrail; past cap the UI asks for a refined search.
- [Search island re-renders 50 interactive cards each query] → cards are memo-free but page-bounded; keep `PassportCard` untouched to preserve pending-state forms; if re-render cost ever shows, row-keyed memoization is a strict local optimization.
- [Two filter components drifting from reports' UX] → all three copy the same structure; a shared `useServerSearch` hook post-factoring later is optional polish, skipped now to keep the diff reviewable.
- [Agency index swap is a schema change] → verified by `prisma db push` (in-sync report) with zero data migration; registry regression covered by `prisma validate` + type check.

## Migration Plan

1. `npx prisma db push` (index swap; instant on MongoDB).
2. Ship code — pages render initial SSR snapshot, so no-JS clients degrade gracefully (they simply don't get live re-search, same as reports).
3. Rollback = revert code + `npx prisma db push` with the reverted schema file.

## Open Questions

None — page size, cap, and filter axes mirror the accepted reports implementation, and the user named the filter axes explicitly (search + date only).
