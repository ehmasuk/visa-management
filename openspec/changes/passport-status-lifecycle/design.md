# Design

## Context

Today `PassportStatus` has two values (RECEIVED, DELIVERED). `updatePassportStatus` (`app/actions/passport.ts`) accepts either direction between them, requires a registered delivery collector when the target is DELIVERED, clears delivery recording when leaving it, and stamps the last editor. The only status UI is the Deliver dialog embedded in `components/passport-card.tsx` (shared by staff/admin lists); the detail page (`app/passports/[id]/page.tsx`) lists receipt/delivery timestamps in a "Lifecycle & Timestamps" grid; dashboards count RECEIVED/DELIVERED; the admin report filters by the two statuses. MongoDB (Prisma) stores milestones as nullable DateTimes managed exclusively by server actions — no UI is allowed to post them, and the edit view's posted values for them are ignored by construction. See proposal.md for motivation and the three spec deltas for the target behavior.

## Goals / Non-Goals

**Goals:**

- A single, ordered, forward-only pipeline (received → under review → submitted → delivered) enforced in one server action, with one confirm button per stage in the shared card.
- Four milestone timestamps persisted on the passport and rendered as a timeline on the detail view (submitted date likewise shown in passport information).
- Minimal blast radius: reuse the existing in-card form pattern, `returnTo` bounce, flash errors, last-editor stamps, and `revalidateListPages`.

**Non-Goals:**

- Stage overrides/backward moves (explicitly declined by the user); no admin reset tooling.
- A transition-audit collection with actor history per milestone (the existing last-editor stamp plus milestone dates is sufficient for this change).
- Changing who can advance stages (stays STAFF + ADMIN per the passport-details spec), or any payment-rule coupling to the new stages beyond what the specs state.
- Agency-driven actions or an external API surface.

## Decisions

1. **Two additive nullable columns, no history table.** `underReviewDate` and `submittedDate` join `receiptDate`/`deliveryDate` as the four milestone fields. Alternatives: an `events` collection per transition (rejected — richer than the requested four-timestamp timeline; complicates queries the report and cards already make) or an ordered array of stamps (rejected — harder to query/index). Additive columns keep legacy records valid and the timeline renders unset milestones as "—".

2. **Enum via Prisma, order enforced in code.** Add `UNDER_REVIEW`/`SUBMITTED` to the `Prisma` enum; MongoDB imposes no DB-level enum constraint, so the authoritative gate is the transition engine. Keep a single pipeline constant in `lib/passport-format.ts` (pure module, no data access, already the status-label source): an ordered stage list plus labels so the action validates against the same map the UI renders from.

3. **One action, stage-mapped.** Keep `updatePassportStatus` (existing name — the card forms already post `id`/`status`/`returnTo`) as the single stage-advance action: resolve current stage, require the posted status to be exactly the next stage, and:
   - RECEIVED → UNDER_REVIEW: stamp `underReviewDate = now`.
   - UNDER_REVIEW → SUBMITTED: stamp `submittedDate = now` (any posted date value ignored, matching entry's receipt-date rule).
   - SUBMITTED → DELIVERED: unchanged rules — registered delivery collector from the existing popup, `deliveryDate = now`, intake collector untouched.
   - Anything else (skip, backward, delivered-again) → flash error + redirect to `returnTo`; delivered rejects everything (terminal). Every transition stamps `lastEditor*` and revalidates both list pages. Rewriting the action to force it through a whitelist *deletes* the old toggle paths, which is the breaking behavior change the proposal calls out. Alternative rejected: three per-stage actions duplicating guard/stamp/redirect logic and inviting drift.

4. **Buttons live in the shared card.** `passport-card.tsx` renders the single next-stage action for the current stage: a plain submit button (+ are-you-sure confirmation via `useFormStatus` pending state, no dialog) for review/submit, and the existing Deliver dialog only at the submitted stage. Both staff and admin lists get the controls through this shared component. Little else about the card changes (view/edit buttons, comment form, custody line stay).

5. **Timeline on the detail view.** The "Lifecycle & Timestamps" section is replaced by a vertical 4-stage timeline (stage label, icon/dot per stage, recorded timestamp or "—"). Pure server rendering, reuse `fmt`. Same data fetch that already happens — no new queries.

6. **Display maps for every consumer.** The scattered `status === "DELIVERED" ? emerald : blue` ternaries (cards, detail, agency page, admin dashboard client, staff page) become lookup maps (badge class + dot color keyed by stage) in `lib/passport-format.ts` — including fixing `statusLabel` to expand `UNDER_REVIEW` → "Under Review" (the current charAt/toLowerCase transform would mangle it). Agency page should migrate to these shared maps instead of its bespoke "Counter Received" chips.

7. **Counters and filters follow the status set.** Staff/admin dashboard stat grids switch to per-stage counts (received/under review/submitted/delivered). Admin reports' `STATUSES` whitelist and the filter `<option>` list gain the two values; the report query unchanged — `status` remains an indexed equality predicate. The public landing demo (`components/custody-terminal.tsx`) is re-styled to the 4-stage sequence, presentation-only.

## Risks / Trade-offs

- [Blast radius of an enum change touches many files] → The exhaustive grep of `RECEIVED|DELIVERED` anchors the task list; shared maps (decision 6) remove per-file ternaries going forward. Type-check plus a written checklist of touchpoints at apply time.
- [Unknown status values could be written once the enum is permissive in Prisma] → Only `updatePassportStatus` writes status, and decision 3 whitelists transitions; the UI never offers invalid options.
- [Legacy passports show gaps in the timeline] → Spec'd as unset rendering ("—"); no backfill (would invent history — worse than honest gaps).
- [Operational regression: staff can no longer flip a delivered passport back] → Accepted (user decision); a delivered passport stays terminal. Documented in proposal as breaking for that flow; nothing else consumed the toggle.
- [Deliver dialog moved to a later stage] → Agencies' "pay" button remains gated on DELIVERED (unchanged), so no payment flow is disturbed; only the internal deliver path narrows.
