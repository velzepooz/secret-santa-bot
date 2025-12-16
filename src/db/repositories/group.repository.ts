import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { groups, type Group, type NewGroup } from "../schema.ts";

type Database = DrizzleD1Database<Record<string, unknown>>;

export class GroupRepository {
  constructor(private db: Database) {}

  async create(group: NewGroup): Promise<Group> {
    const [created] = await this.db.insert(groups).values(group).returning();
    return created!;
  }

  async findById(id: string): Promise<Group | undefined> {
    const [group] = await this.db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async findByInviteCode(inviteCode: string): Promise<Group | undefined> {
    const [group] = await this.db.select().from(groups).where(eq(groups.inviteCode, inviteCode));
    return group;
  }

  async updateStatus(id: string, status: "open" | "drawn"): Promise<void> {
    await this.db
      .update(groups)
      .set({ status, drawnAt: status === "drawn" ? new Date() : null })
      .where(eq(groups.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(groups).where(eq(groups.id, id));
  }
}
