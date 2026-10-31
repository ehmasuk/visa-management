# Change notes — passport-list-search-date

## 5.2 Filter audit result (2026-10-31, grep sweep over `app/`)

Every passport/payment list query in `app/` is now `take`-capped and/or
bounded by a status/agency/page predicate; the three desks use the new
search actions. Findings:

| Surface | Query | Bound |
| --- | --- | --- |
| `app/actions/passport-search.ts` — staff/admin/agency desks | `passport.findMany` + `count` | `where` from search/day (+ session agency scoping for `/agency`), `take: PAGE_SIZE (50)`, `skip` clamped under `MAX_PAGES (200)` |
| `app/actions/reports.ts` — admin reports | `passport.findMany` + `count`/aggregates | status/date/agency report filters, `take: PAGE_SIZE`, deep-page cap |
| `app/admin/page.tsx` — dashboard recent queue | `passport.findMany` | `take: 5`, `orderBy: updatedAt` |
| `app/staff/page.tsx` — staff dashboard queue | `passport.findMany` | `take: 6`; KPIs via `count()` |
| `app/staff/payments/page.tsx` — payments desk | `payment.findMany` | `where: { status: "REQUESTED" }` pending queue |
| `app/agency/page.tsx` — portal ribbon (reworked) | 4 × `passport.count` | `agencyGmail` equality (+ status / `payment.status`) on the compound index |
| registries (agency, collector, staff, branch, service, visaType) and the desks' collector lists | `findMany` | small config/registry tables (tens of rows), unchanged by design |
| `components/` | — | no DB access; rows arrive via page/server-action props |

The three reworked pages call the search actions and no longer loop or
`findMany` the collection: `app/staff/passports/page.tsx` and
`app/admin/passports/page.tsx` via `searchInternalPassports`,
`app/agency/page.tsx` via `searchAgencyPassports` + DB-count ribbon. The
previously-whole-collection `findMany`s on all three were removed by this
change; admin reports, dashboards, payments desk and registry pages were
verified untouched and already bounded.

## 5.4 Walkthrough honesty notes
- Deep-paging kneecap (MAX_PAGES = 200) is protocol-level: the seeded 11-row
  DB can never reach page 199, so the refine hint is asserted via the
  `page=200 → capped:true, page:199` response rather than a clicked-through
  UI flow.
- Entry-form verification: the entry form posts a multipart FormData server
  action; this dev environment cannot invoke FormData actions over raw fetch
  (every FormData action, including the pre-existing updatePassportStatus,
  returns 500 "Connection closed"), while JSON actions work. The walkthrough
  therefore inserts the new passport directly (identical end-state:
  RECEIVED, receiptDate = now, UNPAID payment) and exercises every remaining
  step — first-page appearance on all three lists, count lines, action
  search, day narrowing, page merge, cap — over live HTTP.
- The harness's truncation quirk (fake exit -1 when piped) remains: run with
  `2>&1 > file` then read the file.
