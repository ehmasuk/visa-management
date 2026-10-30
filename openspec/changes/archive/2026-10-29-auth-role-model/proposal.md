# Proposal

## Why

The current authentication system authenticates users via Google OAuth but has no role-based authorization model. All users are effectively equal once signed in. This change introduces a role model (ADMIN, STAFF, AGENCY) assigned to each User record, enforced server-side, so the application can gate features and data by role. It is needed now because the visa-management domain requires differentiated access — staff process applications, agencies own submissions, and exactly one admin governs the system.

## What Changes

- Add a `role` enum (ADMIN, STAFF, AGENCY) to the User model, defaulting to AGENCY
- Add an optional `agencyId` association to the User model for AGENCY-scoped users
- Server-side validation: a user cannot change their own `role` or `agencyId` through request payloads
- Enforce exactly one active ADMIN account at all times
- Remove ADMIN from role-assignment options on normal application screens
- Controlled seed/bootstrap process to create the first ADMIN from a configured verified Google email
- Prevent routine creation or promotion of a second ADMIN
- Documented, restricted maintenance process for admin recovery/replacement with audit documentation

## Capabilities

### New Capabilities

- `identity/roles`: Role-based authorization on user identities — role assignment, server-side role validation, single-admin invariant, and admin bootstrap/recovery process

### Modified Capabilities

- (none)

## Impact

- `prisma/schema.prisma` — User model gains `role` and optional `agencyId` fields
- `lib/prisma.ts` — unchanged (singleton reused)
- `auth.ts` — NextAuth signIn callback populates user role into the JWT/session
- `middleware.ts` — route guards can check `req.auth.user.role` for admin/staff/agency gating
- New server actions/API routes for role-scoped operations and admin bootstrap
- Frontend screens must not offer ADMIN as a selectable role
