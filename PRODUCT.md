# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary — Staff (STAFF):** office employees of a visa-processing business. Their daily job is the heavy lifting: enter passports received from agencies via collectors, move passports through statuses, assign the delivery collector at delivery, and mark payments paid or unpaid.
- **Admin (ADMIN):** the owner/manager. A single active admin account exists by design (controlled bootstrap, audited recovery). The admin manages registries and reads money/volume reports; they do not do the day-to-day entry.

## Product Purpose

Replace informal, manual tracking of passport intake/delivery/payment with a role-gated web system. The business receives passports from client agencies through collectors; staff record each entry, track status to delivery, and mark payment paid or unpaid. Success: staff record every passport accurately with minimal friction and the owner can see money collected (paid vs unpaid) over time.

## Positioning

Internal operations system, not a storefront. Its distinctive mechanism is registry-gated identity (only the bootstrapped admin and emails in the staff registry can sign in) combined with chain-of-custody tracking that keeps the intake collector (who brought the passport in) separate from the delivery collector (delivery man), with receipt/delivery dates stamped by the system, never typed. A neighboring product could copy the idea of staff tracking, but not this custody model + allow-list policy without rebuilding the same registries.

## Operating Context

- Visa-processing office serving multiple client agencies; passports are physically sent via collectors, so tracking mirrors real-world custody.
- Money is settled **outside** the system (in person, e.g. cash or transfer). The app records only a simple paid/unpaid state that staff or the admin set directly on any passport; there are no external payment actors.
- Fees are recorded in Bangladeshi taka (৳). The interface currently ships in English; **the confirmed product direction is to convert the interface to Bengali only.**
- Passport lifecycle is fixed: RECEIVED → UNDER_REVIEW → SUBMITTED → DELIVERED, with receipt date set automatically on entry and delivery date set automatically on the transition to DELIVERED.

## Capabilities and Constraints

Confirmed functionality:

- Staff passport entry: agency name, branch office, intake collector, passport number (unique), holder name, contact number, comment, fee, plus registry-backed visa type and service selections. Branches are admin-created; staff choose from them.
- Staff status/delivery flow: status transitions, delivery collector assigned at delivery, comment editable at any time; last editor (name/role/email/time) stamped on every passport mutation.
- Payment: one record per passport, default unpaid; staff or admin flip it to paid or back to unpaid at any time; the amount always follows the current fee.
- Admin registries: branches, agencies (name-only client records), collectors, visa types, services (selectable at entry), and staff (Gmail allow-list with role). Staff may add agencies and collectors from their own registries page; renaming and removal stay admin-only.
- Admin reports: passport counts and money totals (paid/unpaid) by day, month, or agency; plus audit trail (AdminAudit) for admin recovery and authorized role changes.

Constraints:

- Sign-in is Google OAuth only, restricted to the bootstrap admin and staff records. Only ADMIN and STAFF roles exist. JWT sessions, 24-hour rolling window.
- Exactly one active ADMIN account, created via controlled bootstrap from a configured verified Google email; regular screens never offer ADMIN as an assignable role.
- MongoDB via Prisma; roles come from the registry and are corrected on sign-in.

Open decisions:

- **Bengali conversion timing/scope** — Bengali-only interface is confirmed direction; when existing screens convert is undecided. Exact rendering conventions (Bangla vs Latin digits, date formats) are likewise undecided.

## Brand Commitments

- The product is referred to as "Visa Management" in existing page titles. No other identity, voice, or asset has been made binding by the user.

## Evidence on Hand

- Durable specs: `openspec/specs/**` (identity/roles, visa/passport-entry, visa/status-delivery, visa/passport-details, visa/payment, admin/registry, admin/reports) and archived change proposals under `openspec/changes/archive/` — treat these as the source of product truth.
- Data model: `prisma/schema.prisma` (registry models, Passport custody fields, Payment state machine).
- No real imagery, testimonials, case studies, or marketing assets exist. Do not fabricate them. Sample/live data exists only in the connected MongoDB database, never in the repo.
