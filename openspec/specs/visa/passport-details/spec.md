# Passport Details Specification

## Purpose

Defines how internal operators (STAFF and ADMIN) access a passport's full record: a read-only full-detail view, editing of every user-maintained field under the same validation rules as entry, and last-editor attribution recorded in the database for every update.

## Requirements

### Requirement: Internal passport detail view shows every passport field
The system SHALL provide an internal read-only passport detail view, opened via a View button on the staff or admin passport lists, that displays every stored field of the passport: agency name, intake collector, visa type, service, passport number, passport holder name, contact number, comment, fee, status, receipt date, delivery date, delivery collector, payment trail, and the last-editor record.

#### Scenario: View button opens full details
- **WHEN** staff or an admin clicks View on a passport in their list
- **THEN** the system shows that passport's full details, including every field captured at entry, the system-managed dates, and the payment trail

#### Scenario: Fields never captured are shown as empty
- **WHEN** the detail view shows a passport that has no delivery recording or payment and was created before visa-type/service registries existed
- **THEN** the unset fields are rendered as empty rather than hiding those details from the view

### Requirement: Passport detail and edit views are restricted to staff and admin
The system SHALL restrict the internal passport detail view and the passport edit view to authenticated STAFF and ADMIN users, re-verifying the acting user's role server-side on the pages and on every passport-update action.

#### Scenario: Staff and admin can open the views
- **WHEN** an authenticated staff member or admin opens a passport's detail view or edit view
- **THEN** the system renders the passport's content for them

#### Scenario: Agency cannot open the internal views
- **WHEN** an authenticated AGENCY user attempts to open a passport's internal detail view or edit view
- **THEN** the system denies access even when the passport belongs to that agency

#### Scenario: Action rejects non-internal callers directly
- **WHEN** a passport-update action is invoked by a user who is not STAFF or ADMIN
- **THEN** the system rejects the action regardless of any web-proxy filtering

### Requirement: Staff and admin can edit passport information fields
The system SHALL allow an authenticated staff member or admin to edit, via an Edit button leading to an edit view prefilled with the passport's current values, any of the passport's user-maintained fields: agency, intake collector, visa type, service, passport number, passport holder name, contact number, fee, and comment.

#### Scenario: Edit saves a corrected field
- **WHEN** staff or an admin submits an edit that corrects a passport's holder name and contact number while leaving the other fields unchanged
- **THEN** the system persists the submitted values on the passport, preserving every field that was not submitted

#### Scenario: Edit view is prefilled with current values
- **WHEN** staff or an admin opens a passport's edit view
- **THEN** the form shows the passport's current values for every editable field

### Requirement: Passport edits re-validate against entry rules
The system SHALL validate edited passport fields under the same rules that govern passport entry: the agency, intake collector, visa type, and service must exist in their admin registries, the agency's registered Gmail is re-resolved as the ownership reference when the agency changes, the passport number must remain unique across all passports excluding the passport being edited, and the fee must be a non-negative whole amount of taka.

#### Scenario: Unregistered selection is rejected on edit
- **WHEN** staff or an admin submits an edit naming an agency, collector, visa type, or service that is not registered
- **THEN** the system rejects the edit and directs the user to have the admin register it first

#### Scenario: Duplicate passport number is rejected on edit
- **WHEN** staff or an admin submits an edit changing a passport's number to one already recorded on a different passport
- **THEN** the system rejects the edit and identifies the number as already recorded, naming the holder of the conflicting passport

#### Scenario: A passport may keep or restate its own number
- **WHEN** staff or an admin submits an edit whose passport number equals the passport's current number
- **THEN** the system accepts the edit even though the number is already recorded on that same passport

#### Scenario: Invalid fee is rejected on edit
- **WHEN** staff or an admin submits an edit with a negative, fractional, or missing fee
- **THEN** the system rejects the edit and explains the fee must be a non-negative whole amount of taka

#### Scenario: Agency change re-resolves the ownership reference
- **WHEN** staff or an admin submits an edit changing a passport's agency to another registered agency
- **THEN** the system stores the new agency's registered Gmail as the passport's ownership reference along with the agency name

### Requirement: Passport editing does not modify system-managed fields
The system SHALL NOT accept changes to status, receipt date, delivery date, or delivery collector through the passport edit view: those fields remain governed by the status and delivery rules, and any values posted for them are ignored.

#### Scenario: Posted system-managed values are ignored
- **WHEN** an edit submission includes a status, receipt date, or delivery-date value alongside the edited fields
- **THEN** the system applies only the editable fields and leaves the passport's status and system-managed dates unchanged

### Requirement: Passport records its last editor on every update
The system SHALL record on each passport the editor of its most recent change — the acting user's role (STAFF or ADMIN), name, and email together with the change timestamp — refreshing this record on every passport update (field edit, comment edit, and status change with its delivery recording), and stamping the creating staff's role, name, and email with the entry timestamp when a passport is first created.

#### Scenario: Field edit updates the last editor
- **WHEN** staff or an admin saves an edit to a passport's information fields
- **THEN** the passport's last-editor record names that user's account, their role, and the save timestamp

#### Scenario: Status change updates the last editor
- **WHEN** staff or an admin changes a passport's status through the status flow
- **THEN** the passport's last-editor record is refreshed with that user's role, name, email, and the change timestamp, replacing the previously recorded editor

#### Scenario: Entry stamps the initial editor
- **WHEN** a staff member creates a passport entry
- **THEN** the passport's last-editor record is set to the creating staff's name, email, role, and the entry timestamp

#### Scenario: Last editor is user-independent of the registry
- **WHEN** a passport records its last editor
- **THEN** the record is stored on the passport itself and does not depend on any registry entry to remain resolvable

### Requirement: Passport displays its last editor
The system SHALL display each passport's last-editor record — the editor's name and role with the change timestamp — on the internal passport detail view and on the passport cards of the staff and admin lists.

#### Scenario: Detail view shows the last editor
- **WHEN** staff or an admin opens a passport's detail view
- **THEN** the view shows who last edited the passport, with their role and the timestamp of that change

#### Scenario: List card shows the last editor
- **WHEN** staff or an admin views their passport list
- **THEN** each passport card shows its last editor's name, role, and timestamp
