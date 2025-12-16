# Project Context

## Purpose
A Secret Santa Telegram bot for organizing gift exchanges among friends. Users interact entirely through Telegram - no web interface needed. The bot handles group creation, participant management, and random assignment of gift recipients.

## Tech Stack
- **Runtime**: Bun
- **Language**: TypeScript
- **Frontend**: Telegram Bot API (grammy or telegraf library)
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Workers
- **ORM**: Drizzle ORM (lightweight, works well with D1)

## Project Conventions

### Code Style
- Use TypeScript strict mode
- Prefer `const` over `let`
- Use camelCase for variables/functions, PascalCase for types/classes
- Keep functions small and focused
- Use async/await over raw promises

### Architecture Patterns
- Command handler pattern for bot commands
- Repository pattern for database access
- Keep bot logic separate from business logic
- Use environment variables for secrets (bot token, etc.)

### Testing Strategy
- Unit tests for core logic (draw algorithm, validation)
- Integration tests for database operations
- Manual testing for Telegram bot interactions

### Git Workflow
- Main branch is production-ready
- Feature branches for new work
- Conventional commits (feat:, fix:, docs:, etc.)

## Domain Context
**Secret Santa Rules:**
- Each participant is assigned exactly one other participant to give a gift to
- Each participant receives exactly one gift (everyone gives and receives)
- No one should be assigned to themselves
- Assignments are secret until reveal (or forever)
- Optional: custom exclusions (e.g., couples shouldn't draw each other)
- Optional: budget limits for gifts

**Wishlist Feature (optional):**
- Participants can optionally add gift ideas to help their Secret Santa
- Wishlist is shown to the person who draws them
- Items can be added/edited/removed until the draw happens
- After draw, wishlist becomes read-only for the gift-giver

**Bot Flow:**
1. User creates a new Secret Santa group
2. Invite link/code shared with friends
3. Friends join the group via bot
4. Participants add their wishlists (optional)
5. Organizer triggers the draw when ready
6. Each participant receives a private message with their assignment + recipient's wishlist

## Important Constraints
- **Free tier limits**: Cloudflare Workers (100k requests/day), D1 (5GB storage, 5M rows read/day)
- **Privacy**: Assignments must be kept secret - only the assigned person sees their match
- **Telegram API**: Rate limits apply, use webhooks for production
- **No persistent state in Workers**: All state must be in D1

## External Dependencies
- **Telegram Bot API**: Create bot via @BotFather, requires bot token
- **Cloudflare Account**: For Workers and D1 deployment
- **Wrangler CLI**: For local dev and deployment to Cloudflare
