# Admin Registry Specification

## Purpose

Defines how an admin manages branches, agencies (name-only client records), collectors, staff, visa types, services, and the staff Gmail addresses permitted to log in to the system.

## Requirements

### Requirement: Admin manages branches
The system SHALL allow an authenticated admin to create, read, update, and delete branch records.

#### Scenario: Admin creates a branch
- **WHEN** an admin submits a branch name
- **THEN** the system creates a branch record

### Requirement: Admin manages agencies as name-only records
The system SHALL allow an authenticated admin to create, read, update, and delete agency records using a name only. Agencies SHALL NOT have a Gmail address, login access, or an ownership reference on passports.

#### Scenario: Admin creates an agency by name
- **WHEN** an admin submits an agency name
- **THEN** the system creates an agency record with that name and no Gmail

#### Scenario: Agency cannot sign in
- **WHEN** a Google email matches an agency name or an agency record
- **THEN** the system does not grant that email access to the application

### Requirement: Admin manages collectors
The system SHALL allow an authenticated admin to create, read, update, and delete collector records.

#### Scenario: Admin creates a collector
- **WHEN** an admin submits a collector name
- **THEN** the system creates a collector record

### Requirement: Staff can add agencies and collectors at the counter
The system SHALL allow an authenticated staff member to create agency and collector records from a staff registries page, so an unregistered name encountered during passport entry can be added immediately. Staff SHALL NOT be able to rename or delete registry entries; those operations remain admin-only.

#### Scenario: Staff adds an agency
- **WHEN** a staff member submits an agency name on the staff registries page
- **THEN** the system creates the agency and returns the staff member to that page with the new name listed

#### Scenario: Staff adds a collector
- **WHEN** a staff member submits a collector name on the staff registries page
- **THEN** the system creates the collector and returns the staff member to that page with the new name listed

#### Scenario: Staff cannot edit or delete registry entries
- **WHEN** a staff member invokes an agency or collector update/delete action directly
- **THEN** the system denies the operation

#### Scenario: Branch creation stays admin-only
- **WHEN** a staff member attempts to add a branch
- **THEN** the system denies the operation; branches are created by admins only

### Requirement: Admin manages staff
The system SHALL allow an authenticated admin to create, read, update, and delete staff records, associating each with a Gmail address and role.

#### Scenario: Admin creates a staff member
- **WHEN** an admin submits a staff member's name, Gmail address, and role
- **THEN** the system creates a staff record with the role

### Requirement: Admin manages visa types
The system SHALL allow an authenticated admin to create, read, update, and delete visa type records; staff select from this registry when entering a passport.

#### Scenario: Admin creates a visa type
- **WHEN** an admin submits a visa type name
- **THEN** the system creates a visa type record available in the passport entry form

#### Scenario: Duplicate visa type name is rejected
- **WHEN** an admin submits a visa type name that already exists
- **THEN** the system rejects the submission with a duplicate-name error

### Requirement: Admin manages services
The system SHALL allow an authenticated admin to create, read, update, and delete service records; staff select from this registry when entering a passport.

#### Scenario: Admin creates a service
- **WHEN** an admin submits a service name
- **THEN** the system creates a service record available in the passport entry form

#### Scenario: Duplicate service name is rejected
- **WHEN** an admin submits a service name that already exists
- **THEN** the system rejects the submission with a duplicate-name error

### Requirement: Duplicate registry entries are rejected
The system SHALL reject a registry submission whose unique key is already registered: branches, agencies, collectors, visa types, and services by name; staff by Gmail.

#### Scenario: Duplicate branch name is rejected
- **WHEN** an admin submits a branch name that already exists
- **THEN** the system rejects the submission with a duplicate-name error

#### Scenario: Duplicate collector name is rejected
- **WHEN** an admin submits a collector name that already exists
- **THEN** the system rejects the submission with a duplicate-name error

#### Scenario: Duplicate agency name is rejected
- **WHEN** an admin submits an agency name that is already registered
- **THEN** the system rejects the submission stating the name is already registered

#### Scenario: Duplicate staff Gmail is rejected
- **WHEN** an admin submits a staff entry whose Gmail is already registered
- **THEN** the system rejects the submission stating the Gmail is already registered

### Requirement: Only allow-listed staff emails can log in
The system SHALL permit login only for the bootstrap ADMIN email and Google emails that an admin has explicitly allow-listed in the staff registry.

#### Scenario: Allow-listed staff member can log in
- **WHEN** a user signs in with Google using an email in the staff registry
- **THEN** the system authenticates the user and assigns the staff role

#### Scenario: Non-allow-listed email cannot log in
- **WHEN** a user signs in with Google using an email that is neither the bootstrap admin nor in the staff registry
- **THEN** the system denies access
