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
The system SHALL show the current status (received, processing, delivered) for each passport on the agency dashboard.

#### Scenario: Status displayed per passport
- **WHEN** an agency views its passport list
- **THEN** each passport shows its current status

### Requirement: Agency can pay on a delivered passport
The system SHALL display a "pay" button on each delivered passport belonging to the agency, allowing the agency to request payment.

#### Scenario: Pay button on delivered passport
- **WHEN** an agency views a delivered passport on its dashboard
- **THEN** the system displays a "pay" button for that passport

#### Scenario: No pay button on non-delivered passport
- **WHEN** an agency views a received or processing passport on its dashboard
- **THEN** the system does not display a "pay" button

### Requirement: Agency payment status is visible
The system SHALL show whether each passport's payment is paid or unpaid on the agency dashboard.

#### Scenario: Payment status displayed
- **WHEN** an agency views its passport list
- **THEN** each passport shows its payment status as paid or unpaid
