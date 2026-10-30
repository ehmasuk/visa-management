# Spec Delta

## Purpose

Defines how an admin manages branches, agencies, collectors, staff, and the allow-list of agency Gmail addresses permitted to log in to the system.

## ADDED Requirements

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
