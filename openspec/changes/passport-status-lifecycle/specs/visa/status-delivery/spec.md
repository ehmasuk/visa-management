# Spec Delta

## MODIFIED Requirements

### Requirement: Staff can change passport status
The system SHALL allow an authenticated staff member or admin to advance a passport one stage forward in its lifecycle by confirming the next-stage action for the passport's current stage, without entering any stage data manually.

#### Scenario: Status change is persisted
- **WHEN** a staff member or admin confirms the next-stage action for a passport's current stage
- **THEN** the system updates and persists the passport's status field along with the automatic milestone timestamp of the newly entered stage

#### Scenario: Advance from received to under review
- **WHEN** a staff member or admin confirms the review action on a passport currently in "received"
- **THEN** the system updates the passport record's status field to "under review"

#### Scenario: Advance from under review to submitted
- **WHEN** a staff member or admin confirms the submit action on a passport currently in "under review"
- **THEN** the system updates the passport record's status field to "submitted"

#### Scenario: Advance from submitted to delivered
- **WHEN** a staff member or admin completes the delivery action on a passport currently in "submitted"
- **THEN** the system updates the passport record's status field to "delivered"

### Requirement: Passport statuses are from a defined set
The system SHALL restrict passport status to a defined set: received, under review, submitted, delivered.

#### Scenario: Valid status values
- **WHEN** a passport record is read
- **THEN** its status is one of received, under review, submitted, or delivered

## ADDED Requirements

### Requirement: Passport status moves through one ordered pipeline
The system SHALL restrict passport stage transitions to single forward steps through the ordered pipeline received → under review → submitted → delivered: a transition that skips a stage or moves to an earlier stage SHALL be rejected, and "delivered" SHALL be terminal.

#### Scenario: Skipping a stage is rejected
- **WHEN** a staff member or admin attempts to set a received passport's status directly to "submitted" or "delivered"
- **THEN** the system rejects the transition and the passport remains in "received"

#### Scenario: Backward transitions are rejected
- **WHEN** a staff member or admin attempts to set a submitted passport's status back to "under review" or "received"
- **THEN** the system rejects the transition and the passport remains in "submitted"

#### Scenario: Delivered is terminal
- **WHEN** a staff member or admin attempts to advance or change the status of a delivered passport
- **THEN** the system rejects the transition, the passport remains delivered, and its delivery recording (delivery date and delivery collector) stays intact

### Requirement: Stage milestones are recorded automatically
The system SHALL record each lifecycle milestone automatically at the moment its stage is entered, never from user input: the receipt date when the passport is entered, the under-review date when it reaches "under review", and the submitted date when it reaches "submitted" (the delivery date is governed by the delivery rules).

#### Scenario: Under-review milestone is recorded
- **WHEN** a received passport is advanced to "under review"
- **THEN** the system sets the under-review date to the transition timestamp and any posted value for it is ignored

#### Scenario: Submitted milestone is recorded
- **WHEN** an under-review passport is advanced to "submitted"
- **THEN** the system sets the submitted date to the transition timestamp and any posted value for it is ignored

#### Scenario: Milestones persist across later stage advances
- **WHEN** a passport is advanced through several stages
- **THEN** every previously recorded milestone keeps its own timestamp and none is overwritten by a later stage

### Requirement: Stage advance shows exactly one next-stage action
The system SHALL show staff and admin pages for each passport exactly one lifecycle action corresponding to the passport's current stage — a review action on received passports, a submit action on under-review passports, and the delivery action on submitted passports — and no lifecycle action on delivered passports.

#### Scenario: One action per stage
- **WHEN** staff or admin views the passport list
- **THEN** a received passport shows only the review action, an under-review passport only the submit action, and a submitted passport only the delivery action

#### Scenario: No action on delivered
- **WHEN** staff or admin views a delivered passport
- **THEN** no lifecycle action is offered for it

### Requirement: Intake and delivery collectors are recorded distinctly
The system SHALL record the intake collector (who brought the passport from the agency, captured at entry) separately from the delivery collector (who receives the delivered passport): a delivery transition SHALL NOT modify the intake collector.

#### Scenario: Delivery does not overwrite the intake collector
- **WHEN** a passport whose intake collector is "A" is set to "delivered" with delivery collector "B"
- **THEN** the passport's intake collector remains "A" and the delivery collector is recorded as "B"

#### Scenario: Passport never delivered has no delivery collector
- **WHEN** a passport that has never been delivered is read
- **THEN** its delivery date and delivery collector are unset

## REMOVED Requirements

### Requirement: Intake and delivery collectors are recorded separately
**Reason**: Delivered is terminal in the new pipeline, so the scenario "Leaving delivered clears delivery recording" (clearing the delivery date and collector on the way out of delivered) no longer describes any reachable behavior, and this version of the requirement cannot be reworded without losing that scenario. The surviving intake/delivery separation behaviors return under the sharper "Intake and delivery collectors are recorded distinctly".
**Migration**: Delivery recordings (delivery date and delivery collector) now persist for the passport's life; intake collectors continue to be captured at entry and are never overwritten by a delivery transition.
