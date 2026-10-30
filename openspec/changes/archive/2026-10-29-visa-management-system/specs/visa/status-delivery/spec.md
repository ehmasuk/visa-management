# Spec Delta

## Purpose

Defines how staff change passport status and assign a collector when a passport is marked delivered; automatic delivery date.

## ADDED Requirements

### Requirement: Staff can change passport status
The system SHALL allow an authenticated staff member to update the status of a passport record.

#### Scenario: Status change is persisted
- **WHEN** a staff member changes a passport's status from "received" to "processing"
- **THEN** the system updates the passport record's status field

### Requirement: Delivered status requires collector assignment
The system SHALL require a collector to be assigned when a passport's status is set to "delivered".

#### Scenario: Delivered status with collector
- **WHEN** a staff member sets a passport's status to "delivered" and assigns a collector
- **THEN** the system marks the passport as delivered and records the assigned collector

#### Scenario: Delivered status without collector is rejected
- **WHEN** a staff member sets a passport's status to "delivered" without assigning a collector
- **THEN** the system rejects the status change and requires a collector assignment

### Requirement: Delivery date is set automatically
The system SHALL set the delivery date automatically when a passport's status is changed to "delivered"; the user does not enter it manually.

#### Scenario: Delivery date set on delivery
- **WHEN** a staff member sets a passport's status to "delivered"
- **THEN** the system sets the delivery date to the delivery timestamp

### Requirement: Passport statuses are from a defined set
The system SHALL restrict passport status to a defined set: received, processing, delivered.

#### Scenario: Valid status values
- **WHEN** a passport record is read
- **THEN** its status is one of received, processing, or delivered
