# Payment Specification

## Purpose

Defines how agencies request payment on delivered passports and how staff approve or reject those payment requests, tracking paid versus unpaid status.

## Requirements

### Requirement: Agency can request payment on a delivered passport
The system SHALL allow an authenticated agency to click "pay" on a passport with status "delivered" to request payment.

#### Scenario: Pay button appears on delivered passport
- **WHEN** an agency views a passport with status "delivered"
- **THEN** the system displays a "pay" button on that passport

#### Scenario: Payment request sets unpaid status
- **WHEN** an agency clicks "pay" on a delivered passport
- **THEN** the system creates a payment request with status "unpaid" for that passport, capturing the passport's fee as the requested amount

#### Scenario: Payment request is ownership-checked
- **WHEN** an agency submits a payment request for a passport belonging to a different agency
- **THEN** the system rejects the request and states that the passport does not belong to the requesting agency

### Requirement: Pay button is hidden for non-delivered passports
The system SHALL not display the "pay" button on passports whose status is not "delivered".

#### Scenario: Pay button hidden on received passport
- **WHEN** an agency views a passport with status "received"
- **THEN** the system does not display a "pay" button

### Requirement: Staff can approve or reject payment requests
The system SHALL allow an authenticated staff member to approve or reject a payment request on a passport.

#### Scenario: Staff approves payment
- **WHEN** a staff member approves an unpaid payment request
- **THEN** the system sets the payment status to "paid"

#### Scenario: Staff rejects payment
- **WHEN** a staff member rejects an unpaid payment request
- **THEN** the system keeps the payment status as "unpaid" and records the rejection

### Requirement: Rejected payment requests can be re-submitted
The system SHALL allow an agency to re-request payment on a delivered passport whose previous request was rejected by replacing the rejected request with a fresh unpaid request; a pending request SHALL NOT be duplicated, and a paid passport SHALL NOT accept another request.

#### Scenario: Rejected request is re-submitted
- **WHEN** an agency clicks "pay" on a delivered passport whose payment request was rejected
- **THEN** the system replaces the rejected request with a fresh unpaid payment request for staff approval

#### Scenario: Pending request is not duplicated
- **WHEN** an agency clicks "pay" on a delivered passport whose payment request is already awaiting staff approval
- **THEN** the system does not create a duplicate request and confirms that the existing request is pending

#### Scenario: Paid passport cannot be re-requested
- **WHEN** an agency clicks "pay" on a delivered passport whose payment is already paid
- **THEN** the system rejects the request and states that the payment is already approved

### Requirement: Payment status is paid or unpaid
The system SHALL restrict payment status to "paid" or "unpaid".

#### Scenario: Payment status values
- **WHEN** a payment record is read
- **THEN** its status is either "paid" or "unpaid"
