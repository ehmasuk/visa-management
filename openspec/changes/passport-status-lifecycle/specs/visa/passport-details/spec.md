# Spec Delta

## MODIFIED Requirements

### Requirement: Staff and admin lists show every passport field
The system SHALL display every stored field directly in the staff and admin list table: agency name, branch, intake collector, visa type, service, passport number, passport holder name, contact number, comment, fee, status, receipt date, under-review date, submitted date, delivery date, delivery collector, and the last-editor record.

#### Scenario: Full record visible in the list
- **WHEN** staff or an admin opens their passport list
- **THEN** each row shows every field captured at entry, the system-managed dates, and the last-editor details

#### Scenario: Fields never captured are shown as empty
- **WHEN** the list shows a passport that has no under-review, submitted, or delivery recording
- **THEN** the unset fields are rendered as empty rather than hiding those details from the view

### Requirement: Passport editing does not modify system-managed fields
The system SHALL NOT accept changes to status, receipt date, under-review date, submitted date, delivery date, or delivery collector through the passport edit view: those fields remain governed by the status and delivery rules, and any values posted for them are ignored.

#### Scenario: Posted system-managed values are ignored
- **WHEN** an edit submission includes a status, receipt date, under-review date, submitted date, or delivery-date value alongside the edited fields
- **THEN** the system applies only the editable fields and leaves the passport's status and system-managed dates unchanged

## ADDED Requirements

### Requirement: Passport list shows a lifecycle timeline
The system SHALL display on the staff and admin list table the passport's custody milestones: receipt, under-review, submitted, and delivery, each with its recorded timestamp in stage order, rendering yet-to-be-reached milestones as unset.

#### Scenario: List shows every reached milestone
- **WHEN** the list shows a passport whose first three milestones are recorded
- **THEN** the row lists the receipt, under-review, and submitted timestamps in stage order, and shows the delivery timestamp as unset because the passport has not been delivered

#### Scenario: Delivered passport shows the complete timeline
- **WHEN** the list shows a delivered passport
- **THEN** the row lists all four milestone timestamps in stage order
