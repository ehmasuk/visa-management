# Passport Entry Specification

## Purpose

Defines how staff enter passport records received from agencies via collectors, capturing agency, collector, visa type, service, passport details, contact number, comment, fee, and automatic receipt date; comment editable anytime.

## Requirements

### Requirement: Passport entry records contact number
The system SHALL accept and store a reference contact number with every passport entry.

#### Scenario: Contact number stored with entry
- **WHEN** a passport is entered with a contact number
- **THEN** the system persists the contact number on the passport record

### Requirement: Receipt date is set automatically
The system SHALL set the receipt date automatically when a passport entry is created; the user does not enter it manually.

#### Scenario: Receipt date set on creation
- **WHEN** a staff member creates a passport entry
- **THEN** the system sets the receipt date to the entry's creation timestamp

### Requirement: Passport comment is editable anytime
The system SHALL allow an authenticated staff member to edit a passport's comment at any time after entry.

#### Scenario: Comment edited after entry
- **WHEN** a staff member updates the comment on an existing passport record
- **THEN** the system saves the new comment and preserves all other passport fields

### Requirement: Entry selections come from admin registries
The system SHALL record the agency, the intake collector, the visa type, and the service on every passport entry, each selectable from and validated against its admin-managed registry (`/admin/agencies`, `/admin/collectors`, `/admin/visa-types`, `/admin/services`); the agency's Gmail is resolved from the registry as the ownership reference.

#### Scenario: Registered selections are stored with ownership
- **WHEN** a staff member submits a passport entry selecting a registered agency, collector, visa type, and service
- **THEN** the system stores the selections on the passport record and resolves the agency's registered Gmail as the ownership reference

#### Scenario: Entry without visa type or service is rejected
- **WHEN** a staff member submits a passport entry without selecting a visa type or a service
- **THEN** the system rejects the entry and indicates that visa type and service are required

#### Scenario: Unregistered agency is rejected
- **WHEN** a staff member submits a passport entry for an agency that is not allow-listed
- **THEN** the system rejects the entry and directs the user to ask the admin to allow-list the agency

#### Scenario: Unregistered collector is rejected
- **WHEN** a staff member submits a passport entry with an intake collector who is not registered
- **THEN** the system rejects the entry and directs the user to ask the admin to add the collector

#### Scenario: Unregistered visa type or service is rejected
- **WHEN** a staff member submits a passport entry with a visa type or service that is not registered
- **THEN** the system rejects the entry and directs the user to ask the admin to register it

### Requirement: Passport number is unique
The system SHALL enforce uniqueness of the passport number across passport records and reject an entry whose number is already recorded.

#### Scenario: Duplicate passport number is rejected
- **WHEN** a staff member submits a passport entry whose passport number is already recorded
- **THEN** the system rejects the entry and identifies the number as already recorded, with the holder of the existing record

### Requirement: Entry validates the fee amount
The system SHALL accept the fee only as a non-negative whole amount of taka and reject entry submissions that violate this.

#### Scenario: Invalid fee is rejected
- **WHEN** a staff member submits a passport entry whose fee is negative, fractional, or otherwise not a whole number
- **THEN** the system rejects the entry and explains that the fee must be a non-negative whole amount of taka

### Requirement: Staff can enter a passport record
The system SHALL allow an authenticated staff member to create a passport entry containing agency name, collector name, visa type, service, passport number, passport holder name, contact number, and fee amount; the comment is optional. The receipt date is set automatically by the system.

#### Scenario: Successful passport entry
- **WHEN** a staff member submits valid passport entry details
- **THEN** the system creates a passport record with status "received", sets the receipt date automatically, and associates it with the agency and the collector who brought the passport (the intake collector)

#### Scenario: Required fields are validated
- **WHEN** a staff member submits a passport entry missing agency name, collector name, visa type, service, passport number, passport holder name, contact number, or fee
- **THEN** the system rejects the entry and indicates which fields are required

#### Scenario: Entry without comment
- **WHEN** a staff member submits a passport entry without a comment
- **THEN** the system creates the passport record with an empty comment

#### Scenario: Receipt date not user-provided
- **WHEN** a staff member submits a passport entry
- **THEN** the system does not accept a manually provided receipt date and sets it automatically instead
