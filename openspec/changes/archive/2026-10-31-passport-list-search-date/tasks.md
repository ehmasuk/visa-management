# Tasks

## 1. Schema

- [x] 1.1 Swap `@@index([agencyGmail])` for the `@@index([agencyGmail, receiptDate])` compound on the `Passport` model in `prisma/schema.prisma`. Verify: `npx prisma validate` passes and `npx prisma db push` reports the database in sync.

## 2. Server search actions

- [x] 2.1 Create `app/actions/passport-search.ts` with `searchInternalPassports` (`requireStaffOrAdmin`) and `searchAgencyPassports` (`requireAgency`, agency Gmail injected server-side from the session): shared q/date/page inputs, `PAGE_SIZE = 50` + `MAX_PAGES = 200` paging (page clamp + `capped` flag), reuse of the reports file's day-range validation approach for the receipt day, full-card row shape via `include: { payment: true }`, `total` from `count()` on the applied filters. Verify: `npx tsc --noEmit` passes; a node/REPL spot check confirms the where-builder ignores blank and malformed inputs and OR-combines number prefix (upper + typed) / holder contains / contact digits (internal only).

## 3. Staff and admin desk lists

- [x] 3.1 Create `components/passport-list-client.tsx`: debounced search field (Enter flushes, clear button, spinner), receipt-day date picker (max today, clear button), Reset when active, "N passports" count from the action's `total`, load-more merge with sequence guard, and the 200-page cap rendering a "refine the search" hint. Verify: rendered on a running dev server page HTML; typing into search with a staged action POST only returns matching rows; the date picker narrows to the picked day.
- [x] 3.2 Rewire `app/staff/passports/page.tsx` and `app/admin/passports/page.tsx` to fetch PAGE_SIZE 50 + collectors + total server-side as the initial snapshot and hand the list to the island; heading counts read the database total. Verify: page HTML shows the same card layout as before with only one page of cards, count equals `count()`, and stage actions on the cards still work via the card's own forms.

## 4. Agency portal

- [x] 4.1 Rewrite `app/agency/page.tsx` ribbon counts as four DB `count()` queries (total / RECEIVED / DELIVERED / settlement-pending) scoped by the session Gmail; extract the passport cards + filter bar into `components/agency-passport-list.tsx` (client island with debounced search, receipt-day picker, Reset, load-more + cap, server-injected agency scoping, pay button only on DELIVERED with UNPAID). Verify: `npx tsc --noEmit` passes; the rendered portal HTML shows one page of cards with correct ribbon figures read from DB counts and the pay form intact on a delivered passport.
- [x] 4.2 Agency isolation check: a staged POST to `searchAgencyPassports` with a foreign agency's Gmail in the payload still returns only the acting agency's rows. Verify: harness POST shows rows scoped to the session's agency regardless of any attempted override input.

## 5. Scale and integration verification

- [x] 5.1 Search correctness over real HTTP: number-prefix search (mixed case) returns the right passport, holder-name substring works, contact-digits search works for internal users and never cross-matches the agency search, day filter returns only that day's passports, combined search+day ANDs. Verify: harness HTTP action calls assert row membership/exclusion against seeded passports on the dev server.
- [x] 5.2 Filter audit re-check: confirm by inspection that admin reports, dashboards' recent queues, the payments desk, and registry pages remain bounded/indexed (no whole-collection `findMany` outside a page or queue predicate). Verify: grep sweep over `app/` shows every passport/payment list query is `take`-capped or status-bounded, and the three reworked pages use the search actions; record the result in the change notes.
- [x] 5.3 Full-suite gate: `npx tsc --noEmit`, `npx eslint` over touched files, `npx next build`. Verify: all three come back clean.
- [x] 5.4 End-to-end walkthrough against the dev server: new passport entry appears on all three lists' first page; searching a late-entered passport number finds it through the action; picking its receipt day narrows correctly; loading one more page merges rows without duplicates; past-page kneecap at MAX_PAGES shows the refine hint. Verify: harness asserts each step over HTTP POSTs.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
