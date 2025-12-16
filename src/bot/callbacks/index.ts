import type { BotContext } from "../context.ts";
import { showWishlistMenu } from "../commands/wishlist.ts";
import { showDrawConfirmation, performDraw } from "../commands/draw.ts";
import { showAssignment } from "../commands/reveal.ts";

export async function handleCallbacks(ctx: BotContext): Promise<void> {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) {
    await ctx.answerCallbackQuery({ text: "Не вдалося вас ідентифікувати." });
    return;
  }

  const [action, ...params] = data.split(":");
  const param = params.join(":");

  try {
    switch (action) {
      case "create_group":
        ctx.session.awaitingInput = "group_name";
        await ctx.answerCallbackQuery();
        await ctx.reply("Як назвемо групу?");
        break;

      case "join_group":
        ctx.session.awaitingInput = "join_code";
        await ctx.answerCallbackQuery();
        await ctx.reply("Введіть код запрошення (наприклад, SANTA-ABC123):");
        break;

      case "my_groups":
        await ctx.answerCallbackQuery();
        await handleMyGroups(ctx, telegramId);
        break;

      case "select_group":
        ctx.session.activeGroupId = param;
        await ctx.answerCallbackQuery();
        await showGroupDetails(ctx, param, telegramId);
        break;

      case "wishlist_group":
        ctx.session.activeGroupId = param;
        await ctx.answerCallbackQuery();
        await showWishlistMenu(ctx, param, telegramId);
        break;

      case "wishlist_add":
        ctx.session.activeGroupId = param;
        ctx.session.awaitingInput = "wishlist_item";
        await ctx.answerCallbackQuery();
        await ctx.reply(
          "Введіть бажаний подарунок:\n\n_Можна додати посилання, наприклад: \"Синій светр https://example.com/sweater\"_",
          { parse_mode: "Markdown" }
        );
        break;

      case "wishlist_remove":
        await ctx.answerCallbackQuery();
        await showWishlistRemoveMenu(ctx, param, telegramId);
        break;

      case "wishlist_delete":
        await handleWishlistDelete(ctx, param, telegramId);
        break;

      case "draw_group":
        ctx.session.activeGroupId = param;
        await ctx.answerCallbackQuery();
        await showDrawConfirmation(ctx, param);
        break;

      case "confirm_draw":
        await ctx.answerCallbackQuery({ text: "Жеребкування..." });
        await performDraw(ctx, param);
        break;

      case "cancel_draw":
        await ctx.answerCallbackQuery({ text: "Скасовано" });
        await ctx.reply("Жеребкування скасовано.");
        break;

      case "reveal_group":
        await ctx.answerCallbackQuery();
        await showAssignment(ctx, param, telegramId);
        break;

      case "leave_group":
        await ctx.answerCallbackQuery();
        await showLeaveConfirmation(ctx, param);
        break;

      case "confirm_leave":
        await handleLeaveGroup(ctx, param, telegramId);
        break;

      case "cancel_leave":
        await ctx.answerCallbackQuery({ text: "Скасовано" });
        break;

      case "group_participants":
        await ctx.answerCallbackQuery();
        await showGroupParticipants(ctx, param);
        break;

      default:
        await ctx.answerCallbackQuery({ text: "Невідома дія" });
    }
  } catch (error) {
    console.error("Callback error:", error);
    await ctx.answerCallbackQuery({ text: "Сталася помилка" });
  }
}

async function handleMyGroups(ctx: BotContext, telegramId: string): Promise<void> {
  const { myGroupsCommand } = await import("../commands/mygroups.ts");
  await myGroupsCommand(ctx);
}

