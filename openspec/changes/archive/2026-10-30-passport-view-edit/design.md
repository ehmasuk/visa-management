# Design

## Context

Passports live on `/staff/passports` as summary cards (`app/staff/passports/page.tsx`) with server-action forms for entry, comment edit, and status/delivery transitions (`app/actions/passport.ts`). Every action re-verifies the role via `lib/guards.ts`; `requireStaff()` bars ADMIN from the staff pages, and admin has no passport list at all (only count tiles + reports). There is no per-passport detail page. Prisma + MongoDB; the `Passport` model stores denormalized strings (`agencyGmail`, `collectorName`, `deliveryCollectorName`, `visaTypeName`, `serviceName`) and system-managed dates; `Payment` is a 1:1 relation shown on the same cards. See proposal.md for motivation, specs/visa/passport-details/spec.md for the behavior contract.

## Goals / Non-Goals

**Goals:**
- One shared internal detail view + edit form usable by both STAFF and ADMIN, behind a new `requireStaffOrAdmin()` guard.
- Last-editor attribution (role, name, email, timestamp) stamped on every passport mutation *and* at entry creation.
- An admin passports list page mirroring the staff cards, minus the staff-only entry form.
- Minimal churn: existing entry form, status flow, and comment-edit behavior stay as-is.

**Non-Goals:**
- No edit-history/audit collection — only the last editor is kept on the passport.
- Entry creation stays staff-only (`createPassport` keeps `requireStaff()`).
- No changes to the agency dashboard, payment flow, or the validation rules of entry/status delivery.
- Receipt/delivery dates and delivery-collector recording are never editable from the new edit form.

## Decisions

- **Shared routes instead of role-scoped duplicates.** New pages `app/passports/[id]/page.tsx` (read-only full detail) and `app/passports/[id]/edit/page.tsx` (edit form) guarded by `requireStaffOrAdmin()`. *Why:* one detail UI for two roles can't drift; the app's role-prefix convention stays for the *list* pages (`/staff/passports`, `/admin/passports`), while an id-scoped resource is naturally role-neutral. *Alternative rejected:* duplicating the detail page under `/admin/…` and `/staff/…`.

- **Last-editor stored denormalized on `Passport`.** New optional fields: `lastEditedByName`, `lastEditedByRole` ("STAFF" | "ADMIN"), `lastEditedByEmail`, `lastEditedAt` (DateTime, mapped snake_case like siblings). *Why:* matches the established house pattern (`AdminAudit.actorEmail/actorRole`, `deliveryCollectorName`); MongoDB enforces no referential integrity so a `User` relation buys nothing; the record should capture who performed the change *at that time* (display name/role may change later); no joins on the list queries. *Alternative rejected:* a per-edit audit collection — spec keeps only the last editor (future change if ever needed).

- **Stamping point = one helper, all mutation paths.** A small `stampEditor(data, session)` helper in `app/actions/passport.ts` applied to `createPassport` (initial editor, role STAFF), the new `updatePassportDetails`, and — per spec — also `updatePassportComment` and `updatePassportStatus`, which both switch from `requireStaff()` to `requireStaffOrAdmin()`. *Why:* the spec makes "every update refreshes the editor" one requirement covering all existing update paths, not just the new one.

- **Edit action semantics: full-form replacement with entry-grade validation.** `updatePassportDetails(formData)` re-uses the entry validation logic in-kind: registry lookups for agency/collector/visa-type/service (agency Gmail re-resolved `agencyGmail` = registry value so the ownership reference always matches the stored agency name), passport-number uniqueness via the existing unique-index lookup excluding the passport's own id, fee as non-negative whole taka, missing values rejected with the entry-style message. Posted `status`/`receiptDate`/`deliveryDate` inputs are ignored by the action (it never reads them), satisfying the "system-managed fields not editable" requirement by construction. Failure path = existing `fail()` flash + redirect pattern; success revalidates both list pages and the detail page.

- **Legacy passports render last-editor as "—".** Fields are optional so pre-existing documents stay valid after `db push`; `fmt()`-style rendering shows "—" until the first post-ship update. No backfill (acceptable: attribution starts from deployment).

- **List gating.** `/staff/passports` keeps `requireStaff()`; admin reaches passports via `/admin/passports` (`requireAdmin()`) which reuses the card rendering (View/Edit links + the existing status/comment forms so the admin can edit everything from the list too) and fed registries (collectors needed by the status form). Admin nav gets a "Passports" item; admin dashboard adds a card linking `/admin/passports`.

## Risks / Trade-offs

- [Renaming a passport number could invalidate references the office tracks externally] → Uniqueness is still enforced and the last editor makes the change traceable; number remains an informational field exactly as at entry.
- [Reassigning a passport to a different agency changes its dashboard visibility] → Intended behavior; ownership reference is always re-resolved from the registry and can only point at an allow-listed agency. Spec: edit re-validates against entry rules.
- [Lost updates under concurrent edits (no optimistic locking)] → Same trade-off as the existing comment/status actions; last editor reflects the final writer. Accept for the data volume at hand.
- [Admin gains comment/status mutation reach] → Single-admin invariant + per-action server-side role re-checks keep the surface controlled.
- [Two list pages could drift apart] → Card rendering shared via one component extracted from the current staff card markup; the entry form stays only on the staff page.

## Migration Plan

1. Add the four last-editor fields to `Passport` in `prisma/schema.prisma` (optional, indexed only where needed — none).
2. `prisma generate` + `prisma db push` (MongoDB; project has no migrations directory, same as the `deliveryCollectorName` change).
3. Deploy code; additive null-safe fields mean old documents keep reading and old code that ignores them still works. Rollback = remove fields (data loss limited to the attribution trail).
