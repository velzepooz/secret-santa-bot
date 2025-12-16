import type { Participant, Group } from "../db/schema.ts";
import type { GroupRepository } from "../db/repositories/group.repository.ts";
import type { ParticipantRepository } from "../db/repositories/participant.repository.ts";
import type { WishlistRepository } from "../db/repositories/wishlist.repository.ts";

export interface DrawResult {
  success: boolean;
  error?: "not_organizer" | "already_drawn" | "too_few_participants" | "group_not_found";
  assignments?: Map<string, Participant>; // participantId -> assigned participant
}

export interface Assignment {
  giver: Participant;
  receiver: Participant;
  wishlist: { item: string; url: string | null }[];
}

export class DrawService {
  constructor(
    private groupRepo: GroupRepository,
    private participantRepo: ParticipantRepository,
    private wishlistRepo: WishlistRepository
  ) {}

  async performDraw(groupId: string, telegramId: string): Promise<DrawResult> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      return { success: false, error: "group_not_found" };
    }

    if (group.organizerTelegramId !== telegramId) {
      return { success: false, error: "not_organizer" };
    }

    if (group.status === "drawn") {
      return { success: false, error: "already_drawn" };
    }

    const participants = await this.participantRepo.findByGroupId(groupId);
    if (participants.length < 2) {
      return { success: false, error: "too_few_participants" };
    }

    // Perform the draw using cycle algorithm
    const shuffled = this.shuffleArray([...participants]);
    const assignments = new Map<string, Participant>();

    // Create cycle: each person gives to the next, last gives to first
    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i]!;
      const receiver = shuffled[(i + 1) % shuffled.length]!;
      assignments.set(giver.id, receiver);
      await this.participantRepo.updateAssignment(giver.id, receiver.id);
    }

    // Update group status
    await this.groupRepo.updateStatus(groupId, "drawn");

    return { success: true, assignments };
  }

  async getAssignmentDetails(groupId: string, telegramId: string): Promise<Assignment | null> {
    const participant = await this.participantRepo.findByGroupAndTelegramId(groupId, telegramId);
    if (!participant?.assignedToId) {
      return null;
    }

    const receiver = await this.participantRepo.findById(participant.assignedToId);
    if (!receiver) {
      return null;
    }

    const wishlistItems = await this.wishlistRepo.findByParticipantId(receiver.id);

    return {
      giver: participant,
      receiver,
      wishlist: wishlistItems.map((w) => ({ item: w.item, url: w.url })),
    };
  }

  async getAllAssignments(groupId: string): Promise<Assignment[]> {
    const participants = await this.participantRepo.findByGroupId(groupId);
    const assignments: Assignment[] = [];

    for (const participant of participants) {
      if (participant.assignedToId) {
        const receiver = await this.participantRepo.findById(participant.assignedToId);
        if (receiver) {
          const wishlistItems = await this.wishlistRepo.findByParticipantId(receiver.id);
          assignments.push({
            giver: participant,
            receiver,
            wishlist: wishlistItems.map((w) => ({ item: w.item, url: w.url })),
          });
        }
      }
    }

    return assignments;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
  }
}

// Pure function for testing - can be used without dependencies
export function createAssignments(participantIds: string[]): Map<string, string> {
  if (participantIds.length < 2) {
    throw new Error("Need at least 2 participants");
  }

  const shuffled = [...participantIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  const assignments = new Map<string, string>();
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i]!;
    const receiver = shuffled[(i + 1) % shuffled.length]!;
    assignments.set(giver, receiver);
  }

  return assignments;
}

// Validate that assignments form a valid Secret Santa
export function validateAssignments(assignments: Map<string, string>): boolean {
  const givers = new Set(assignments.keys());
  const receivers = new Set(assignments.values());

  // Everyone must give and receive
  if (givers.size !== receivers.size) return false;

  // Check each person gives to exactly one other person
  for (const [giver, receiver] of assignments) {
    // No self-assignment
    if (giver === receiver) return false;
  }

  // Check everyone receives exactly once
  const receiverCounts = new Map<string, number>();
  for (const receiver of assignments.values()) {
    receiverCounts.set(receiver, (receiverCounts.get(receiver) || 0) + 1);
  }
  for (const count of receiverCounts.values()) {
    if (count !== 1) return false;
  }

  return true;
}
