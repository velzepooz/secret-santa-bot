import type { Context, SessionFlavor } from "grammy";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { GroupRepository, ParticipantRepository, WishlistRepository } from "../db/index.ts";
import type { GroupService, ParticipantService, WishlistService, DrawService } from "../services/index.ts";

export interface SessionData {
  activeGroupId?: string;
  awaitingInput?: "group_name" | "display_name" | "wishlist_item" | "join_code";
  pendingGroupName?: string;
}

export interface Services {
  groupService: GroupService;
  participantService: ParticipantService;
  wishlistService: WishlistService;
  drawService: DrawService;
}

export interface Repositories {
  groupRepo: GroupRepository;
  participantRepo: ParticipantRepository;
  wishlistRepo: WishlistRepository;
}

export type BotContext = Context &
  SessionFlavor<SessionData> & {
    db: DrizzleD1Database;
    services: Services;
  };
