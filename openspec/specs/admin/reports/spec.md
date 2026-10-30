# Admin Reports Specification

## Purpose

Defines admin metrics reporting on passport volumes and payment totals (paid/unpaid) by day, month, or agency.

## Requirements

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
The system SHALL allow an admin to filter metrics reports by a time window (All time, Today, Last 7 days, Last 30 days) defaulting to All time, and by Agency, Branches, Passport status, and Payment status, each defaulting to "All".

#### Scenario: Report defaults to all time
- **WHEN** an admin opens the reports page
- **THEN** the system displays report data for all time with no date filter applied

#### Scenario: Report shows today
- **WHEN** an admin clicks the "Today" time button
- **THEN** the system recomputes and displays report data for today only

#### Scenario: Report shows last 7 days
- **WHEN** an admin clicks the "Last 7 days" time button
- **THEN** the system recomputes and displays report data for the trailing 7 days

#### Scenario: Report shows last 30 days
- **WHEN** an admin clicks the "Last 30 days" time button
- **THEN** the system recomputes and displays report data for the trailing 30 days

#### Scenario: Filtered report by date range and agency
- **WHEN** an admin selects a time window and an agency for the report
- **THEN** the system displays passport counts and payment totals matching those filters

### Requirement: Paid and unpaid money are tracked separately
The system SHALL report paid and unpaid money amounts separately in metrics reports.

#### Scenario: Paid vs unpaid amounts shown
- **WHEN** an admin views a money report
- **THEN** the system shows the total amount paid and the total amount unpaid as separate figures

### Requirement: Report shows headline metrics without duplication
The system SHALL display total passports, total payment received, unpaid passport count, and total unpaid amount, each exactly once.

#### Scenario: Headline metrics displayed
- **WHEN** an admin views the report
- **THEN** the system shows total number of passports, total payment received (৳), unpaid passport count, and total unpaid amount (৳)

#### Scenario: No duplicating data
- **WHEN** an admin views the report
- **THEN** each metric appears in exactly one place; no metric is repeated across cards, tables, or charts
