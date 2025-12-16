import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { wishlistItems, type WishlistItem, type NewWishlistItem } from "../schema.ts";

type Database = DrizzleD1Database<Record<string, unknown>>;

export class WishlistRepository {
  constructor(private db: Database) {}

  async create(item: NewWishlistItem): Promise<WishlistItem> {
    const [created] = await this.db.insert(wishlistItems).values(item).returning();
    return created!;
  }

  async findById(id: string): Promise<WishlistItem | undefined> {
    const [item] = await this.db.select().from(wishlistItems).where(eq(wishlistItems.id, id));
    return item;
  }

  async findByParticipantId(participantId: string): Promise<WishlistItem[]> {
    return this.db.select().from(wishlistItems).where(eq(wishlistItems.participantId, participantId));
  }

  async countByParticipantId(participantId: string): Promise<number> {
    const result = await this.db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.participantId, participantId));
    return result.length;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }

  async deleteByParticipantId(participantId: string): Promise<void> {
    await this.db.delete(wishlistItems).where(eq(wishlistItems.participantId, participantId));
  }
}
