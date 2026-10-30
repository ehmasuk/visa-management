# Spec Delta

## Purpose

Defines admin metrics reporting on passport volumes and payment totals (paid/unpaid) by day, month, or agency.

## ADDED Requirements

### Requirement: Admin views passport count report
The system SHALL allow an authenticated admin to view a report of how many passports were collected, grouped by day, month, or agency.

#### Scenario: Passport count report by day
- **WHEN** an admin requests a passport count report for today
- **THEN** the system displays the number of passports collected today

#### Scenario: Passport count report by agency
- **WHEN** an admin requests a passport count report filtered by agency
- **THEN** the system displays the number of passports associated with that agency

### Requirement: Admin views money collected report
The system SHALL allow an authenticated admin to view a report of how much money was collected (paid vs unpaid), grouped by day, month, or agency.

#### Scenario: Money collected report by day
- **WHEN** an admin requests a money collected report for today
- **THEN** the system displays the total paid amount and total unpaid amount for today

#### Scenario: Money collected report by month
- **WHEN** an admin requests a money collected report for last month
- **THEN** the system displays the total paid amount and total unpaid amount for last month

### Requirement: Report is filterable by date range and agency
The system SHALL allow an admin to filter metrics reports by a date range and by agency.

#### Scenario: Filtered report by date range and agency
- **WHEN** an admin selects a date range and an agency for the report
- **THEN** the system displays passport counts and payment totals matching those filters

### Requirement: Paid and unpaid money are tracked separately
The system SHALL report paid and unpaid money amounts separately in metrics reports.

#### Scenario: Paid vs unpaid amounts shown
- **WHEN** an admin views a money report
- **THEN** the system shows the total amount paid and the total amount unpaid as separate figures
