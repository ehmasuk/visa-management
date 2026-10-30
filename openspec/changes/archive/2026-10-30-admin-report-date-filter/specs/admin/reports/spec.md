# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Report shows headline metrics without duplication
The system SHALL display total passports, total payment received, unpaid passport count, and total unpaid amount, each exactly once.

#### Scenario: Headline metrics displayed
- **WHEN** an admin views the report
- **THEN** the system shows total number of passports, total payment received (৳), unpaid passport count, and total unpaid amount (৳)

#### Scenario: No duplicating data
- **WHEN** an admin views the report
- **THEN** each metric appears in exactly one place; no metric is repeated across cards, tables, or charts
