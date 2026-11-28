# Passport Details Specification

## Purpose

Defines how internal operators (STAFF and ADMIN) see a passport's full record directly in their list, edit every user-maintained field under the same validation rules as entry, and record last-editor attribution on every update. There is no separate per-passport view page.

## Requirements

### Requirement: Staff and admin lists show every passport field
The system SHALL display every stored field of a passport directly in the staff and admin passport lists (one shared table): agency name, branch, intake collector, visa type, service, passport number, passport holder name, contact number, comment, fee, status, receipt/under-review/submitted/delivery dates, delivery collector, and the complete last-editor record. No separate per-passport view page SHALL be required.

#### Scenario: Full record visible in the list
- **WHEN** staff or an admin opens their passport list
- **THEN** each row shows all fields captured at entry, the system-managed dates, and the last-editor details

#### Scenario: Fields never captured are shown as empty
- **WHEN** the list shows a passport that has no delivery recording and was created before visa-type/service/branch registries existed
- **THEN** the unset fields are rendered as empty rather than hiding those columns from the view

### Requirement: The edit view is restricted to staff and admin
The system SHALL restrict the passport edit view to authenticated STAFF and ADMIN users, re-verifying the acting user's role server-side on the page and on every passport-update action.

#### Scenario: Staff and admin can open the edit view
- **WHEN** an authenticated staff member or admin opens a passport's edit view
- **THEN** the system renders the passport's editable fields for them

#### Scenario: Non-internal users cannot open the edit view
- **WHEN** a signed-in user who is not STAFF or ADMIN attempts to open a passport's edit view
- **THEN** the system denies access

#### Scenario: Action rejects non-internal callers directly
- **WHEN** a passport-update action is invoked by a user who is not STAFF or ADMIN
- **THEN** the system rejects the action regardless of any web-proxy filtering

### Requirement: Staff and admin can edit passport information fields
The system SHALL allow an authenticated staff member or admin to edit, via an Edit button leading to an edit view prefilled with the passport's current values, any of the passport's user-maintained fields: agency, branch, intake collector, visa type, service, passport number, passport holder name, contact number, fee, and comment.

#### Scenario: Edit saves a corrected field
- **WHEN** staff or an admin submits an edit that corrects a passport's holder name and contact number while leaving the other fields unchanged
- **THEN** the system persists the submitted values on the passport, preserving every field that was not submitted

#### Scenario: Edit view is prefilled with current values
- **WHEN** staff or an admin opens a passport's edit view
- **THEN** the form shows the passport's current values for every editable field

### Requirement: Passport edits re-validate against entry rules
The system SHALL validate edited passport fields under the same rules that govern passport entry: the agency, branch, intake collector, visa type, and service must exist in their admin registries, and the fee must be a non-negative whole amount of taka. Passport numbers are not unique, so no uniqueness check SHALL be applied on edit.

#### Scenario: Unregistered selection is rejected on edit
- **WHEN** staff or an admin submits an edit naming an agency, branch, collector, visa type, or service that is not registered
- **THEN** the system rejects the edit and directs the user to have the admin register it first

#### Scenario: A passport number may be shared by several entries
- **WHEN** staff or an admin submits an edit whose passport number is also recorded on another passport
- **THEN** the system accepts the edit without a uniqueness conflict

#### Scenario: Invalid fee is rejected on edit
- **WHEN** staff or an admin submits an edit with a negative, fractional, or missing fee
- **THEN** the system rejects the edit and explains the fee must be a non-negative whole amount of taka

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

### Requirement: Passport list displays its last editor
The system SHALL display each passport's last-editor record — the editor's name, role, email, and change timestamp — in the staff and admin list table.

#### Scenario: List row shows the last editor
- **WHEN** staff or an admin views their passport list
- **THEN** each row shows who last edited the passport, with their role, email, and the timestamp of that change
