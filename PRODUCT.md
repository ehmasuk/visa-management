# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary — Staff (STAFF):** office employees of a visa-processing business. Their daily job is the heavy lifting: enter passports received from agencies via collectors, move passports through statuses, and assign the delivery collector at delivery.
- **Admin (ADMIN):** the owner/manager. A single active admin account exists by design (controlled bootstrap, audited recovery). The admin manages registries and reads money/volume reports; they do not do the day-to-day entry.

## Product Purpose

Replace informal, manual tracking of passport intake and delivery with a role-gated web system. The business receives passports from client agencies through collectors; staff record each entry, track status to delivery, and record the fee. Success: staff record every passport accurately with minimal friction and the owner can see passport volumes and recorded fee totals over time.

## Positioning

Internal operations system, not a storefront. Its distinctive mechanism is registry-gated identity (only the bootstrapped admin and emails in the staff registry can sign in) combined with chain-of-custody tracking that keeps the intake collector (who brought the passport in) separate from the delivery collector (delivery man), with receipt/delivery dates stamped by the system, never typed. A neighboring product could copy the idea of staff tracking, but not this custody model + allow-list policy without rebuilding the same registries.

## Operating Context

- Visa-processing office serving multiple client agencies; passports are physically sent via collectors, so tracking mirrors real-world custody.
- Payment settlement is handled in a separate system. This app records passport fees for reporting but holds no payment status or payment actions.
- Fees are recorded in Bangladeshi taka (৳). The interface currently ships in English; **the confirmed product direction is to convert the interface to Bengali only.**
- Passport lifecycle is fixed: RECEIVED → UNDER_REVIEW → SUBMITTED → DELIVERED, with receipt date set automatically on entry and delivery date set automatically on the transition to DELIVERED.

## Capabilities and Constraints

Confirmed functionality:

- Staff passport entry: agency name, branch office, intake collector, passport number (may be reused when the same passport returns), holder name, contact number, comment, fee, plus registry-backed visa type and service selections. Branches are admin-created; staff choose from them.
- Staff status/delivery flow: status transitions, delivery collector assigned at delivery, comment editable at any time; last editor (name/role/email/time) stamped on every passport mutation.
- Admin registries: branches, agencies (name-only client records), collectors, visa types, services (selectable at entry), and staff (Gmail allow-list with role). Staff may add agencies and collectors from their own registries page; renaming and removal stay admin-only.
- Admin payments: admin records agency-level payments with amount, passport count, collector, automatic date, and receiving admin; agency due is total passport fees minus payments received. Staff handle passports only.
- Admin reports: passport counts and recorded fee totals by day, month, agency, or branch; plus audit trail (AdminAudit) for admin recovery and authorized role changes.
- Admin payments view: agency-wise fees, payments received, dues or credits, and individual payment records, filterable by date and agency name.

Constraints:

- Sign-in is Google OAuth only, restricted to the bootstrap admin and staff records. Only ADMIN and STAFF roles exist. JWT sessions, 24-hour rolling window.
- Exactly one active ADMIN account, created via controlled bootstrap from a configured verified Google email; regular screens never offer ADMIN as an assignable role.
- MongoDB via Prisma; roles come from the registry and are corrected on sign-in.

Open decisions:

- **Bengali conversion timing/scope** — Bengali-only interface is confirmed direction; when existing screens convert is undecided. Exact rendering conventions (Bangla vs Latin digits, date formats) are likewise undecided.

## Brand Commitments

- The product is referred to as "Visa Management" in existing page titles. No other identity, voice, or asset has been made binding by the user.

## Evidence on Hand

- Durable specs: `openspec/specs/**` (identity/roles, visa/passport-entry, visa/status-delivery, visa/passport-details, admin/registry, admin/reports, admin/payments) and archived change proposals under `openspec/changes/archive/` — treat these as the source of product truth.
- Data model: `prisma/schema.prisma` (registry models and Passport custody fields).
- No real imagery, testimonials, case studies, or marketing assets exist. Do not fabricate them. Sample/live data exists only in the connected MongoDB database, never in the repo.
