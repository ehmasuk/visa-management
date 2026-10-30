# Design

## Context

The admin report at `/admin/reports` currently filters by separate "from" and "to" date inputs plus an agency select, with KPI cards, breakdowns, and charts that overlap in what they show. The reporting helpers (`lib/reports.ts`) already aggregate passport counts and paid/unpaid money by day/month/agency from inclusive local-day ranges. The `Passport` model has no branch field — Branch is a separate unlinked registry.

## Goals / Non-Goals

**Goals:**
- Report opens on all-time data with zero filter input required.
- Four time buttons: All time / Today / Last 7 days / Last 30 days (default: All time).
- Select filters for Agency, Passport status, Payment status (each default: All).
- Filters apply client-side and reset on page reload — no URL parameter storage, no query string persistence.
- Headline content: total passports, total payment received (৳), unpaid passport count, total unpaid amount (৳) — each shown once.
- Filtered passport listing table below KPI cards showing passport number, holder, agency, collector, status, fee, payment status, and receipt date/time — matching the selected filters.
- No duplicating data across the page.

**Non-Goals:**
- Charts and visualizations beyond headline numbers.
- Agency × paid/unpaid breakdown tables.
- Delivery man / deliveryCollectorName columns (deferred).
- Route, auth, or role changes.
- Database schema changes (branch field decision deferred — see Open Questions).

## Decisions

| Decision | Rationale | Alternatives considered |
|---|---|---|
| 4 time buttons instead of date pickers | Zero-effort common case; All time default shows everything immediately. | from/to date inputs (current behavior, requires picking before anything shows). |
| Default to All time | Admin wants to see everything first, then narrow down. | Default to Today (previous plan — requires a click to see historical data). |
| 4 select filters (Agency, Passport status, Payment status) | Covers the user's stated filter needs; each defaults to All. | Fewer filters (wouldn't meet stated requirements). |
| Headline-only content (4 metrics) | Simple, easy-to-understand report per user request ("that's it"). | Full KPI strip + breakdowns + table (previous plan — user now wants simpler). |
| No duplicating data | Each metric appears exactly once. | Showing same number in KPI card + table + chart (confusing). |
| Filtered passport listing table | Admins asked to see associated passports when filtering (e.g., agency A + today). | Omitting the table (would not meet user's stated need). |
| No schema change for branch | Avoids migration; branch handling deferred. | Adding branch field to Passport (deferred to Open Question). |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| All time default may return large dataset | Existing aggregation is server-side and narrow-selects; acceptable for current dataset size. |
| Passport listing table may return many rows with All time default | Table is server-filtered; pagination can be added later if needed. |
| Simpler content loses detail from previous plan | Record table and agency filter remain available for detail. |

## Migration Plan

Deploy the updated page and client component together. No data migration, schema change, or feature flag needed. Rollback is a revert of the two touched files.

## Open Questions

None.