async function showGroupDetails(
  ctx: BotContext,
  groupId: string,
  telegramId: string
): Promise<void> {
  const group = await ctx.services.groupService.getGroupById(groupId);
  if (!group) {
    await ctx.reply("Групу не знайдено.");
    return;
  }

  const participants = await ctx.services.participantService.getGroupParticipants(groupId);
  const isOrganizer = group.organizerTelegramId === telegramId;

  const { InlineKeyboard } = await import("grammy");
  const keyboard = new InlineKeyboard();

  if (group.status === "open") {
    keyboard.text("📝 Мій список", `wishlist_group:${groupId}`);
    if (isOrganizer) {
      keyboard.text("🎲 Жеребкування", `draw_group:${groupId}`);
    }
    keyboard.row();
    if (!isOrganizer) {
      keyboard.text("🚪 Вийти з групи", `leave_group:${groupId}`);
    }
  } else {
    keyboard.text("🎁 Моє призначення", `reveal_group:${groupId}`);
  }

  keyboard.row().text("👥 Учасники", `group_participants:${groupId}`);

  let message = `*${group.name}*\n\n`;
  message += `*Статус:* ${group.status === "drawn" ? "Розіграно 🎁" : "Відкрита ⏳"}\n`;
  message += `*Учасників:* ${participants.length}\n`;
  if (group.budget) {
    message += `*Бюджет:* ${group.budget}\n`;
  }
  if (isOrganizer) {
    message += `*Код запрошення:* \`${group.inviteCode}\`\n`;
  }

  await ctx.reply(message, { parse_mode: "Markdown", reply_markup: keyboard });
}

async function showWishlistRemoveMenu(
  ctx: BotContext,
  groupId: string,
  telegramId: string
): Promise<void> {
  const items = await ctx.services.wishlistService.getWishlistByGroupAndTelegram(
    groupId,
    telegramId
  );

  if (items.length === 0) {
    await ctx.reply("Ваш список бажань порожній.");
    return;
  }

  const { InlineKeyboard } = await import("grammy");
  const keyboard = new InlineKeyboard();

  for (const item of items) {
    const label = item.item.length > 30 ? item.item.substring(0, 27) + "..." : item.item;
    keyboard.text(`🗑️ ${label}`, `wishlist_delete:${item.id}`);
    keyboard.row();
  }

  await ctx.reply("Оберіть позицію для видалення:", { reply_markup: keyboard });
}

async function handleWishlistDelete(
  ctx: BotContext,
  itemId: string,
  telegramId: string
): Promise<void> {
  const result = await ctx.services.wishlistService.removeItem(itemId, telegramId);

  if (!result.success) {
    await ctx.answerCallbackQuery({ text: result.error || "Не вдалося видалити" });
    return;
  }

  await ctx.answerCallbackQuery({ text: "Видалено" });

  if (ctx.session.activeGroupId) {
    await showWishlistMenu(ctx, ctx.session.activeGroupId, telegramId);
  }
}

async function showLeaveConfirmation(ctx: BotContext, groupId: string): Promise<void> {
  const group = await ctx.services.groupService.getGroupById(groupId);
  if (!group) {
    await ctx.reply("Групу не знайдено.");
    return;
  }

  const { InlineKeyboard } = await import("grammy");
  const keyboard = new InlineKeyboard()
    .text("Так, вийти", `confirm_leave:${groupId}`)
    .text("Скасувати", `cancel_leave:${groupId}`);

  await ctx.reply(
    `Ви впевнені, що хочете вийти з групи "${group.name}"?\n\nВаш список бажань буде видалено.`,
    { reply_markup: keyboard }
  );
}

async function handleLeaveGroup(
  ctx: BotContext,
  groupId: string,
  telegramId: string
): Promise<void> {
  const result = await ctx.services.groupService.leaveGroup(groupId, telegramId);

  if (!result.success) {
    await ctx.answerCallbackQuery({ text: result.error || "Не вдалося вийти" });
    return;
  }

  await ctx.answerCallbackQuery({ text: "Ви вийшли" });
  await ctx.reply("Ви вийшли з групи.");
}

async function showGroupParticipants(ctx: BotContext, groupId: string): Promise<void> {
  const group = await ctx.services.groupService.getGroupById(groupId);
  if (!group) {
    await ctx.reply("Групу не знайдено.");
    return;
  }

  const participants = await ctx.services.participantService.getGroupParticipants(groupId);

  let message = `*Учасники групи "${group.name}"*\n\n`;
  message += participants
    .map((p) => {
      const isOrganizer = p.telegramId === group.organizerTelegramId;
      return `• ${p.displayName}${isOrganizer ? " (Організатор)" : ""}`;
    })
    .join("\n");

  await ctx.reply(message, { parse_mode: "Markdown" });
}
