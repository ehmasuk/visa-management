# Admin Payments Specification

## Purpose

Defines how an admin reviews payments agency by agency: fees recorded, payments received, outstanding dues, and the individual payment records behind those totals.

## Requirements

### Requirement: Admin can record an agency payment
The system SHALL allow an authenticated ADMIN user to create a payment against a registered agency, recording a positive whole taka amount, an informational passport count, and the collector who brought the payment. The agency and collector SHALL be selected from and validated against their admin registries. The payment date and the receiving admin's identity SHALL be stamped automatically and SHALL NOT be accepted from the form.

#### Scenario: Payment recorded
- **WHEN** an admin submits an agency, collector, amount, and passport count
- **THEN** the system creates a payment record with those values and the automatic date/admin stamp

#### Scenario: Unregistered agency or collector is rejected
- **WHEN** an admin submits a payment naming an agency or collector that is not registered
- **THEN** the system rejects the payment and directs the admin to add it first

#### Scenario: Invalid amount or count is rejected
- **WHEN** the amount is not a positive whole taka value, or the passport count is not a non-negative whole number
- **THEN** the system rejects the payment and explains the required format

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
The system SHALL list individual payments for the selected agencies and period, showing received date, agency, amount, passport count, collector, and receiving admin. The list SHALL be server-paged with a bounded deep-paging cap.

#### Scenario: Payment records match the filters
- **WHEN** an admin changes the date window or agency search
- **THEN** the payment record list contains only records from that agency set and period

### Requirement: Payment creation and review are admin-only
The system SHALL restrict payment creation, the agency payment view, and their data actions to authenticated ADMIN users. Staff SHALL handle passports only and SHALL have no payment page or payment action.

#### Scenario: Non-admin caller is denied
- **WHEN** a user without the ADMIN role invokes a payment creation or data action directly
- **THEN** the system denies the request

#### Scenario: Staff desk has no payment entry
- **WHEN** a staff member opens their desk
- **THEN** no payment navigation or payment form is shown
