import type { Participant } from "../db/schema.ts";
import type { ParticipantRepository } from "../db/repositories/participant.repository.ts";

export class ParticipantService {
  constructor(private participantRepo: ParticipantRepository) {}

  async getParticipant(id: string): Promise<Participant | undefined> {
    return this.participantRepo.findById(id);
  }

  async getParticipantByGroupAndTelegram(
    groupId: string,
    telegramId: string
  ): Promise<Participant | undefined> {
    return this.participantRepo.findByGroupAndTelegramId(groupId, telegramId);
  }

  async getGroupParticipants(groupId: string): Promise<Participant[]> {
    return this.participantRepo.findByGroupId(groupId);
  }

  async getParticipantCount(groupId: string): Promise<number> {
    return this.participantRepo.countByGroupId(groupId);
  }

  async getAssignment(participantId: string): Promise<Participant | undefined> {
    const participant = await this.participantRepo.findById(participantId);
    if (!participant?.assignedToId) {
      return undefined;
    }
    return this.participantRepo.findById(participant.assignedToId);
  }
}
