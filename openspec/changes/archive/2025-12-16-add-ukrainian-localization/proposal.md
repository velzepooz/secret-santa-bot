# Change: Add Ukrainian Localization

## Why

The bot is intended for use by Ukrainian-speaking friends.
All user-facing messages should be in Ukrainian to provide a native experience.

## What Changes

- Translate all bot messages to Ukrainian
- Translate inline keyboard button labels to Ukrainian
- Translate error messages to Ukrainian
- Update help command with Ukrainian descriptions

## Impact

- Affected specs: telegram-bot
- Affected code: All command handlers in `src/bot/commands/`,
callback handlers in `src/bot/callbacks/`
- No database changes required
- No API changes required
