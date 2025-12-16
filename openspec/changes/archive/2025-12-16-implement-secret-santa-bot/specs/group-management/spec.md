# Group Management

## ADDED Requirements

### Requirement: Create Group
The system SHALL allow users to create a new Secret Santa group with a name and optional budget.

#### Scenario: Successful group creation
- **WHEN** user sends /create command
- **THEN** bot prompts for group name
- **WHEN** user provides group name
- **THEN** system creates group with unique invite code
- **AND** user becomes the organizer
- **AND** bot displays invite code to share

#### Scenario: Create group with budget
- **WHEN** user creates a group
- **AND** specifies a budget amount
- **THEN** budget is stored and shown to all participants

### Requirement: Join Group
The system SHALL allow users to join an existing group using an invite code.

#### Scenario: Successful join
- **WHEN** user sends /join command with valid invite code
- **AND** group status is "open"
- **THEN** user is added as participant
- **AND** bot confirms successful join
- **AND** user is prompted to add display name

#### Scenario: Invalid invite code
- **WHEN** user sends /join command with invalid code
- **THEN** bot displays error message

#### Scenario: Group already drawn
- **WHEN** user tries to join a group that has already been drawn
- **THEN** bot displays error that group is closed

#### Scenario: Already a participant
- **WHEN** user tries to join a group they're already in
- **THEN** bot displays message that they're already a member

### Requirement: Leave Group
The system SHALL allow participants to leave a group before the draw.

#### Scenario: Successful leave
- **WHEN** participant requests to leave a group
- **AND** group status is "open"
- **THEN** participant is removed from group
- **AND** their wishlist items are deleted

#### Scenario: Cannot leave after draw
- **WHEN** participant tries to leave after draw
- **THEN** bot displays error that they cannot leave

### Requirement: List Groups
The system SHALL allow users to view all groups they participate in.

#### Scenario: View my groups
- **WHEN** user sends /mygroups command
- **THEN** bot displays list of groups with name, status, and participant count

### Requirement: Group Status
The system SHALL track group status through its lifecycle.

#### Scenario: Group status transitions
- **WHEN** group is created
- **THEN** status is "open"
- **WHEN** draw is performed
- **THEN** status changes to "drawn"
