# Tasks

## 1. Data & guard foundation

- [x] 1.1 Add optional last-editor fields to `Passport` in `prisma/schema.prisma` — `lastEditedByName`, `lastEditedByRole` ("STAFF"|"ADMIN"), `lastEditedByEmail`, `lastEditedAt DateTime?` with snake_case `@map`s matching sibling style — then run `prisma generate` and `prisma db push`; verify `npm run typecheck` passes and an existing passport still loads with null attribution fields.

- [x] 1.2 Add `requireStaffOrAdmin()` to `lib/guards.ts` (STAFF or ADMIN passes; AGENCY and unauthenticated redirect as existing guards do); verify with `npm run typecheck` and by calling it in a scratch page render — STAFF/ADMIN pass, AGENCY lands on `/unauthorized`.

## 2. Server actions: edit + last-editor stamping

- [x] 2.1 Add a `stampEditor` helper in `app/actions/passport.ts` that copies the acting session user's role, name, and email plus the current timestamp into the write payload; call it in `createPassport` so entry stamps the creating staff member as initial editor, with role STAFF; verify by creating an entry in the dev app — the document carries the creator's name, email, role, and entry timestamp.

- [x] 2.2 Add `updatePassportDetails(formData)` mirroring entry validation: required-field check for agency, intake collector, visa type, service, passport number, holder name, contact number, and fee; registry lookups rejecting unregistered selections (entry-style messages); fee as non-negative whole taka; passport-number uniqueness excluding the passport's own id (re-stating its own number is allowed); agency change re-resolves `agencyGmail` from the agency registry; the action never reads posted `status`/`receiptDate`/`deliveryDate`; other unset-form fields untouched; stamp last editor; `fail()`-flash + redirect on error, revalidate lists + detail page on success; verify by editing every editable field type — corrections persist, an unregistered agency/collector/visa-type/service, a duplicate number, and a negative/fractional fee each flash the entry-style error and change nothing.

- [x] 2.3 Switch `updatePassportComment` and `updatePassportStatus` from `requireStaff()` to `requireStaffOrAdmin()` and stamp last editor on both writes; verify in the dev app — comment edit by staff and a status change by an admin each refresh the last-editor record with that actor's name/role/email/time.

## 3. Shared internal detail & edit pages

- [x] 3.1 Create `app/passports/[id]/page.tsx`: `requireStaffOrAdmin()` guard first; read-only full detail of every passport field — agency name + Gmail ownership reference, intake collector, visa type, service, passport number, holder name, contact number, comment, fee, status badge, receipt date, delivery date, delivery collector, payment trail (amount/status/paid/rejected timestamps), and last-editor line (name, role, timestamp, "—" when unset); `notFound()` for unknown ids; an Edit button linking to `app/passports/[id]/edit`; verify staff and admin each see full details, an agency user is redirected to `/unauthorized`, and a bad id renders 404.

- [x] 3.2 Create `app/passports/[id]/edit/page.tsx`: same guard; form prefilled with current values for every editable field, agency/collector/visa-type/service selects fed from their registries, action pointing at `updatePassportDetails`, plus hidden passthrough of nothing system-managed; verify the form prefill matches the detail page and a successful submit returns to the detail view showing the new values and the updated last-editor line.

- [x] 3.3 Prove the system-managed-fields guarantee E2E: craft a submissions attempt carrying extra `status`/`receiptDate`/`deliveryDate` values alongside edits and verify only the editable fields change and the passport's status/dates stay as they were; verify with the detail view before/after.

## 4. List pages, cards, and navigation

- [x] 4.1 Extract a shared passport card component from the current staff card markup and add View and Edit link-buttons plus the last-editor line (name, role, timestamp, "—" when unset); use it on `/staff/passports` while keeping the entry form and inline status/comment forms staff-only; verify the staff list shows View/Edit buttons that reach the shared pages and correctly formatted last-editor lines for both legacy (—) and updated passports.

- [x] 4.2 Create `app/admin/passports/page.tsx`: `requireAdmin()` guard, same shared cards with View/Edit buttons plus the status/comment forms (collectors registry fed for the delivery select), and no entry form; verify an admin sees all passports, edits from the list, and attribution shows ADMIN after their change.

- [x] 4.3 Add admin navigation: "Passports" item in `ADMIN_ITEMS` in `components/role-nav.tsx` and a passports card on `app/admin/page.tsx` linking `/admin/passports`; verify the link appears for ADMIN in the nav and on the dashboard card, is active-highlighted on `/admin/passports`, and STAFF nav is unchanged.

## 5. Integration verification

- [ ] 5.1 Full attribution walkthrough in the dev app: staff creates an entry → staff edits fields → admin changes status → detail view and both list cards always show exactly the most recent editor with role and timestamp matching each step; verify across staff and admin accounts consecutively.

- [ ] 5.2 Role isolation check: as AGENCY, attempt `/passports/[id]` (detail) and `/passports/[id]/edit` directly — both land on `/unauthorized`; then reassign a test passport's agency in an edit and verify it now appears on the receiving agency's dashboard (new ownership Gmail) and disappears from the old one; verify the agency dashboard shows no last-editor attribution.

- [ ] 5.3 Run `npm run typecheck` and `npm run lint` clean, and exercise the edited flows once more with `prisma db push` applied from a fresh environment boot; verify no type or lint errors and the dev build serves the detail/edit/admin-list routes without runtime errors.

## Workflow follow-up

- Implement via `/opsx-apply` once these artifacts are reviewed.
- Archive the change with `/opsx-archive` after implementation and review are complete.
