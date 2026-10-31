# Agency Dashboard Specification

## Purpose

Defines how an agency logs in with Gmail and views only its own passports across all statuses, with a pay action available on delivered passports.

## Requirements

### Requirement: Agency sees only its own passports
The system SHALL display to an authenticated agency only the passport records associated with that agency.

#### Scenario: Agency views its passports
- **WHEN** an agency opens its dashboard
- **THEN** the system lists passports belonging to that agency across all statuses

#### Scenario: Agency does not see other agencies' passports
- **WHEN** an agency opens its dashboard
- **THEN** the system does not display passports belonging to other agencies

### Requirement: Agency sees passport status
The system SHALL show the current status (received, delivered) for each passport on the agency dashboard.

#### Scenario: Status displayed per passport
- **WHEN** an agency views its passport list
- **THEN** each passport shows its current status

### Requirement: Agency can pay on a delivered passport
The system SHALL display a "pay" button on each delivered passport belonging to the agency, allowing the agency to request payment.

#### Scenario: Pay button on delivered passport
- **WHEN** an agency views a delivered passport on its dashboard
- **THEN** the system displays a "pay" button for that passport

#### Scenario: No pay button on non-delivered passport
- **WHEN** an agency views a received passport on its dashboard
- **THEN** the system does not display a "pay" button

### Requirement: Agency payment status is visible
The system SHALL show whether each passport's payment is paid or unpaid on the agency dashboard.

#### Scenario: Payment status displayed
- **WHEN** an agency views its passport list
- **THEN** each passport shows its payment status as paid or unpaid

### Requirement: Agency can search and date-filter its own passports
The system SHALL offer the signed-in agency a free-text search (passport number and holder name) and a single-day receipt-date filter on its passport list, with the acting agency's Gmail applied by the server — never accepted from client input — so the list remains scoped to that agency's records only.

#### Scenario: Agency searches its passports
- **WHEN** an agency types a passport number prefix or holder-name text into the portal search
- **THEN** the list shows only that agency's matching passports and never another agency's records

#### Scenario: Agency filters by receipt day
- **WHEN** an agency picks a receipt date
- **THEN** the list shows only that agency's passports received on that calendar day, and search text still combines with it

#### Scenario: Search cannot cross the agency boundary
- **WHEN** a search or date filter is applied
- **THEN** the agency mailbox used to scope results is taken from the authenticated session, not from the request payload

### Requirement: Agency list is served in pages
The system SHALL serve the agency portal's passport list one page of records per request with database-side filtering, sorting, counting, and paging, with a load-more flow and a deep-paging cap; the shard of records shown SHALL be fetched from the database with the agency filter applied.

#### Scenario: One page at a time
- **WHEN** an agency opens the portal or changes the filters
- **THEN** the response contains only the current page of that agency's passports plus the total count, not the whole agency collection

#### Scenario: Loading more pages
- **WHEN** an agency pages past the first page
- **THEN** the next page is fetched from the server and merged into the visible list without duplicates, until the paging cap asks for a refined search

### Requirement: Agency ribbon counts stay correct at scale
The system SHALL compute the agency dashboard ribbon counts (total, in-processing, delivered, settlement-pending) from database aggregation so they remain correct as the agency's record count grows, without loading the agency's passports into application memory.

#### Scenario: Ribbon counts match the database
- **WHEN** an agency dashboard renders
- **THEN** each ribbon figure equals the corresponding database count for that agency, regardless of how many passports the agency owns
