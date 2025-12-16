# Wishlist

## ADDED Requirements

### Requirement: Add Wishlist Item
The system SHALL allow participants to add gift ideas to their wishlist.

#### Scenario: Add item to wishlist
- **WHEN** participant uses /wishlist command
- **AND** selects "Add item"
- **AND** provides item description
- **THEN** item is added to their wishlist

#### Scenario: Add item with URL
- **WHEN** participant adds wishlist item
- **AND** includes a URL
- **THEN** URL is stored with the item

### Requirement: View Own Wishlist
The system SHALL allow participants to view and manage their own wishlist.

#### Scenario: View wishlist
- **WHEN** participant uses /wishlist command
- **THEN** bot displays their current wishlist items

#### Scenario: Empty wishlist
- **WHEN** participant has no wishlist items
- **THEN** bot displays message that wishlist is empty
- **AND** prompts to add items

### Requirement: Remove Wishlist Item
The system SHALL allow participants to remove items from their wishlist before the draw.

#### Scenario: Remove item
- **WHEN** participant selects an item to remove
- **AND** group has not been drawn
- **THEN** item is deleted from wishlist

#### Scenario: Cannot modify after draw
- **WHEN** participant tries to add or remove wishlist items
- **AND** group has been drawn
- **THEN** bot displays error that wishlist is locked

### Requirement: View Recipient Wishlist
The system SHALL show the recipient's wishlist to their Secret Santa after the draw.

#### Scenario: View assignment's wishlist
- **WHEN** draw has been completed
- **AND** participant views their assignment
- **THEN** bot displays recipient's display name
- **AND** shows recipient's wishlist items (if any)

#### Scenario: Recipient has no wishlist
- **WHEN** recipient has empty wishlist
- **THEN** bot indicates no wishlist items were added

### Requirement: Wishlist Limit
The system SHALL limit wishlist items to prevent abuse.

#### Scenario: Maximum items reached
- **WHEN** participant tries to add item
- **AND** they already have 10 items
- **THEN** bot displays error that limit is reached
