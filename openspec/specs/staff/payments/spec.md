# Staff Payments Specification

## Purpose

Defines how staff record money received from a client agency, and how an agency's outstanding balance is derived. Payments are agency-level; passports carry fees but no payment state.

## Requirements

### Requirement: Staff can record an agency payment
The system SHALL allow an authenticated STAFF user to create a payment against a registered agency, recording a positive whole taka amount, an informational passport count, and the collector who brought the payment. The agency and collector SHALL be selected from and validated against their admin registries.

#### Scenario: Payment recorded
- **WHEN** staff submit an agency, collector, amount, and passport count
- **THEN** the system creates a payment record with those values

#### Scenario: Unregistered agency or collector is rejected
- **WHEN** staff submit a payment naming an agency or collector that is not registered
- **THEN** the system rejects the payment and directs staff to have the admin add it first

#### Scenario: Invalid amount or count is rejected
- **WHEN** the amount is not a positive whole taka value, or the passport count is not a non-negative whole number
- **THEN** the system rejects the payment and explains the required format

### Requirement: Payment date and receiving staff are recorded automatically
The system SHALL stamp the payment's receipt date and the acting staff member's name, role, and email at creation. These values SHALL NOT be accepted from the submitted form.

#### Scenario: System-stamped details
- **WHEN** a payment is created
- **THEN** its received date is the creation time and its receiving staff record matches the signed-in user

### Requirement: Agency due is derived from fees minus payments
The system SHALL show each agency's total passport fees, total payments received, and the difference as the agency's due amount. A negative difference SHALL be shown as a credit.

#### Scenario: Partially settled agency
- **WHEN** an agency's passports total 85,000 in fees and recorded payments total 40,000
- **THEN** the system shows a due amount of 45,000

#### Scenario: Agency overpaid
- **WHEN** recorded payments exceed the agency's total passport fees
- **THEN** the system shows the excess as a credit instead of a due amount

### Requirement: Payments are internal only
Payment creation SHALL be restricted to STAFF. Agencies SHALL NOT have login or payment actions, and passports SHALL NOT carry a paid/unpaid state.

#### Scenario: Non-staff caller is denied
- **WHEN** a user without the STAFF role invokes the payment creation action directly
- **THEN** the system denies the action
