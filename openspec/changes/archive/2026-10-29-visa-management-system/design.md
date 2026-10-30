# Design

## Context

The project already has Next.js 16 App Router, NextAuth v5 (Google OAuth, JWT sessions), Prisma 6, and MongoDB Atlas. A `User` model exists with `email`, `name`, `image`, `emailVerified`, and `role`. Authentication and route protection are in place via `auth.ts` and `middleware.ts`. A sibling change `auth-role-model` covers the role model (ADMIN, STAFF, AGENCY) and single-admin invariant. This design builds the visa-management domain on top of that foundation. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Staff can enter passport records with agency, collector, passport details, contact number, comment, and fee; receipt date is set automatically on entry
- Staff can edit a passport's comment at any time
- Staff can change passport status and assign a collector on delivery; delivery date is set automatically on delivery
- Agencies log in with Gmail and view only their own passports
- Agencies can request payment on delivered passports; staff can approve/reject (paid/unpaid)
- Admin manages branches, agencies, collectors, staff, and the Gmail allow-list
- Admin can view metrics reports: passport counts and money collected (paid/unpaid) by day, month, or agency
- Role-based routing after login (admin / staff / agency)

**Non-Goals:**
- Physical passport tracking or shipping integration
- Email notifications beyond the login flow
- File uploads for passport scans
- Multi-currency support — fee is a numeric amount (taka) as described
- Stored/pre-computed report snapshots — reports are computed on demand from live data

## Decisions

### Passport ownership via agency Gmail
**Decision:** A Passport record references its owning agency by Gmail address string (not a foreign key to an Agency table), and agencies are identified by Gmail at login.
**Rationale:** Agencies are provisioned by admin via Gmail allow-list; using the email as the natural key keeps the model simple and avoids a separate agency lookup on every dashboard query.
**Alternatives considered:** Agency table with ObjectId reference — rejected as over-engineering for the current provisioning model.

### Role from registry, not self-asserted
**Decision:** After Google sign-in, the system looks up the user's email in the admin-defined registry (staff/agency) to determine role; the email is not trusted for role on its own.
**Rationale:** The user explicitly stated "without admin, they cannot log in" and "admin will enter agency at gmail.com... allow this on admin dashboard."
**Alternatives considered:** Deriving role from the Google profile — rejected; admin must explicitly allow-list each email.

### Auto-populated dates
**Decision:** Receipt date is set automatically on passport entry creation; delivery date is set automatically when status transitions to "delivered". Neither is user-editable.
**Rationale:** The user specified both dates should be automatic, removing manual entry error.
**Alternatives considered:** User-entered dates — rejected per the requirement.

### Comment editable anytime without audit trail
**Decision:** A passport's comment can be edited by staff at any time, overwriting the previous value without recording an edit history.
**Rationale:** Simplicity; the business did not request an audit trail for comment changes.
**Alternatives considered:** Comment edit history with timestamps — rejected; not requested.

### Single Prisma datasource (MongoDB)
**Decision:** All new models (Branch, Agency, Collector, Staff, Passport, Payment) live in the same MongoDB datasource as `User`.
**Rationale:** No new database or external dependency; consistent with existing Prisma + MongoDB setup.
**Alternatives considered:** Separate service/database — rejected; adds operational complexity.

### Payment status embedded on Passport via Payment record
**Decision:** A `Payment` record is linked to a Passport with status paid/unpaid, rather than a payment column directly on Passport.
**Rationale:** Allows an audit trail of payment requests/approvals per passport while keeping the Passport model focused on lifecycle data.
**Alternatives considered:** `paymentStatus` enum on Passport — simpler but loses request/approve history.

### Reports computed on demand
**Decision:** Admin metrics reports are computed by aggregating Passport and Payment records at request time, grouped by date range and agency.
**Rationale:** Avoids maintaining redundant summary tables; live data is always accurate.
**Alternatives considered:** Pre-computed daily summary table — rejected; adds complexity and staleness risk.

## Risks / Trade-offs

[Agency email changes break passport ownership] → If an agency's Gmail is changed in the registry, previously entered passports still reference the old email. Mitigation: treat agency email as immutable after first passport entry, or add a migration path.

[Staff role escalation via registry] → An admin could add themselves or others as staff/agency. Mitigation: admin actions are auditable; restrict admin account creation to the controlled bootstrap process from the auth-role-model change.

[Collector assignment not validated against active collectors] → A staff member could assign a collector who doesn't exist or was deleted. Mitigation: validate collector exists at status-change time.

[Comment edits are destructive] → Editing a comment overwrites the previous value with no history. Mitigation: acceptable per the requirement; revisit if audit is needed later.

[Report performance with large datasets] → Aggregating passports/payments on demand could slow as data grows. Mitigation: index on agency, createdAt, status, and paymentStatus; add pagination/date-range limits if needed.

[No object-level permission on passport edits] → Any staff member could edit any passport. Mitigation: acceptable per the business description (staff collectively manage all passports); revisit if per-staff scoping is needed later.

## Migration Plan

1. Add Branch, Agency, Collector, Staff, Passport, Payment models to `prisma/schema.prisma`; Passport gains comment, contactNumber, receiptDate, deliveryDate fields
2. Run `prisma generate` and apply schema to MongoDB
3. Update `auth.ts` signIn callback to look up email in registry and enforce allow-list
4. Update `middleware.ts` to redirect by role after login
5. Build admin registry pages (branch, agency, collector, staff CRUD + email allow-list)
6. Build staff passport entry page with comment, contact number, automatic receipt date; comment editable anytime
7. Build staff status-change page with automatic delivery date on delivery; collector required
8. Build agency dashboard with pay button and payment status
9. Build staff payment approval page (approve/reject → paid/unpaid)
10. Build admin reports page (passport counts + paid/unpaid money by day/month/agency)
11. Rollback: revert schema additions and route pages; auth.ts/middleware.ts changes are backward compatible if registry is empty

## Open Questions

- Should fee be stored as an integer (taka) or decimal to support future subunits?
- Does a collector need a Gmail/login, or is the collector name just display text for staff use?
- Should passport entry require selecting from existing agency/collector dropdowns, or free-text entry?
- Should reports support custom date ranges beyond today/yesterday/last month?
- Should comment edits eventually carry an audit trail?
