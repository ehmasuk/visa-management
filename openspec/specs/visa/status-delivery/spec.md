# Status Delivery Specification

## Purpose

Defines how staff change passport status and record the delivery collector ("delivery man") when a passport is marked delivered; automatic delivery date; the intake collector recorded at entry is never modified by a delivery.

## Requirements

### Requirement: Staff can change passport status
The system SHALL allow an authenticated staff member to update the status of a passport record.

#### Scenario: Status change is persisted
- **WHEN** a staff member changes a passport's status from "received" to "processing"
- **THEN** the system updates the passport record's status field

### Requirement: Delivered status requires a registered delivery collector assignment
The system SHALL require a delivery collector ("delivery man") to be assigned when a passport's status is set to "delivered", validated against the collector registry; this collector is distinct from the intake collector recorded at entry.

#### Scenario: Delivered status with delivery collector
- **WHEN** a staff member sets a passport's status to "delivered" and assigns a registered delivery collector
- **THEN** the system marks the passport as delivered and records the assigned delivery collector without modifying the intake collector

#### Scenario: Delivered status without delivery collector is rejected
- **WHEN** a staff member sets a passport's status to "delivered" without assigning a delivery collector
- **THEN** the system rejects the status change and requires a delivery collector assignment

#### Scenario: Delivery with unregistered collector is rejected
- **WHEN** a staff member sets a passport's status to "delivered" with a delivery collector who is not registered
- **THEN** the system rejects the status change and states that delivery to an unregistered collector is not possible

### Requirement: Delivery date is set automatically
The system SHALL set the delivery date automatically when a passport's status is changed to "delivered"; the user does not enter it manually.

#### Scenario: Delivery date set on delivery
- **WHEN** a staff member sets a passport's status to "delivered"
- **THEN** the system sets the delivery date to the delivery timestamp

### Requirement: Intake and delivery collectors are recorded separately
The system SHALL record the intake collector (who brought the passport from the agency, captured at entry) separately from the delivery collector (who receives the delivered passport): a delivery transition SHALL NOT modify the intake collector, and moving a passport out of the delivered status SHALL clear the delivery collector along with the delivery date.

#### Scenario: Delivery does not overwrite the intake collector
- **WHEN** a passport whose intake collector is "A" is set to "delivered" with delivery collector "B"
- **THEN** the passport's intake collector remains "A" and the delivery collector is recorded as "B"

#### Scenario: Leaving delivered clears delivery recording
- **WHEN** a delivered passport's status is changed to "received" or "processing"
- **THEN** the delivery date and the delivery collector are cleared

#### Scenario: Passport never delivered has no delivery collector
- **WHEN** a passport that has never been delivered is read
- **THEN** its delivery date and delivery collector are unset

### Requirement: Passport statuses are from a defined set
The system SHALL restrict passport status to a defined set: received, processing, delivered.

#### Scenario: Valid status values
- **WHEN** a passport record is read
- **THEN** its status is one of received, processing, or delivered
