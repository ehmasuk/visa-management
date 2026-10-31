# Spec Delta

## MODIFIED Requirements

### Requirement: Internal passport detail view shows every passport field
The system SHALL provide an internal read-only passport detail view, opened via a View button on the staff or admin passport lists, that displays every stored field of the passport: agency name, intake collector, visa type, service, passport number, passport holder name, contact number, comment, fee, status, receipt date, under-review date, submitted date, delivery date, delivery collector, payment trail, and the last-editor record.

#### Scenario: View button opens full details
- **WHEN** staff or an admin clicks View on a passport in their list
- **THEN** the system shows that passport's full details, including every field captured at entry, the system-managed dates, and the payment trail

#### Scenario: Fields never captured are shown as empty
- **WHEN** the detail view shows a passport that has no under-review, submitted, delivery, or payment recording
- **THEN** the unset fields are rendered as empty rather than hiding those details from the view

### Requirement: Passport editing does not modify system-managed fields
The system SHALL NOT accept changes to status, receipt date, under-review date, submitted date, delivery date, or delivery collector through the passport edit view: those fields remain governed by the status and delivery rules, and any values posted for them are ignored.

#### Scenario: Posted system-managed values are ignored
- **WHEN** an edit submission includes a status, receipt date, under-review date, submitted date, or delivery-date value alongside the edited fields
- **THEN** the system applies only the editable fields and leaves the passport's status and system-managed dates unchanged

## ADDED Requirements

### Requirement: Passport detail view shows a lifecycle timeline
The system SHALL display on the internal passport detail view the passport's custody timeline: the recorded receipt, under-review, submitted, and delivery milestones in stage order, each with its recorded timestamp, rendering yet-to-be-reached milestones as unset.

#### Scenario: Timeline shows every reached milestone
- **WHEN** the detail view shows a passport whose first three milestones are recorded
- **THEN** the timeline lists the receipt, under-review, and submitted milestones with their timestamps in stage order, and shows the delivery milestone as unset because the passport has not been delivered

#### Scenario: Delivered passport shows the complete timeline
- **WHEN** the detail view shows a delivered passport
- **THEN** the timeline lists all four milestones with their recorded timestamps in stage order
