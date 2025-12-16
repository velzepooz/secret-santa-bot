import type { StorageAdapter } from "grammy";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { sessions } from "../db/schema.ts";
import type { SessionData } from "./context.ts";

/**
 * D1-based session storage adapter for Grammy.
 * Persists sessions to Cloudflare D1 database so they survive server restarts.
 */
export class D1SessionStorage implements StorageAdapter<SessionData> {
  private db: DrizzleD1Database;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  async read(key: string): Promise<SessionData | undefined> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, key))
      .limit(1);

    const session = result[0];
    if (!session) {
      return undefined;
    }

    try {
      return JSON.parse(session.data) as SessionData;
    } catch {
      return undefined;
    }
  }

  async write(key: string, value: SessionData): Promise<void> {
    const data = JSON.stringify(value);

    await this.db
      .insert(sessions)
      .values({ id: key, data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: sessions.id,
        set: { data, updatedAt: new Date() },
      });
  }

  async delete(key: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, key));
  }
}

