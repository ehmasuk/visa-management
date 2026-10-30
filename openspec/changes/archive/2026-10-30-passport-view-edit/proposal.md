# Proposal

## Why

Passports are currently visible only to staff, and after entry the only things that can be changed are the comment and the status/delivery transition — there is no way to view a passport's full record (all captured fields, system dates, payment trail) in one place, no way to correct any other entered field, and no record of who last touched a passport. Both staff and admin operate the same business data, so both roles need view/edit access over passports, and accountability ("who was the last editor") must be recorded in the database so it survives every later change.

## What Changes

- Staff and admin get a full-detail read-only view of any passport — every stored field (agency, intake collector, visa type, service, passport number, holder name, contact number, comment, fee, status, receipt/delivery dates, delivery collector, payment trail, last editor) — reached via a **View** button on the passport lists.
- Staff and admin can edit any passport information field via an **Edit** button: agency (re-resolves its registered Gmail as the ownership reference), intake collector, visa type, service, passport number (uniqueness re-checked excluding the passport itself), passport holder name, contact number, fee (non-negative whole taka), and comment. Status changes and delivery recording stay in the existing governed flow; receipt/delivery dates remain system-managed and are never editable.
- Every passport update records the **last editor** on the passport in the DB — role (STAFF/ADMIN), name, email, and timestamp — refreshed on every mutation (details edit, comment edit, status change) and also stamped at entry creation, so each passport always shows its last editor.
- Staff passport cards show View/Edit buttons; admin gets a new passports list page with the same buttons (admin currently has no passport list at all).
- All passport mutations stay server-side with per-action role re-checks; AGENCY is unaffected (agency dashboard remains read-only plus pay).

## Capabilities

### New Capabilities

- `visa/passport-details`: Full-detail passport viewing and last-editor accountability for internal operators (STAFF/ADMIN): who may view every stored field, who may edit which fields and under which validation rules, and how the last editor (role, name, email, timestamp) is recorded and displayed on the passport.

### Modified Capabilities

- (none) — the existing `visa/passport-entry`, `visa/status-delivery`, and `agency/dashboard` requirements remain satisfied unchanged; this capability adds viewing, editing, and editor attribution on top of them.

## Impact

- **Data**: `prisma/schema.prisma` — `Passport` gains last-editor fields (editor name, role, email, timestamp; optional/null-safe), followed by a regenerate/migrate step.
- **Code**: `lib/guards.ts` (new staff-or-admin guard), `app/actions/passport.ts` (new full-field edit action; last-editor stamping on every mutation; admin admitted to passport mutations), new shared internal detail + edit pages under `app/passports/[id]`, `app/staff/passports/page.tsx` (View/Edit buttons), new `app/admin/passports` list page, `components/role-nav.tsx` (admin "Passports" item), `app/admin/page.tsx` (dashboard card link).
- **No dependency or API-surface changes** — Next.js server actions only, Prisma + MongoDB as today.
- **Out of scope**: full edit-history audit (only the last editor is kept), admin passport creation (entry form stays staff-only), any agency-facing screens.
