# Admin Reports Specification

## Purpose

Defines admin metrics reporting on passport volumes and recorded fee totals by day, month, agency, and branch. Payment settlement is handled outside this application and is not reported here.

## Requirements

### Requirement: Admin views passport count report
The system SHALL allow an authenticated admin to view a report of how many passports were collected, grouped by day, month, or agency.

#### Scenario: Passport count report by day
- **WHEN** an admin requests a passport count report for today
- **THEN** the system displays the number of passports collected today

#### Scenario: Passport count report by agency
- **WHEN** an admin requests a passport count report filtered by agency
- **THEN** the system displays the number of passports associated with that agency

### Requirement: Admin views fee volume report
The system SHALL allow an authenticated admin to view the total recorded fees, grouped by day, month, agency, or branch.

#### Scenario: Fee volume report by day
- **WHEN** an admin requests a fee volume report for today
- **THEN** the system displays the total fees recorded today

#### Scenario: Fee volume report by month
- **WHEN** an admin requests a fee volume report for last month
- **THEN** the system displays the total fees recorded last month

### Requirement: Report is filterable by date range, agency, branch and status
The system SHALL allow an admin to filter reports by a time window (All time, Today, Last 7 days, Last 30 days) defaulting to All time, and by Agency, Branch, and Passport status, each defaulting to "All". No payment filter SHALL be offered.

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

#### Scenario: Filtered report by branch
- **WHEN** an admin selects a branch for the report
- **THEN** the system displays passport counts and fee totals for passports recorded at that branch

#### Scenario: Filtered report by date range and agency
- **WHEN** an admin selects a time window and an agency for the report
- **THEN** the system displays passport counts and fee totals matching those filters

### Requirement: Report shows the due amount for the current filters
The system SHALL display a due metric calculated as the filtered passport fees minus payments received. Payments SHALL be scoped by the selected agency and the report's date range; passport status, branch, and search filters apply only to the passport side. A negative result SHALL be presented as a credit.

#### Scenario: Partially settled agency in a filtered report
- **WHEN** an admin selects an agency whose filtered passports total 85,000 in fees and payments in the same date range total 40,000
- **THEN** the report shows a due amount of 45,000

#### Scenario: Status filter changes the due amount
- **WHEN** an admin filters to delivered passports
- **THEN** the due amount uses only the fees of delivered passports minus the applicable payments

### Requirement: Report shows headline metrics without duplication
The system SHALL display total passports, total recorded fees, and the due amount, each exactly once.

#### Scenario: Headline metrics displayed
- **WHEN** an admin views the report
- **THEN** the system shows the total number of passports, the total recorded fee amount (৳), and the due amount (৳)

#### Scenario: No duplicating data
- **WHEN** an admin views the report
- **THEN** each metric appears in exactly one place; no metric is repeated across cards, tables, or charts
