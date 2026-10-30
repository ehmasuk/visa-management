# Tasks

## 1. Filter controls (client)

- [x] 1.1 Replace from/to date inputs with 4 time buttons (All time / Today / Last 7 days / Last 30 days, default All time) in `components/admin-reports-client.tsx`, and verify buttons render on `/admin/reports`
- [x] 1.2 Add Agency, Branches, Passport status, Payment status select filters (each default All), and verify selecting updates report content
- [x] 1.3 Wire time buttons + selects to recompute report content on change, and verify switching windows/filters updates displayed metrics

## 2. Server default logic

- [x] 2.1 Default time window to All time when no filter params supplied in `app/admin/reports/page.tsx`, and verify all-time data loads by default with no filter input

## 3. Headline content

- [x] 3.1 Show total number of passports, total payment received (৳), unpaid passport count, total unpaid amount (৳) — each exactly once — and verify no duplicating data on the page
- [x] 3.2 Keep agency filter and per-passport record table intact for detail, and verify existing report scenarios still pass

## 4. Verification

- [x] 4.1 Run `tsc --noEmit` and `next build`, and verify both complete without errors
- [x] 4.2 Run `openspec validate --change admin-report-date-filter`, and verify validation passes

## Workflow follow-up

- If option A (add branch to Passport): create schema migration task and update `lib/reports.ts` aggregation.
- Archive the change after project review requirements are satisfied.
- Verify the archived result.

## 12. Remove PROCESSING status (2 statuses only)

- [x] 12.1 Remove PROCESSING from PassportItem type, STATUS_BADGE, and status select options
- [x] 12.2 Remove PROCESSING from lib/reports.ts PassportReportRow and aggregation logic
- [x] 12.3 Run `tsc --noEmit` and `next build`, verify both pass
- [x] 12.4 Run `openspec validate --change admin-report-date-filter`, verify validation passes

## 11. Fix agency/branch filter returning zero

- [x] 11.1 Fix agency filter: select option value must be agency name (not gmail) to match p.agencyName
- [x] 11.2 Remove branch filter: Passport model has no branch field, always returned zero
- [x] 11.3 Run `tsc --noEmit` and `next build`, verify both pass
- [x] 11.4 Run `openspec validate --change admin-report-date-filter`, verify validation passes

## 10. English-only report page

- [x] 10.1 Remove all Bengali text from report component, keep English labels only
- [x] 10.2 Run `tsc --noEmit` and `next build`, verify both pass
- [x] 10.3 Run `openspec validate --change admin-report-date-filter`, verify validation passes

## 9. Fix client-side filtering

- [x] 9.1 Add client-side filtering of passports by time window, agency, status, payment via useMemo
- [x] 9.2 Compute KPI metrics from filtered passports instead of server aggregates
- [x] 9.3 Render filtered passport list instead of all passports
- [x] 9.4 Remove unused passportRows/moneyRows/MoneyRow from props and server page
- [x] 9.5 Run `tsc --noEmit` and `next build`, verify both pass
- [x] 9.6 Run `openspec validate --change admin-report-date-filter`, verify validation passes

## 8. Remove URL filter storage (reset on reload)

- [x] 8.1 Remove useRouter/useEffect URL sync from client component
- [x] 8.2 Remove filter URL params from server page (from/to/window/agency/branch/status/payment)
- [x] 8.3 Server defaults to All time always on reload
- [x] 8.4 Run `tsc --noEmit` and `next build`, verify both pass
- [x] 8.5 Run `openspec validate --change admin-report-date-filter`, verify validation passes

## 7. Auto-filter on selection (remove submit/reset)

- [x] 7.1 Remove Filter (submit) button and Reset button from filter controls
- [x] 7.2 Add onChange/onClick handlers to time buttons and selects to auto-update URL params and re-render
- [x] 7.3 Run `tsc --noEmit` and `next build`, verify both pass
- [x] 7.4 Run `openspec validate --change admin-report-date-filter`, verify validation passes
- [x] 7.5 Fix double-click issue: replace applyFilters() calls with useEffect that syncs filter state to URL on every state change

## 6. Add filtered passport listing table

- [x] 6.1 Add passport listing table below KPI cards showing filtered passports (number, holder, agency, collector, status, fee, payment status, receipt date/time)
- [x] 6.2 Run `tsc --noEmit` and `next build`, verify both pass
- [x] 6.3 Run `openspec validate --change admin-report-date-filter`, verify validation passes

## 5. Cleanup: remove Group By and records table

- [x] 5.1 Remove Group By (বিভাজন) select from filter controls, and remove `groupBy` state/props
- [x] 5.2 Remove "Today's Passport Records" detailed records table section
- [x] 5.3 Run `tsc --noEmit` and `next build`, verify both pass
- [x] 5.4 Run `openspec validate --change admin-report-date-filter`, verify validation passes
