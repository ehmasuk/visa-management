# Tasks

## 1. Data model

- [x] 1.1 Add `role` (enum ADMIN/STAFF/AGENCY, default AGENCY) and optional `agencyId` to the User model in `prisma/schema.prisma` and verify `prisma generate` succeeds
- [x] 1.2 Apply the schema to MongoDB and verify existing users default to AGENCY and the new fields are queryable

## 2. Auth integration

- [x] 2.1 Update `auth.ts` signIn callback to read the user's `role` from Prisma and stamp it onto the JWT/session; verify a signed-in session exposes `user.role`
- [x] 2.2 Extend `types/next-auth.d.ts` so `Session`, `User`, and `JWT` include `role`; verify `pnpm typecheck` passes

## 3. Server-side role validation

- [x] 3.1 Add server-side validation that strips/rejects client-supplied `role` and `agencyId` on user-update payloads; verify a user cannot change their own role or agency association via request payload

## 4. Single-admin invariant

- [x] 4.1 Implement check-then-act enforcement that exactly one active ADMIN exists at all times; verify routine creation or promotion of a second ADMIN is rejected

## 5. Admin bootstrap

- [x] 5.1 Create a controlled seed/bootstrap script keyed on `ADMIN_BOOTSTRAP_EMAIL` (configured, verified Google email) that creates the first ADMIN only when none exists; verify it creates exactly one admin and is a no-op when one already exists

## 6. Admin recovery and audit

- [x] 6.1 Implement a restricted admin recovery/replacement process that writes an audit record (who, when, why); verify normal paths cannot trigger recovery and an audit record exists after replacement

## 7. Integration verification

- [x] 7.1 End-to-end check: sign in via Google, read the user's role, attempt a self role change (rejected), and confirm exactly one ADMIN exists; verify all scenarios from `specs/identity/roles/spec.md` are exercised

## Workflow follow-up

- Review the completed change artifacts with the team.
- Archive the change after review requirements are satisfied.
- Verify the archived result.
