# Payment Specification

## Purpose

Defines how a passport's payment is recorded and changed. Settlement is handled internally: staff and admins flip a passport directly between paid and unpaid. There are no external payment actors.

## Requirements

### Requirement: Every passport carries one payment record, unpaid by default
The system SHALL create exactly one payment record with each passport entry, defaulting to "unpaid". Its amount SHALL mirror the passport's current fee.

#### Scenario: New passport starts unpaid
- **WHEN** a staff member creates a passport entry
- **THEN** the passport's payment status is "unpaid"

#### Scenario: Settlement amount follows the fee
- **WHEN** a passport's fee is corrected through the edit view
- **THEN** the payment amount is updated to the new fee so reports never show a stale amount

### Requirement: Staff and admins can set payment to paid or unpaid
The system SHALL allow an authenticated STAFF or ADMIN user to change any passport's payment status directly, in either direction, regardless of the passport's custody status. There SHALL be no separate payment request or approval step.

#### Scenario: Mark a passport paid
- **WHEN** a staff member or admin marks an unpaid passport as paid
- **THEN** the payment status becomes "paid" and the paid-at timestamp is set

#### Scenario: Mark a passport unpaid again
- **WHEN** a staff member or admin marks a paid passport as unpaid
- **THEN** the payment status becomes "unpaid" and the paid-at timestamp is cleared

#### Scenario: Available on every passport
- **WHEN** an internal operator views a passport in any custody state
- **THEN** the payment status can be changed without changing the passport's custody status

#### Scenario: Change is attributed
- **WHEN** a payment status is changed
- **THEN** the passport's last-editor record is refreshed with the acting user's role, name, email, and timestamp

### Requirement: Payment status is restricted to paid or unpaid
The system SHALL restrict payment status to exactly two values: "paid" and "unpaid".

#### Scenario: Payment status values
- **WHEN** a payment record is read
- **THEN** its status is either "paid" or "unpaid"

### Requirement: Payment actions are restricted to internal operators
The system SHALL deny the payment-change action to any signed-in user who is not STAFF or ADMIN, regardless of client-side filtering.

#### Scenario: Non-internal caller is denied
- **WHEN** a signed-in user without STAFF or ADMIN role invokes the payment-change action directly
- **THEN** the system denies the action
