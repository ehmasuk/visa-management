# Tasks

## 1. Schema and shared status model

- [ ] 1.1 Add `UNDER_REVIEW` and `SUBMITTED` to the `PassportStatus` enum and nullable `underReviewDate` / `submittedDate` DateTime columns to the `Passport` model in `prisma/schema.prisma` (status index untouched). Verify: `npx prisma db push` reports the database in sync and `npx prisma validate` passes.
- [ ] 1.2 Extend `lib/passport-format.ts` with the ordered stage pipeline (received → under review → submitted → delivered), a next-stage lookup, underscore-safe `statusLabel` ("UNDER_REVIEW" → "Under Review"), and badge-class + badge-dot color maps for all four stages. Verify: `npx tsc --noEmit` passes and the maps cover every enum value in a quick node/REPL spot check.

## 2. Stage-advance action

- [ ] 2.1 Rework `updatePassportStatus` in `app/actions/passport.ts` into the ordered pipeline: reject anything that is not exactly one forward stage (skip, backward, or re-advance from delivered — each with a clear flash message), stamp `underReviewDate` / `submittedDate` to the transition timestamp on those stages while ignoring any posted date values, keep the delivery collector + automatic delivery date rules for DELIVERED (intake collector untouched), stamp the last editor on every transition, and redirect to the posting list via `returnTo`. Verify: `npx tsc --noEmit` passes; POSTing a skip/backward/delivered-transition from a scratch curl or test form shows the flash error and leaves the record unchanged (checkable via the staff list).

## 3. Shared card and passport detail view

- [ ] 3.1 Update `components/passport-card.tsx` to render exactly one next-stage action per current stage — "Start Review" (received) and "Submit" (under review) as inline `<form action={updatePassportStatus}>` posts carrying hidden `id` / `status` / `returnTo` with a pending-state button, and the existing courier-select Deliver dialog only on submitted passports — and no lifecycle action once delivered; switch badge/dot styling to the shared maps. Verify: on the staff and admin passport lists a fresh entry shows only "Start Review", and after each advance exactly the next action is offered, vanishing after delivery.
- [ ] 3.2 Replace the detail page's "Lifecycle & Timestamps" grid in `app/passports/[id]/page.tsx` with the four-stage custody timeline (stage label, per-stage dot/icon, `fmt` timestamp or "—" for unreached stages; submitted date visible alongside receipt and delivery), and render the status chip with the shared dot map. Verify: the detail view of a new passport shows received timestamp with the other three "—"; a delivered passport shows all four timestamps in stage order.

## 4. Dashboards, agency view, reports, landing

- [ ] 4.1 Update the staff dashboard counters in `app/staff/page.tsx` to the four stages (received, under review, submitted, delivered) and fix the recent-queue card chips to use the shared label/dot maps. Verify: the dashboard shows counts per stage that move as a passport is advanced.
- [ ] 4.2 Update `components/admin-dashboard-client.tsx` status type and badge logic to the four-stage union with shared labels/colors. Verify: the admin dashboard chip text reads "Under Review" / "Submitted" correctly.
- [ ] 4.3 Switch `app/agency/page.tsx` status chips to the shared badge/dot maps so agencies see all four stages (keeping "pay" on delivered only). Verify: an agency account sees an "Under Review" and a "Submitted" chip on their passports across the stages.
- [ ] 4.4 Add the two new values to the reports status whitelist in `app/actions/reports.ts` and to the status filter options in `components/admin-reports-client.tsx`, and use the shared badge maps for table rows. Verify: filtering the report by "Under Review" and "Submitted" returns and displays those passports; row chips read correctly.
- [ ] 4.5 Update `components/custody-terminal.tsx` (public landing demo) to the four-stage sequence. Verify: the landing page renders all four stages in order.

## 5. Integration verification

- [ ] 5.1 Run `npx tsc --noEmit`, `npx eslint` over the touched files, and `npx next build`; fix anything they surface.
- [ ] 5.2 Walk the full lifecycle against the dev server: enter a passport (received) → "Start Review" → "Submit" → "Deliver" with courier selection from the popup → delivered; then confirm the delivered record offers no lifecycle action, every list reflects the stage, the timeline shows all four timestamps, the agency dashboard chips update, and legacy passports (never reviewed/submitted) render their gaps as unset rather than erroring.
