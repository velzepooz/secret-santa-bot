.PHONY: install dev test build deploy db-generate db-migrate db-create clean help

# Default target
help:
	@echo "Secret Santa Bot - Available commands:"
	@echo ""
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Run local development server"
	@echo "  make test         - Run tests"
	@echo "  make test-watch   - Run tests in watch mode"
	@echo "  make typecheck    - Run TypeScript type checking"
	@echo "  make lint         - Run all checks (typecheck + test)"
	@echo ""
	@echo "  make db-create    - Create D1 database on Cloudflare"
	@echo "  make db-generate  - Generate database migrations"
	@echo "  make db-migrate   - Apply migrations to production DB"
	@echo "  make db-migrate-local - Apply migrations to local DB"
	@echo ""
	@echo "  make deploy       - Deploy to Cloudflare Workers"
	@echo "  make secret       - Set BOT_TOKEN secret on Cloudflare"
	@echo "  make logs         - Tail production logs"
	@echo ""
	@echo "  make clean        - Remove build artifacts"

# Development
install:
	bun install

dev:
	bun run dev

test:
	bun run test

test-watch:
	bun run test --watch

typecheck:
	bunx tsc --noEmit

lint: typecheck test

# Database
db-create:
	npx wrangler d1 create secret-santa-db

db-generate:
	bun run db:generate

db-migrate:
	npx wrangler d1 migrations apply secret-santa-db --remote

db-migrate-local:
	npx wrangler d1 migrations apply secret-santa-db --local

# Deployment
deploy: lint
	bun run deploy

deploy-force:
	bun run deploy

secret:
	npx wrangler secret put BOT_TOKEN

logs:
	npx wrangler tail

# Cleanup
clean:
	rm -rf node_modules .wrangler dist out coverage
