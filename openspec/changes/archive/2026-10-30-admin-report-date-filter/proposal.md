# Proposal

## Why

The admin report's date filtering is cumbersome: admins must pick both a "from" and "to" date, and there is no quick way to view all data or common rolling windows. The displayed metrics are scattered across charts, tables, and KPI cards with overlapping data. Admins want one simple view: pick a time window, optionally filter by agency/branch/status, and see four headline numbers — total passports, total paid, unpaid count, total unpaid amount — with no duplicated data.

## What Changes

- Replace the separate from/to date inputs with 4 time buttons: All time / Today / Last 7 days / Last 30 days (default: All time).
- Add select filters for Agency, Branches, Passport status, and Payment status — each defaults to "All".
- Default time window to All time so the report renders immediately on load.
- Content: total number of passports, total payment received (৳), unpaid passport count, total unpaid amount (৳) — each exactly once, no duplicating data.
- Keep existing capabilities: agency filter, paid/unpaid split, per-passport record table.
- **BREAKING**: none — no fields, API shapes, or route contracts change; only filter defaults and control layout change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin/reports`: filter UX — 4 time buttons defaulting to All time, Agency/Branches/Passport status/Payment status selects defaulting to All, simplified KPI content (4 headline metrics) with no duplicated data.

## Impact

- `app/admin/reports/page.tsx` — default filter logic (all time when no params) and serialized payload for report data.
- `components/admin-reports-client.tsx` — 4 time buttons, 4 select filters, simplified KPI cards, record table.
- `lib/reports.ts` — no signature change; existing `passportCountReport` and `moneyReport` continue to serve the day/month/agency grouping.
