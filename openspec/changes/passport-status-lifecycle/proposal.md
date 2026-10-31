# Proposal

## Why

The internal pipeline jumps passports straight from "received" to "delivered", so the office's review and visa-processing steps are invisible: nothing records that a passport was examined or submitted for processing, and only two moments (receipt date, delivery date) are timestamped. Management needs the full custody timeline — when each passport was received, reviewed, submitted, and delivered — for accountability and reporting.

## What Changes

- Extend the passport status set from received/delivered to four ordered stages: **received → under review → submitted → delivered**.
- Enforce forward-only, one-stage-at-a-time transitions; a delivered passport is terminal. **BREAKING**: a direct received → delivered jump (and any backward stage move, e.g. delivered → received with its clear-delivery-recording side effect) is removed.
- A received passport shows a **"Start Review"** button; confirming moves it to under review and records the under-review timestamp automatically.
- An under-review passport shows a **"Submit"** button; confirming moves it to submitted and records the submitted timestamp automatically.
- A submitted passport shows the existing **Deliver** flow unchanged (popup assigns a registered delivery collector; delivery date is set automatically) — now reachable only from the submitted stage.
- Every milestone is timestamped on the record automatically: receipt date, under-review date, submitted date, delivery date — and the four milestones are displayed as a timeline on the internal passport detail view (submitted date is shown alongside the existing dates on passport information).
- Staff and admin home dashboards' counters and the admin report status filter are updated for the four-stage set.
- The agency dashboard shows the two new statuses for its passports.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `visa/status-delivery`: status set widens to the four ordered stages; transitions become forward-only one-stage moves confirmed via buttons; under-review and submitted timestamps are recorded automatically at transition time; delivery (with its collector rule and automatic delivery date) applies only to submitted passports; received/reviewed/submitted/delivered milestones power a timeline view.
- `agency/dashboard`: the status values shown to agencies widen from (received, delivered) to the four stages.
- `visa/passport-details`: under-review date and submitted date join status, receipt date, delivery date and delivery collector as system-managed fields the edit view ignores, and the internal detail view displays the four-milestone lifecycle timeline.

## Impact

- **Schema** (`prisma/schema.prisma`): `PassportStatus` enum gains `UNDER_REVIEW` and `SUBMITTED`; `Passport` gains nullable `underReviewDate` and `submittedDate` columns. Additive — existing records with RECEIVED/DELIVERED stay valid.
- **Server actions** (`app/actions/passport.ts`): `updatePassportStatus` becomes a stage-advance action (validates order, stamps the stage date, stamps the last editor; delivery still requires a registered delivery collector).
- **Shared formatting** (`lib/passport-format.ts`): status labels and badge colors for the four stages.
- **UI**: `components/passport-card.tsx` (next-stage buttons), `app/passports/[id]/page.tsx` (milestone timeline), `app/staff/page.tsx` + `app/admin/page.tsx` (counters), `app/agency/page.tsx` (status chips), `app/admin/reports` status options (`app/actions/reports.ts`, `components/admin-reports-client.tsx`), landing demo (`components/custody-terminal.tsx`).
- **Data**: no migration of existing values is needed; legacy passports carry empty under-review/submitted dates and render accordingly.
