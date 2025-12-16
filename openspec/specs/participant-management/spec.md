# participant-management Specification

## Purpose
TBD - created by archiving change implement-secret-santa-bot. Update Purpose after archive.
## Requirements
### Requirement: Display Name
The system SHALL allow participants to set a display name visible to other group members.

#### Scenario: Set display name on join
- **WHEN** user joins a group
- **THEN** bot prompts for display name
- **WHEN** user provides name
- **THEN** display name is stored for that group

#### Scenario: Display name in participant list
- **WHEN** organizer views participant list
- **THEN** each participant shows their display name

### Requirement: Organizer Role
The system SHALL designate the group creator as the organizer with special permissions.

#### Scenario: Organizer permissions
- **WHEN** user creates a group
- **THEN** user becomes the organizer
- **AND** can trigger the draw
- **AND** can view participant list

#### Scenario: Only organizer can draw
- **WHEN** non-organizer tries to trigger draw
- **THEN** bot displays permission error

### Requirement: Participant Count
The system SHALL enforce a minimum of 3 participants for a valid draw.

#### Scenario: Minimum participants check
- **WHEN** organizer tries to draw
- **AND** group has fewer than 3 participants
- **THEN** bot displays error with current count
- **AND** draw is not performed

### Requirement: View Participants
The system SHALL allow the organizer to view the list of participants before drawing.

#### Scenario: View participant list
- **WHEN** organizer requests participant list
- **THEN** bot displays all participants with display names
- **AND** shows total count

