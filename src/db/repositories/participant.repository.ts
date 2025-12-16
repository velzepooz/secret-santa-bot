import { and, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { participants, groups, type Participant, type NewParticipant, type Group } from "../schema.ts";

type Database = DrizzleD1Database<Record<string, unknown>>;

export class ParticipantRepository {
  constructor(private db: Database) {}

  async create(participant: NewParticipant): Promise<Participant> {
    const [created] = await this.db.insert(participants).values(participant).returning();
    return created!;
  }

  async findById(id: string): Promise<Participant | undefined> {
    const [participant] = await this.db.select().from(participants).where(eq(participants.id, id));
    return participant;
  }

  async findByGroupAndTelegramId(groupId: string, telegramId: string): Promise<Participant | undefined> {
    const [participant] = await this.db
      .select()
      .from(participants)
      .where(and(eq(participants.groupId, groupId), eq(participants.telegramId, telegramId)));
    return participant;
  }

  async findByGroupId(groupId: string): Promise<Participant[]> {
    return this.db.select().from(participants).where(eq(participants.groupId, groupId));
  }

  async findGroupsByTelegramId(telegramId: string): Promise<(Participant & { group: Group })[]> {
    const result = await this.db
      .select()
      .from(participants)
      .innerJoin(groups, eq(participants.groupId, groups.id))
      .where(eq(participants.telegramId, telegramId));

    return result.map((r) => ({ ...r.participants, group: r.groups }));
  }

  async countByGroupId(groupId: string): Promise<number> {
    const result = await this.db.select().from(participants).where(eq(participants.groupId, groupId));
    return result.length;
  }

  async updateAssignment(id: string, assignedToId: string): Promise<void> {
    await this.db.update(participants).set({ assignedToId }).where(eq(participants.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(participants).where(eq(participants.id, id));
  }
}
