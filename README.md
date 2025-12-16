# Secret Santa Telegram Bot

A Telegram bot for organizing Secret Santa gift exchanges with friends. Built with Bun, TypeScript, Grammy, and Cloudflare Workers.

## Features

- Create Secret Santa groups with invite codes
- Join groups and set display names
- Add wishlists with gift ideas (up to 10 items)
- Fair random draw algorithm (everyone gives and receives exactly one gift)
- Private assignment notifications via Telegram DM
- View your assignment anytime after the draw

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Bot Framework**: Grammy
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Workers
- **ORM**: Drizzle

## Prerequisites

- [Bun](https://bun.sh/) installed
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (installed as dev dependency)
- Telegram account to create a bot

## Local Development

### 1. Install dependencies

```bash
bun install
```

### 2. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy the bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 3. Create local D1 database

```bash
# Create the database
npx wrangler d1 create secret-santa-db

# Note the database_id from the output and update wrangler.toml
```

Update `wrangler.toml` with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "secret-santa-db"
database_id = "your-database-id-here"
```

### 4. Run migrations locally

```bash
npx wrangler d1 migrations apply secret-santa-db --local
```

### 5. Start development server

```bash
# Set bot token for local dev
export BOT_TOKEN="your-bot-token-here"

# Start the worker locally
bun run dev
```

### 6. Set up local webhook (for testing)

Use [ngrok](https://ngrok.com/) or similar to expose your local server:

```bash
ngrok http 8787
```

Then set the webhook:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<your-ngrok-url>/webhook"
```

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Type check
bunx tsc --noEmit
```

## Deployment to Cloudflare

### 1. Login to Cloudflare

```bash
npx wrangler login
```

### 2. Create D1 database (if not already created)

```bash
npx wrangler d1 create secret-santa-db
```

Copy the `database_id` from the output and update `wrangler.toml`.

### 3. Run migrations on remote database

```bash
npx wrangler d1 migrations apply secret-santa-db --remote
```

### 4. Set the bot token secret

```bash
npx wrangler secret put BOT_TOKEN
# Paste your bot token when prompted
```

### 5. Deploy

```bash
bun run deploy
```

Note the worker URL from the output (e.g., `https://secret-santa-bot.<your-subdomain>.workers.dev`).

### 6. Register webhook with Telegram

Visit this URL in your browser (replace with your values):

```
https://secret-santa-bot.<your-subdomain>.workers.dev/set-webhook
```

Or use curl:

```bash
curl "https://secret-santa-bot.<your-subdomain>.workers.dev/set-webhook"
```

### 7. Verify deployment

1. Open Telegram and find your bot
2. Send `/start` - you should see the welcome message
3. Try creating a group with `/create`

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Show main menu |
| `/create` | Create a new Secret Santa group |
| `/join <code>` | Join a group with invite code |
| `/mygroups` | View your groups |
| `/wishlist` | Manage your wishlist |
| `/draw` | (Organizer) Perform the draw |
| `/reveal` | View your assignment |
| `/help` | Show help message |

## Project Structure

```
src/
├── index.ts              # Worker entry point
├── types.ts              # Environment types
├── bot/
│   ├── bot.ts            # Grammy bot setup
│   ├── context.ts        # Bot context types
│   ├── commands/         # Command handlers
│   └── callbacks/        # Inline keyboard handlers
├── services/
│   ├── group.service.ts
│   ├── participant.service.ts
│   ├── wishlist.service.ts
│   └── draw.service.ts
├── db/
│   ├── schema.ts         # Drizzle schema
│   └── repositories/     # Data access layer
└── utils/
    └── crypto.ts         # ID and invite code generation

test/                     # Unit tests
migrations/               # D1 migrations
```

## Troubleshooting

### Bot not responding

1. Check webhook is set: `curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"`
2. Check worker logs: `npx wrangler tail`
3. Verify BOT_TOKEN secret is set: `npx wrangler secret list`

### Database errors

1. Ensure migrations are applied: `npx wrangler d1 migrations apply secret-santa-db --remote`
2. Check D1 binding in wrangler.toml matches the database

### "Webhook not set" or 404 errors

Make sure your worker is deployed and the URL is correct. The webhook endpoint is `/webhook`.

## License

MIT
