# Spec Delta

## Purpose

Defines how staff enter passport records received from agencies via collectors, capturing agency, collector, passport details, contact number, comment, fee, and automatic receipt date; comment editable anytime.

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Staff can enter a passport record
The system SHALL allow an authenticated staff member to create a passport entry containing agency name, collector name, passport number, passport holder name, contact number, comment, and fee amount; the receipt date is set automatically by the system.

#### Scenario: Successful passport entry
- **WHEN** a staff member submits valid passport entry details
- **THEN** the system creates a passport record with status "received", sets the receipt date automatically, and associates it with the agency and collector

#### Scenario: Required fields are validated
- **WHEN** a staff member submits a passport entry missing agency name, collector name, passport number, passport holder name, contact number, comment, or fee
- **THEN** the system rejects the entry and indicates which fields are required

#### Scenario: Receipt date not user-provided
- **WHEN** a staff member submits a passport entry
- **THEN** the system does not accept a manually provided receipt date and sets it automatically instead
