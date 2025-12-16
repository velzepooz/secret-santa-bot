# Change: Implement Secret Santa Telegram Bot

## Why
Build a complete Secret Santa Telegram bot that allows friends to organize gift exchanges. Users need a simple, intuitive way to create groups, join exchanges, add wishlists, and receive secret assignments - all through Telegram chat.

## What Changes
- Add project scaffolding (Bun, TypeScript, Cloudflare Workers)
- Add database schema and Drizzle ORM setup for D1
- Add Telegram bot with grammy library
- Add group management (create, join, leave groups)
- Add participant management within groups
- Add optional wishlist feature for gift ideas
- Add draw algorithm that assigns Secret Santas fairly
- Add unit tests for all core business logic

## Impact
- Affected specs: group-management, participant-management, wishlist, draw-algorithm, telegram-bot
- Affected code: New project - all files are new
- External dependencies: Telegram Bot API, Cloudflare Workers, Cloudflare D1
