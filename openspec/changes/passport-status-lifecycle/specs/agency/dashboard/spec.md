# Spec Delta

## MODIFIED Requirements

### Requirement: Agency sees passport status
The system SHALL show the current status for each passport on the agency dashboard, with each passport labelled by its stage: received, under review, submitted, or delivered.

#### Scenario: Status displayed per passport
- **WHEN** an agency views its passport list
- **THEN** each passport shows its current status

#### Scenario: All four stages are labelled
- **WHEN** an agency's passports are in each of the four stages
- **THEN** each passport is labelled with its stage — received, under review, submitted, or delivered — rather than only "received" or "delivered"
