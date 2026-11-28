# Admin Payments Specification

## Purpose

Defines how an admin reviews payments agency by agency: fees recorded, payments received, outstanding dues, and the individual payment records behind those totals.

## Requirements

### Requirement: Admin views an agency-wise payment summary
The system SHALL show one row per agency with the number of passports, total passport fees, number of payments, total payments received, the due amount, and the date of the last payment. Agencies with no payments SHALL still appear.

#### Scenario: Partially settled agency
- **WHEN** an agency has 85,000 in passport fees and 40,000 in recorded payments
- **THEN** the summary shows a due amount of 45,000 for that agency

#### Scenario: Agency overpaid
- **WHEN** an agency's payments exceed its passport fees
- **THEN** the excess is shown as a credit rather than a due amount

### Requirement: The agency payment view is filterable by date and name
The system SHALL offer All Time, Today, Last 7 days, Last 30 days, a specific date picker, and an agency name search. A selected day SHALL override the rolling window. The same period SHALL apply to passport receipt dates and payment received dates.

#### Scenario: Filter to a specific day
- **WHEN** an admin picks a day
- **THEN** passport fees and payments shown are limited to that day, and the summary and totals recompute

#### Scenario: Search by agency name
- **WHEN** an admin types an agency name
- **THEN** only matching agencies and their payments are shown

### Requirement: Admin can inspect individual payment records
The system SHALL list individual payments for the selected agencies and period, showing received date, agency, amount, passport count, collector, and receiving staff. The list SHALL be server-paged with a bounded deep-paging cap.

#### Scenario: Payment records match the filters
- **WHEN** an admin changes the date window or agency search
- **THEN** the payment record list contains only records from that agency set and period

### Requirement: Agency payment review is admin-only
The system SHALL restrict the agency payment view and its data action to authenticated ADMIN users.

#### Scenario: Non-admin caller is denied
- **WHEN** a user without the ADMIN role invokes the agency payment data action
- **THEN** the system denies the request
