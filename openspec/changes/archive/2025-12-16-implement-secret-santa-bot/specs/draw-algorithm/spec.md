# Draw Algorithm

## ADDED Requirements

### Requirement: Perform Draw
The system SHALL randomly assign each participant to give a gift to exactly one other participant.

#### Scenario: Successful draw
- **WHEN** organizer triggers draw
- **AND** group has 3 or more participants
- **THEN** each participant is assigned exactly one recipient
- **AND** each participant receives exactly one gift
- **AND** no participant is assigned to themselves
- **AND** group status changes to "drawn"

#### Scenario: Draw notification
- **WHEN** draw is completed
- **THEN** all participants receive a private message
- **AND** message contains their recipient's display name
- **AND** message contains recipient's wishlist (if any)

### Requirement: Draw Fairness
The system SHALL ensure the draw algorithm is fair and unpredictable.

#### Scenario: Random assignment
- **WHEN** draw is performed multiple times with same participants
- **THEN** different valid assignments are possible
- **AND** no participant can predict their assignment

### Requirement: Draw Immutability
The system SHALL not allow re-drawing once a draw is complete.

#### Scenario: Prevent re-draw
- **WHEN** organizer tries to draw again
- **AND** group has already been drawn
- **THEN** bot displays error that draw is final

### Requirement: View Assignment
The system SHALL allow participants to view their Secret Santa assignment at any time after the draw.

#### Scenario: Reveal assignment
- **WHEN** participant uses /reveal command
- **AND** draw has been completed
- **THEN** bot displays their recipient's display name
- **AND** shows recipient's wishlist

#### Scenario: No assignment yet
- **WHEN** participant uses /reveal command
- **AND** draw has not been completed
- **THEN** bot displays message that draw hasn't happened

### Requirement: Assignment Privacy
The system SHALL keep assignments private - only the giver knows their recipient.

#### Scenario: Private messaging
- **WHEN** draw results are sent
- **THEN** each participant receives only their own assignment
- **AND** assignments are sent via private message, not group chat
