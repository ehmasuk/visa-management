# Proposal

## Why

The business currently manages passport intake and visa delivery through informal, manual tracking. Agencies send passports via a collector, staff enter them into the system, and passports move through statuses until delivered and assigned back to a collector. There is no system to record passport entries, track status changes, manage payment (paid/unpaid), or let agencies view their own passports. This change builds the core visa-management system so staff can enter passports, change statuses, handle payments, and agencies can self-serve visibility into their passports. It also adds extended passport fields (comment, contact number, automatic dates) and admin metrics reporting.

## What Changes

- Staff can enter passports with agency name, collector name, passport number, passport holder name, contact number, comment, and fee amount; receipt date is set automatically on entry
- Staff can edit a passport's comment at any time
- Staff can change passport status and assign a collector when a passport is delivered; delivery date is set automatically on delivery
- Admin manages branches, agencies, collectors, and staff; admin allow-lists agency Gmail addresses so only approved agencies can log in
- Agencies log in with Gmail and see only their own passports across all statuses
- Agencies can click "pay" on a delivered passport to request payment; staff see payment requests and can approve them (paid/unpaid)
- Admin can view metrics reports: passport counts and money collected (paid/unpaid) by day, month, or agency
- Role-based routing after login: admin, staff, and agency are pushed to different routes based on their Google email matching the admin-defined registry

## Capabilities

### New Capabilities

- `visa/passport-entry`: Staff enters passport records received from agencies via collectors, capturing agency, collector, passport details, contact number, comment, fee, and automatic receipt date; comment editable anytime
- `visa/status-delivery`: Staff changes passport status and assigns a collector when the passport is marked delivered; automatic delivery date
- `visa/payment`: Agencies request payment on delivered passports; staff approve/reject; paid vs unpaid status tracked
- `admin/registry`: Admin manages branches, agencies, collectors, staff, and the allow-list of agency Gmail addresses permitted to log in
- `admin/reports`: Admin metrics reporting — passport volumes and payment totals (paid/unpaid) by day, month, or agency
- `agency/dashboard`: Agencies log in with Gmail and view only their own passports across all statuses, with a pay action on delivered passports

### Modified Capabilities

- (none) — identity/roles is addressed by the sibling `auth-role-model` change; this change depends on it for role-based access control

## Impact

- `prisma/schema.prisma` — new models: Branch, Agency, Collector, Staff, Passport, Payment; Passport gains comment, contactNumber, receiptDate, deliveryDate fields
- `lib/prisma.ts` — reused singleton client
- `auth.ts` — NextAuth signIn callback maps Google email to role/registry and enforces admin allow-list
- `middleware.ts` — role-based route redirection after login (admin → admin, staff → staff, agency → agency)
- New route pages: `/admin`, `/staff`, `/agency`, plus passport entry, status detail, and reports pages
- New server actions/API routes for passport entry, status changes, comment edits, payment requests, payment approval, and metrics reports
