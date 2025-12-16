import type { Group, Participant } from "../db/schema.ts";
import type { GroupRepository } from "../db/repositories/group.repository.ts";
import type { ParticipantRepository } from "../db/repositories/participant.repository.ts";
import { generateId, generateInviteCode } from "../utils/crypto.ts";

export interface CreateGroupParams {
  name: string;
  organizerTelegramId: string;
  organizerDisplayName: string;
  organizerUsername?: string;
  budget?: string;
}

export interface JoinGroupResult {
  success: boolean;
  error?: "invalid_code" | "already_member" | "group_closed";
  group?: Group;
  participant?: Participant;
}

export class GroupService {
  constructor(
    private groupRepo: GroupRepository,
    private participantRepo: ParticipantRepository
  ) {}

  async createGroup(params: CreateGroupParams): Promise<{ group: Group; participant: Participant }> {
    const group = await this.groupRepo.create({
      id: generateId(),
      name: params.name,
      inviteCode: generateInviteCode(),
      organizerTelegramId: params.organizerTelegramId,
      budget: params.budget,
      status: "open",
    });

    const participant = await this.participantRepo.create({
      id: generateId(),
      groupId: group.id,
      telegramId: params.organizerTelegramId,
      telegramUsername: params.organizerUsername,
      displayName: params.organizerDisplayName,
    });

    return { group, participant };
  }

  async joinGroup(
    inviteCode: string,
    telegramId: string,
    displayName: string,
    username?: string
  ): Promise<JoinGroupResult> {
    const group = await this.groupRepo.findByInviteCode(inviteCode.toUpperCase());

    if (!group) {
      return { success: false, error: "invalid_code" };
    }

    if (group.status !== "open") {
      return { success: false, error: "group_closed" };
    }

    const existing = await this.participantRepo.findByGroupAndTelegramId(group.id, telegramId);
    if (existing) {
      return { success: false, error: "already_member" };
    }

    const participant = await this.participantRepo.create({
      id: generateId(),
      groupId: group.id,
      telegramId,
      telegramUsername: username,
      displayName,
    });

    return { success: true, group, participant };
  }

  async leaveGroup(groupId: string, telegramId: string): Promise<{ success: boolean; error?: string }> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      return { success: false, error: "Group not found" };
    }

    if (group.status !== "open") {
      return { success: false, error: "Cannot leave after draw" };
    }

    const participant = await this.participantRepo.findByGroupAndTelegramId(groupId, telegramId);
    if (!participant) {
      return { success: false, error: "Not a member" };
    }

    if (group.organizerTelegramId === telegramId) {
      return { success: false, error: "Organizer cannot leave" };
    }

    await this.participantRepo.delete(participant.id);
    return { success: true };
  }

  async getGroupById(id: string): Promise<Group | undefined> {
    return this.groupRepo.findById(id);
  }

  async getGroupByInviteCode(code: string): Promise<Group | undefined> {
    return this.groupRepo.findByInviteCode(code.toUpperCase());
  }

  async getUserGroups(telegramId: string): Promise<(Participant & { group: Group })[]> {
    return this.participantRepo.findGroupsByTelegramId(telegramId);
  }

  async isOrganizer(groupId: string, telegramId: string): Promise<boolean> {
    const group = await this.groupRepo.findById(groupId);
    return group?.organizerTelegramId === telegramId;
  }
}
