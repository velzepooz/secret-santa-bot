# Design: Secret Santa Telegram Bot

## Context
Building a Telegram bot for Secret Santa gift exchanges. The bot runs on Cloudflare Workers with D1 (SQLite) for persistence. Users interact via Telegram commands and inline keyboards. Must work within Cloudflare free tier limits.

## Goals / Non-Goals

**Goals:**
- Simple, intuitive UX via Telegram
- Reliable draw algorithm that guarantees everyone gives and receives
- Privacy - assignments are secret
- Free hosting on Cloudflare

**Non-Goals:**
- Web interface
- Multiple notification channels (email, SMS)
- Real-time updates / WebSocket features
- Multi-language support (English only for v1)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Telegram API   │────▶│ Cloudflare Worker│────▶│ Cloudflare  │
│  (Webhooks)     │◀────│   (grammy bot)   │◀────│     D1      │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

### Component Structure
```
src/
├── index.ts              # Worker entry point, webhook handler
├── bot/
│   ├── bot.ts            # Grammy bot instance
│   ├── commands/         # Command handlers (/start, /create, etc.)
│   └── callbacks/        # Inline keyboard callbacks
├── services/
│   ├── group.service.ts  # Group business logic
│   ├── participant.service.ts
│   ├── wishlist.service.ts
│   └── draw.service.ts   # Draw algorithm
├── db/
│   ├── schema.ts         # Drizzle schema
│   ├── client.ts         # D1 client setup
│   └── repositories/     # Data access layer
└── utils/
    └── crypto.ts         # Invite code generation
```

## Decisions

### Decision: Use grammy over telegraf
Grammy is more modern, has better TypeScript support, and works well with Cloudflare Workers (edge runtime compatible). Telegraf has Node.js dependencies that complicate Workers deployment.

### Decision: Use Drizzle ORM
Drizzle is lightweight, has excellent TypeScript inference, and has first-class D1 support. Alternatives like Prisma are heavier and have edge runtime issues.

### Decision: Webhook mode for production
Cloudflare Workers can't maintain long-polling connections. Webhooks are the only viable option and are more efficient anyway.

### Decision: Invite codes over deep links
Use short alphanumeric invite codes (e.g., `SANTA-ABC123`) that users can share. Easier to share verbally or copy/paste than Telegram deep links.

## Database Schema

```sql
-- Groups table
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  organizer_telegram_id TEXT NOT NULL,
  budget TEXT,
  status TEXT DEFAULT 'open', -- 'open', 'drawn', 'completed'
  created_at INTEGER DEFAULT (unixepoch()),
  drawn_at INTEGER
);

-- Participants table
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id),
  telegram_id TEXT NOT NULL,
  telegram_username TEXT,
  display_name TEXT NOT NULL,
  assigned_to_id TEXT REFERENCES participants(id),
  joined_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(group_id, telegram_id)
);

-- Wishlist items table
CREATE TABLE wishlist_items (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES participants(id),
  item TEXT NOT NULL,
  url TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
```

## Draw Algorithm

The draw creates a single cycle visiting all participants exactly once:

1. Shuffle participant list randomly
2. Assign each participant to the next in the shuffled list
3. Last participant is assigned to first (closes the cycle)

This guarantees:
- Everyone gives exactly one gift
- Everyone receives exactly one gift
- No one is assigned to themselves
- Algorithm runs in O(n) time

### Handling Exclusions (Optional)
If exclusions are added later, use backtracking or constraint satisfaction. For now, keep it simple with the cycle approach.

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message, show main menu |
| `/create` | Create new Secret Santa group |
| `/join <code>` | Join group with invite code |
| `/mygroups` | List user's groups |
| `/wishlist` | Manage wishlist items |
| `/draw` | (Organizer only) Trigger the draw |
| `/reveal` | View your Secret Santa assignment |
| `/help` | Show help message |

## Risks / Trade-offs

### Risk: D1 free tier limits
- **Mitigation**: 5M row reads/day is generous. Keep queries efficient. Add indexes on frequently queried columns.

### Risk: User confusion with multiple groups
- **Mitigation**: Clear group names in all messages. Use inline keyboards to select active group context.

### Risk: Draw timing (people haven't all joined yet)
- **Mitigation**: Only organizer can trigger draw. Show participant count before drawing. Warn if fewer than 3 participants.

## Open Questions
- Should wishlists have a max item limit? (Suggest: 10 items max)
- Should organizer be able to set a draw deadline? (Defer to v2)
- Should we support exclusion lists? (Defer to v2)
