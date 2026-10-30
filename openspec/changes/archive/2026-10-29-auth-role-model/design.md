# Design

## Context

The project already has Next.js 16 App Router, NextAuth v5 (Google OAuth, JWT sessions), Prisma 6, and MongoDB Atlas. A `User` model exists with `email`, `name`, `image`, `emailVerified`, and a `role` field defaulting to "USER". Authentication is handled in `auth.ts` and route protection in `proxy.ts`. This design adds role-based authorization on top of that foundation. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Enforce ADMIN / STAFF / AGENCY roles on the User record server-side
- Maintain exactly one active ADMIN account at all times
- Prevent users from changing their own role or agency association via request payloads
- Bootstrap the first ADMIN from a configured, verified Google email
- Provide an auditable, restricted admin recovery/replacement process

**Non-Goals:**
- Credentials (email/password) authentication — Google OAuth remains the sole provider
- Per-resource (object-level) permissions beyond role
- An Agency domain model or agency management screens beyond `agencyId` on User
- Email verification flows beyond the bootstrap email being verified

## Decisions

### Role stored on User model (vs. separate Role entity)
**Decision:** Add `role` and optional `agencyId` fields directly to the existing `User` Prisma model.
**Rationale:** Keeps the change minimal; roles are attributes of identity, not first-class entities with their own lifecycle.
**Alternatives considered:** A separate `Role` table with many-to-many assignment — rejected as over-engineering for three static roles.

### JWT session strategy (no Prisma adapter)
**Decision:** Continue using NextAuth JWT sessions; manage users via Prisma directly in the `signIn` callback rather than `@auth/prisma-adapter`.
**Rationale:** `@auth/prisma-adapter` targets SQL databases and does not support MongoDB's document model (no `@relation`).
**Alternatives considered:** Prisma adapter — incompatible with MongoDB.

### Single-admin invariant enforced in application code
**Decision:** Enforce the "exactly one active ADMIN" rule in server actions/API routes, with a database count check at write time.
**Rationale:** MongoDB + Prisma do not support cross-document uniqueness constraints; application-level enforcement is the practical option.
**Alternatives considered:** Database-level unique partial index — not expressible through Prisma on MongoDB.

### Bootstrap via seed script + env-var email
**Decision:** Create the first ADMIN through a controlled seed script reading a configured Google email (e.g., `ADMIN_BOOTSTRAP_EMAIL`) from `.env`.
**Rationale:** Keeps admin creation out of normal UI and under operational control.
**Alternatives considered:** Admin self-registration — rejected; violates the single-admin invariant and the "not offered on normal screens" rule.

## Risks / Trade-offs

[Race condition on single-admin check] → Two concurrent requests could both observe zero admins and each create one. Mitigation: wrap the create-admin operation in a server-side check-then-act with retry, and accept rare races as operational events handled by the recovery process.

[Agency association underspecified] → The request mentions "Agency association" but no Agency model exists. Mitigation: store an optional `agencyId` string on User; defer full agency modeling to a later change.

[Role escalation via direct database access] → Application-level enforcement does not protect against direct DB writes. Mitigation: restrict database write access to admin operations; log all role changes.

## Migration Plan

1. Add `role` (default AGENCY) and `agencyId` (optional) to `prisma/schema.prisma`
2. Run `prisma generate` and apply schema to MongoDB (existing users default to AGENCY)
3. Update `auth.ts` signIn callback to stamp `role` onto the JWT/session
4. Add server-side validation middleware that strips/rejects client-supplied `role` and `agencyId` on user-update payloads
5. Create admin bootstrap script keyed on `ADMIN_BOOTSTRAP_EMAIL`
6. Add audit logging for role changes and admin recovery
7. Rollback: revert schema field additions and auth.ts changes; bootstrap is idempotent (no-op when an admin already exists)

## Open Questions

- What is the exact environment variable name for the bootstrap Google email (candidate: `ADMIN_BOOTSTRAP_EMAIL`)?
- Should AGENCY users require an `agencyId`, or is it optional pending an Agency model?
- Where should the audit documentation for admin recovery be stored (append-only log file, database collection, or external system)?
