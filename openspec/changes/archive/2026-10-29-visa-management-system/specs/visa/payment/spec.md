# Spec Delta

## Purpose

Defines how agencies request payment on delivered passports and how staff approve or reject those payment requests, tracking paid versus unpaid status.

## ADDED Requirements

### Requirement: Agency can request payment on a delivered passport
The system SHALL allow an authenticated agency to click "pay" on a passport with status "delivered" to request payment.

#### Scenario: Pay button appears on delivered passport
- **WHEN** an agency views a passport with status "delivered"
- **THEN** the system displays a "pay" button on that passport

#### Scenario: Payment request sets unpaid status
- **WHEN** an agency clicks "pay" on a delivered passport
- **THEN** the system creates a payment request with status "unpaid" for that passport

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

### Requirement: Payment status is paid or unpaid
The system SHALL restrict payment status to "paid" or "unpaid".

#### Scenario: Payment status values
- **WHEN** a payment record is read
- **THEN** its status is either "paid" or "unpaid"
