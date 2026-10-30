# Admin Registry Specification

## Purpose

Defines how an admin manages branches, agencies, collectors, staff, visa types, services, and the allow-list of agency Gmail addresses permitted to log in to the system.

## Requirements

### Requirement: Admin manages branches
The system SHALL allow an authenticated admin to create, read, update, and delete branch records.

#### Scenario: Admin creates a branch
- **WHEN** an admin submits a branch name
- **THEN** the system creates a branch record

### Requirement: Admin manages agencies
The system SHALL allow an authenticated admin to create, read, update, and delete agency records, including the agency's Gmail address.

#### Scenario: Admin creates an agency with Gmail
- **WHEN** an admin submits an agency name and Gmail address
- **THEN** the system creates an agency record with the Gmail address

### Requirement: Admin manages collectors
The system SHALL allow an authenticated admin to create, read, update, and delete collector records.

#### Scenario: Admin creates a collector
- **WHEN** an admin submits a collector name
- **THEN** the system creates a collector record

### Requirement: Admin manages staff
The system SHALL allow an authenticated admin to create, read, update, and delete staff records, associating each with a Gmail address and role.

#### Scenario: Admin creates a staff member
- **WHEN** an admin submits a staff member's name, Gmail address, and role
- **THEN** the system creates a staff record with the role

### Requirement: Agency Gmail is immutable while passports reference it
The system SHALL treat an agency's Gmail as immutable once passports reference it: changing the Gmail SHALL be rejected while passports belong to the old address, and the agency SHALL NOT be deletable while passports reference its Gmail, so passport ownership stays intact.

#### Scenario: Gmail change is blocked while passports reference it
- **WHEN** an admin submits an agency update that changes the Gmail while passports reference the current one
- **THEN** the system rejects the update and reports how many passports reference the Gmail

#### Scenario: Agency deletion is blocked while passports reference its Gmail
- **WHEN** an admin deletes an agency whose Gmail is referenced by passports
- **THEN** the system rejects the deletion and reports how many passports reference the Gmail

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
The system SHALL reject a registry submission whose unique key is already registered: branches, collectors, visa types, and services by name; agencies by name or Gmail; staff by Gmail.

#### Scenario: Duplicate branch name is rejected
- **WHEN** an admin submits a branch name that already exists
- **THEN** the system rejects the submission with a duplicate-name error

#### Scenario: Duplicate collector name is rejected
- **WHEN** an admin submits a collector name that already exists
- **THEN** the system rejects the submission with a duplicate-name error

#### Scenario: Duplicate agency name or Gmail is rejected
- **WHEN** an admin submits an agency whose name or Gmail is already registered
- **THEN** the system rejects the submission stating the name or Gmail is already registered

#### Scenario: Duplicate staff Gmail is rejected
- **WHEN** an admin submits a staff entry whose Gmail is already registered
- **THEN** the system rejects the submission stating the Gmail is already registered

### Requirement: Only allow-listed agency emails can log in
The system SHALL permit login only for Google emails that an admin has explicitly allow-listed as agencies or staff.

#### Scenario: Allow-listed agency can log in
- **WHEN** a user signs in with Google using an email that an admin has allow-listed as an agency
- **THEN** the system authenticates the user and assigns the agency role

#### Scenario: Non-allow-listed email cannot log in
- **WHEN** a user signs in with Google using an email not in the admin allow-list
- **THEN** the system denies access

### Requirement: Admin defines agency Gmail on admin dashboard
The system SHALL provide an admin dashboard where the admin enters and allows agency Gmail addresses.

#### Scenario: Admin allows an agency email
- **WHEN** an admin enters an agency Gmail address on the admin dashboard and submits
- **THEN** the system adds that email to the allow-list and the agency can log in with it
