# Spec Delta

## MODIFIED Requirements

### Requirement: Staff can enter a passport record
The system SHALL allow an authenticated staff member to create a passport entry containing agency name, collector name, visa type, service, passport number, passport holder name, contact number, and fee amount; the comment is optional. The receipt date is set automatically by the system. The payment status defaults to "unpaid".

#### Scenario: Successful passport entry
- **WHEN** a staff member submits valid passport entry details
- **THEN** the system creates a passport record with status "received", sets the receipt date automatically, associates it with the agency and the collector who brought the passport (the intake collector), and sets the payment status to "unpaid"

#### Scenario: Required fields are validated
- **WHEN** a staff member submits a passport entry missing agency name, collector name, visa type, service, passport number, passport holder name, contact number, or fee
- **THEN** the system rejects the entry and indicates which fields are required

#### Scenario: Entry without comment
- **WHEN** a staff member submits a passport entry without a comment
- **THEN** the system creates the passport record with an empty comment

#### Scenario: Receipt date not user-provided
- **WHEN** a staff member submits a passport entry
- **THEN** the system does not accept a manually provided receipt date and sets it automatically instead
