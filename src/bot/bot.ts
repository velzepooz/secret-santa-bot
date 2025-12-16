import { Bot, session, type MiddlewareFn } from "grammy";
import { drizzle } from "drizzle-orm/d1";
import type { BotContext, SessionData, Services } from "./context.ts";
import type { Env } from "../types.ts";
import {
  GroupRepository,
  ParticipantRepository,
  WishlistRepository,
} from "../db/repositories/index.ts";
import {
  GroupService,
  ParticipantService,
  WishlistService,
  DrawService,
} from "../services/index.ts";
import { D1SessionStorage } from "./session-storage.ts";

import { startCommand } from "./commands/start.ts";
import { helpCommand } from "./commands/help.ts";
import { createCommand, handleGroupNameInput } from "./commands/create.ts";
import { joinCommand, handleJoinCodeInput, handleDisplayNameInput } from "./commands/join.ts";
import { myGroupsCommand } from "./commands/mygroups.ts";
import { wishlistCommand, handleWishlistItemInput } from "./commands/wishlist.ts";
import { drawCommand } from "./commands/draw.ts";
import { revealCommand } from "./commands/reveal.ts";
import { handleCallbacks } from "./callbacks/index.ts";

export function createBot(env: Env): Bot<BotContext> {
  const bot = new Bot<BotContext>(env.BOT_TOKEN);

  // Session middleware with D1 storage (persists across restarts)
  bot.use(
    session({
      initial: (): SessionData => ({}),
      storage: new D1SessionStorage(env.DB),
      getSessionKey: (ctx) => {
        // Use chat_id:user_id as session key
        const chatId = ctx.chat?.id;
        const userId = ctx.from?.id;
        if (!chatId || !userId) return undefined;
        return `${chatId}:${userId}`;
      },
    })
  );

  // Database and services middleware
  bot.use(createServicesMiddleware(env));

  // Register commands
  bot.command("start", startCommand);
  bot.command("help", helpCommand);
  bot.command("create", createCommand);
  bot.command("join", joinCommand);
  bot.command("mygroups", myGroupsCommand);
  bot.command("wishlist", wishlistCommand);
  bot.command("draw", drawCommand);
  bot.command("reveal", revealCommand);

  // Handle callbacks from inline keyboards
  bot.on("callback_query:data", handleCallbacks);

  // Handle text messages for conversation flows
  bot.on("message:text", async (ctx) => {
    const awaiting = ctx.session.awaitingInput;

    if (awaiting === "group_name") {
      await handleGroupNameInput(ctx);
    } else if (awaiting === "display_name") {
      await handleDisplayNameInput(ctx);
    } else if (awaiting === "wishlist_item") {
      await handleWishlistItemInput(ctx);
    } else if (awaiting === "join_code") {
      await handleJoinCodeInput(ctx);
    }
  });

  // Error handler
  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  return bot;
}

function createServicesMiddleware(env: Env): MiddlewareFn<BotContext> {
  return async (ctx, next) => {
    const db = drizzle(env.DB);

    const groupRepo = new GroupRepository(db);
    const participantRepo = new ParticipantRepository(db);
    const wishlistRepo = new WishlistRepository(db);

    const services: Services = {
      groupService: new GroupService(groupRepo, participantRepo),
      participantService: new ParticipantService(participantRepo),
      wishlistService: new WishlistService(wishlistRepo, groupRepo, participantRepo),
      drawService: new DrawService(groupRepo, participantRepo, wishlistRepo),
    };

    ctx.db = db;
    ctx.services = services;

    await next();
  };
}
