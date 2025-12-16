import type { WishlistItem } from "../db/schema.ts";
import type { WishlistRepository } from "../db/repositories/wishlist.repository.ts";
import type { GroupRepository } from "../db/repositories/group.repository.ts";
import type { ParticipantRepository } from "../db/repositories/participant.repository.ts";
import { generateId } from "../utils/crypto.ts";

const MAX_WISHLIST_ITEMS = 10;

export interface AddWishlistItemResult {
  success: boolean;
  error?: "limit_reached" | "group_drawn" | "not_member";
  item?: WishlistItem;
}

export class WishlistService {
  constructor(
    private wishlistRepo: WishlistRepository,
    private groupRepo: GroupRepository,
    private participantRepo: ParticipantRepository
  ) {}

  async addItem(
    groupId: string,
    telegramId: string,
    itemText: string,
    url?: string
  ): Promise<AddWishlistItemResult> {
    const group = await this.groupRepo.findById(groupId);
    if (group?.status === "drawn") {
      return { success: false, error: "group_drawn" };
    }

    const participant = await this.participantRepo.findByGroupAndTelegramId(groupId, telegramId);
    if (!participant) {
      return { success: false, error: "not_member" };
    }

    const count = await this.wishlistRepo.countByParticipantId(participant.id);
    if (count >= MAX_WISHLIST_ITEMS) {
      return { success: false, error: "limit_reached" };
    }

    const item = await this.wishlistRepo.create({
      id: generateId(),
      participantId: participant.id,
      item: itemText,
      url: url || null,
    });

    return { success: true, item };
  }

  async removeItem(
    itemId: string,
    telegramId: string
  ): Promise<{ success: boolean; error?: string }> {
    const item = await this.wishlistRepo.findById(itemId);
    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const participant = await this.participantRepo.findById(item.participantId);
    if (!participant || participant.telegramId !== telegramId) {
      return { success: false, error: "Not authorized" };
    }

    const group = await this.groupRepo.findById(participant.groupId);
    if (group?.status === "drawn") {
      return { success: false, error: "Cannot modify after draw" };
    }

    await this.wishlistRepo.delete(itemId);
    return { success: true };
  }

  async getWishlist(participantId: string): Promise<WishlistItem[]> {
    return this.wishlistRepo.findByParticipantId(participantId);
  }

  async getWishlistByGroupAndTelegram(groupId: string, telegramId: string): Promise<WishlistItem[]> {
    const participant = await this.participantRepo.findByGroupAndTelegramId(groupId, telegramId);
    if (!participant) {
      return [];
    }
    return this.wishlistRepo.findByParticipantId(participant.id);
  }

  async getWishlistCount(participantId: string): Promise<number> {
    return this.wishlistRepo.countByParticipantId(participantId);
  }
}
