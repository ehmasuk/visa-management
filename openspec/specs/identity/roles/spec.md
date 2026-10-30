# Identity Roles Specification

## Purpose

Defines role-based authorization on user identities so the visa-management application can gate features and data by ADMIN, STAFF, or AGENCY role, with a single-admin invariant enforced server-side.

## Requirements

### Requirement: User has exactly one role
Each User record SHALL have exactly one role drawn from ADMIN, STAFF, or AGENCY, defaulting to AGENCY when no role is assigned.

#### Scenario: Default role is AGENCY
- **WHEN** a new User record is created without specifying a role
- **THEN** the system assigns role AGENCY to the user

#### Scenario: Role is single-valued
- **WHEN** a User record is read
- **THEN** the user's role field contains exactly one of ADMIN, STAFF, or AGENCY

### Requirement: Server-side role validation
The system SHALL validate role changes server-side and reject any client request that attempts to set a user's own role or agency association.

#### Scenario: User cannot change own role via payload
- **WHEN** an authenticated user submits a request payload containing a role or agencyId change for their own account
- **THEN** the system rejects the request and preserves the user's existing role and agency association

#### Scenario: Authorized actor can change another user's role
- **WHEN** an ADMIN submits a request to change another user's role
- **THEN** the system updates the target user's role and records the change

### Requirement: Single active admin invariant
The system SHALL permit exactly one active ADMIN account at any time.

#### Scenario: Only one active admin exists
- **WHEN** the system counts active users with role ADMIN
- **THEN** the count is exactly one

#### Scenario: Routine promotion to admin is rejected
- **WHEN** a non-admin process attempts to create or promote a user to ADMIN outside the controlled bootstrap path
- **THEN** the system rejects the operation

### Requirement: Admin not offered on normal screens
Normal application screens SHALL not present ADMIN as a role that can be assigned to a user.

#### Scenario: Role picker excludes ADMIN
- **WHEN** a user-facing role-selection screen is rendered
- **THEN** ADMIN does not appear as an assignable option

### Requirement: Controlled admin bootstrap
The first ADMIN account SHALL be created through a controlled seed/bootstrap process using a configured, verified Google email.

#### Scenario: First admin from configured email
- **WHEN** the bootstrap process runs with no active ADMIN account present
- **THEN** the system creates an ADMIN account for the configured verified Google email only

#### Scenario: Bootstrap requires configured email
- **WHEN** the configured bootstrap Google email is unset or unverified
- **THEN** the system refuses to create an ADMIN account

### Requirement: Admin recovery via restricted maintenance
Admin recovery or replacement SHALL use a documented, restricted maintenance process that produces audit documentation.

#### Scenario: Admin replacement creates audit record
- **WHEN** an ADMIN account is recovered or replaced through the maintenance process
- **THEN** the system writes an audit record documenting who, when, and why the replacement occurred

#### Scenario: Maintenance process is restricted
- **WHEN** a request to recover or replace an ADMIN account is made outside the documented maintenance process
- **THEN** the system rejects the request
