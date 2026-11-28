# Spec Delta

## MODIFIED Requirements

### Requirement: Payment status is paid or unpaid
The system SHALL restrict payment status to "paid", "unpaid", or "requested".

#### Scenario: Payment status values
- **WHEN** a payment record is read
- **THEN** its status is one of "paid", "unpaid", or "requested"

#### Scenario: New passport entry defaults to unpaid
- **WHEN** staff enters a new passport
- **THEN** the payment status defaults to "unpaid"

#### Scenario: Agency requests payment on delivered passport
- **WHEN** an agency clicks "pay" on a passport with status "delivered"
- **THEN** the system sets the payment status to "requested" and creates a payment request for staff approval

#### Scenario: Staff approves requested payment
- **WHEN** a staff member approves a "requested" payment request
- **THEN** the system sets the payment status to "paid"

#### Scenario: Staff rejects requested payment
- **WHEN** a staff member rejects a "requested" payment request
- **THEN** the system sets the payment status back to "unpaid"

#### Scenario: Pending requested payment is not duplicated
- **WHEN** an agency clicks "pay" on a delivered passport whose payment request is already "requested"
- **THEN** the system does not create a duplicate request and confirms the existing request is pending

#### Scenario: Paid passport cannot be re-requested
- **WHEN** an agency clicks "pay" on a delivered passport whose payment is already "paid"
- **THEN** the system rejects the request and states that the payment is already approved
