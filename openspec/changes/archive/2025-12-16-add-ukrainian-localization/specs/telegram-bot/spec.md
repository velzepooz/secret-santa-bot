## ADDED Requirements

### Requirement: Ukrainian Language
The system SHALL display all user-facing messages in Ukrainian.

#### Scenario: Bot messages in Ukrainian
- **WHEN** bot sends any message to user
- **THEN** message text is in Ukrainian language

#### Scenario: Inline keyboard labels in Ukrainian
- **WHEN** bot displays inline keyboard
- **THEN** all button labels are in Ukrainian language

#### Scenario: Error messages in Ukrainian
- **WHEN** bot displays an error message
- **THEN** error text is in Ukrainian language
