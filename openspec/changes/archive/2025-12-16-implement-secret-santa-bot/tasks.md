# Implementation Tasks

## 1. Project Setup
- [x] 1.1 Initialize Bun project with TypeScript
- [x] 1.2 Configure TypeScript strict mode
- [x] 1.3 Add Cloudflare Workers configuration (wrangler.toml)
- [x] 1.4 Install dependencies (grammy, drizzle-orm, @cloudflare/workers-types)
- [x] 1.5 Set up project structure (src/bot, src/services, src/db, src/utils)
- [x] 1.6 Configure environment variables for bot token

## 2. Database Layer
- [x] 2.1 Create Drizzle schema (groups, participants, wishlist_items)
- [x] 2.2 Set up D1 client initialization
- [x] 2.3 Create group repository (CRUD operations)
- [x] 2.4 Create participant repository (CRUD operations)
- [x] 2.5 Create wishlist repository (CRUD operations)
- [x] 2.6 Write unit tests for repositories (mocked D1)

## 3. Core Services
- [x] 3.1 Implement group service (create, join, leave, list)
- [x] 3.2 Implement invite code generator (utils/crypto.ts)
- [x] 3.3 Implement participant service (add, remove, list)
- [x] 3.4 Implement wishlist service (add, remove, list items)
- [x] 3.5 Implement draw service (shuffle algorithm, assignment)
- [x] 3.6 Write unit tests for group service
- [x] 3.7 Write unit tests for participant service
- [x] 3.8 Write unit tests for wishlist service
- [x] 3.9 Write unit tests for draw algorithm

## 4. Telegram Bot Setup
- [x] 4.1 Create Grammy bot instance
- [x] 4.2 Set up Worker entry point with webhook handler
- [x] 4.3 Implement /start command handler
- [x] 4.4 Implement /help command handler
- [x] 4.5 Write unit tests for command handlers

## 5. Group Management Commands
- [x] 5.1 Implement /create command (group creation flow)
- [x] 5.2 Implement /join command (join with invite code)
- [x] 5.3 Implement /mygroups command (list user's groups)
- [x] 5.4 Implement leave group action via inline keyboard
- [x] 5.5 Add inline keyboards for group selection
- [x] 5.6 Write unit tests for group commands

## 6. Wishlist Commands
- [x] 6.1 Implement /wishlist command (view/manage wishlist)
- [x] 6.2 Add "Add item" flow with conversation
- [x] 6.3 Add "Remove item" flow with selection
- [x] 6.4 Enforce 10-item limit
- [x] 6.5 Write unit tests for wishlist commands

## 7. Draw Feature
- [x] 7.1 Implement /draw command (organizer only)
- [x] 7.2 Add confirmation dialog before draw
- [x] 7.3 Implement participant notification after draw
- [x] 7.4 Implement /reveal command (view assignment)
- [x] 7.5 Include wishlist in reveal message
- [x] 7.6 Write unit tests for draw commands

## 8. Polish & Error Handling
- [x] 8.1 Add error handling middleware for bot
- [x] 8.2 Add user-friendly error messages
- [x] 8.3 Add logging for debugging
- [x] 8.4 Handle edge cases (empty groups, duplicate joins, etc.)

## 9. Deployment (Manual Steps)
- [ ] 9.1 Create D1 database via Wrangler: `wrangler d1 create secret-santa-db`
- [ ] 9.2 Update wrangler.toml with database_id
- [ ] 9.3 Run database migrations: `wrangler d1 migrations apply secret-santa-db --local` then `--remote`
- [ ] 9.4 Create bot via @BotFather and get token
- [ ] 9.5 Set bot token secret: `wrangler secret put BOT_TOKEN`
- [ ] 9.6 Deploy to Cloudflare Workers: `bun run deploy`
- [ ] 9.7 Register webhook: Visit `https://your-worker.workers.dev/set-webhook`
- [ ] 9.8 Test end-to-end flow

## Dependencies
- Tasks in section 2 must complete before section 3
- Tasks in section 3 must complete before sections 5-7
- Task 4.1-4.2 must complete before sections 5-7
- Section 8 can run in parallel with sections 5-7

## Parallelizable Work
- Sections 5, 6, 7 can be developed in parallel after sections 2-4 complete
- Unit tests can be written alongside each feature
