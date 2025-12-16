import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  organizerTelegramId: text("organizer_telegram_id").notNull(),
  budget: text("budget"),
  status: text("status", { enum: ["open", "drawn"] }).default("open").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  drawnAt: integer("drawn_at", { mode: "timestamp" }),
});

export const participants = sqliteTable(
  "participants",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    telegramId: text("telegram_id").notNull(),
    telegramUsername: text("telegram_username"),
    displayName: text("display_name").notNull(),
    assignedToId: text("assigned_to_id"),
    joinedAt: integer("joined_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("participant_group_user_idx").on(table.groupId, table.telegramId)]
);

export const wishlistItems = sqliteTable("wishlist_items", {
  id: text("id").primaryKey(),
  participantId: text("participant_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),
  item: text("item").notNull(),
  url: text("url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Table to track processed Telegram updates (prevents duplicate processing)
export const processedUpdates = sqliteTable("processed_updates", {
  updateId: integer("update_id").primaryKey(),
  processedAt: integer("processed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Table to store bot sessions (persists across server restarts)
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // Format: "chat_id:user_id"
  data: text("data").notNull(), // JSON serialized session data
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;
export type ProcessedUpdate = typeof processedUpdates.$inferSelect;
