# Visa Passport Browse Specification

## Purpose

Lets staff and admin find any passport inside very large collections (target 1M+) from the passport desk lists, by searching text and picking a receipt day, with every filter evaluated by the database and only one page of cards served at a time.

## Requirements

### Requirement: Passport desk offers text search
The system SHALL offer staff and admin a free-text search on the passport list that filters by passport number, holder name, and — for digits-only queries — contact number, evaluated inside the database rather than in the browser.

#### Scenario: Search by passport number prefix
- **WHEN** a user types a passport number prefix into the desk search
- **THEN** the list shows only passports whose passport number starts with that prefix, regardless of the case the user typed

#### Scenario: Search by holder name
- **WHEN** a user types holder-name text into the desk search
- **THEN** the list shows only passports whose holder name contains that text

#### Scenario: Search by contact number digits
- **WHEN** a staff user types only digits into the desk search
- **THEN** the list may also show passports whose contact number starts with those digits

#### Scenario: Blank search shows the default view
- **WHEN** the search box is empty
- **THEN** the desk shows the newest passports across the collection without any text filter

### Requirement: Passport desk offers receipt-day filter
The system SHALL offer staff and admin a single-day receipt date picker on the passport list that narrows results to passports received on that day; a blank or malformed date is ignored rather than treated as an error.

#### Scenario: Filter to one receipt day
- **WHEN** a user picks a receipt date on the passport desk
- **THEN** the list shows only passports whose receipt date falls on that calendar day, and search text still combines with it

#### Scenario: Malformed date is ignored
- **WHEN** the desk receives a date value that is not a valid calendar day
- **THEN** the list renders without a date restriction instead of failing

### Requirement: Passport desk pages the list server-side
The system SHALL serve the staff and admin passport lists one page of records per request with database-side filtering, sorting, counting, and paging, and SHALL cap how deep a user can page so requests stay cheap regardless of collection size; the page total shown SHALL be the database count, not the DOM rows.

#### Scenario: One page at a time
- **WHEN** a staff member opens the passport desk or changes a filter
- **THEN** the response contains only the current page of passport cards plus the total count, not the whole collection

#### Scenario: Loading more pages
- **WHEN** a user pages past the first page
- **THEN** the next page is fetched from the server and merged into the visible list without duplicates, until the search cap asks for a refined search

#### Scenario: Shown total matches the database
- **WHEN** a filtered or unfiltered desk view renders
- **THEN** the displayed count equals the database count for the applied filters

### Requirement: Desk requests stay bounded at scale
The system SHALL keep every desk list request's payload and memory bounded by the page size rather than the collection size, so growth of the passport collection over years does not degrade list rendering.

#### Scenario: Payload does not grow with the collection
- **WHEN** the passport collection grows from thousands to a million records
- **THEN** a desk page response remains one page of rows plus aggregate counts, and no filter runs in the browser over raw records
