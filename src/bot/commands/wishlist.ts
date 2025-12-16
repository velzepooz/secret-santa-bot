import { InlineKeyboard } from "grammy";
import type { BotContext } from "../context.ts";

export async function wishlistCommand(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) {
    await ctx.reply("Не вдалося вас ідентифікувати. Спробуйте ще раз.");
    return;
  }

  const memberships = await ctx.services.groupService.getUserGroups(telegramId);

  if (memberships.length === 0) {
    await ctx.reply("Ви ще не в жодній групі. Спочатку створіть або приєднайтеся до групи!");
    return;
  }

  // If only one group, show wishlist directly
  if (memberships.length === 1) {
    ctx.session.activeGroupId = memberships[0]!.group.id;
    await showWishlistMenu(ctx, memberships[0]!.group.id, telegramId);
    return;
  }

  // Multiple groups - let user select
  const keyboard = new InlineKeyboard();
  for (const membership of memberships) {
    if (membership.group.status === "open") {
      keyboard.text(membership.group.name, `wishlist_group:${membership.group.id}`);
      keyboard.row();
    }
  }

  if (keyboard.inline_keyboard.length === 0) {
    await ctx.reply("У всіх ваших групах вже відбулося жеребкування. Списки бажань заблоковано.");
    return;
  }

  await ctx.reply("Оберіть групу для керування списком бажань:", { reply_markup: keyboard });
}

export async function showWishlistMenu(
  ctx: BotContext,
  groupId: string,
  telegramId: string
): Promise<void> {
  const group = await ctx.services.groupService.getGroupById(groupId);
  if (!group) {
    await ctx.reply("Групу не знайдено.");
    return;
  }

  const items = await ctx.services.wishlistService.getWishlistByGroupAndTelegram(groupId, telegramId);

  const keyboard = new InlineKeyboard();

  if (group.status === "open") {
    keyboard.text("➕ Додати", `wishlist_add:${groupId}`);
    if (items.length > 0) {
      keyboard.text("🗑️ Видалити", `wishlist_remove:${groupId}`);
    }
  }

  let message = `*Список бажань для "${group.name}"*\n\n`;

  if (items.length === 0) {
    message += "_Поки що порожньо._\n\nДодайте ідеї подарунків, щоб допомогти вашому Таємному Санті!";
  } else {
    message += items
      .map((item, i) => {
        let line = `${i + 1}. ${item.item}`;
        if (item.url) {
          line += ` [посилання](${item.url})`;
        }
        return line;
      })
      .join("\n");

    message += `\n\n_${items.length}/10 позицій_`;
  }

  if (group.status === "drawn") {
    message += "\n\n⚠️ _Жеребкування відбулось. Список бажань заблоковано._";
  }

  await ctx.reply(message, {
    parse_mode: "Markdown",
    reply_markup: keyboard.inline_keyboard.length > 0 ? keyboard : undefined,
    link_preview_options: { is_disabled: true },
  });
}

export async function handleWishlistItemInput(ctx: BotContext): Promise<void> {
  const text = ctx.message?.text?.trim();
  if (!text) {
    await ctx.reply("Будь ласка, введіть позицію.");
    return;
  }

  const telegramId = ctx.from?.id?.toString();
  const groupId = ctx.session.activeGroupId;

  if (!telegramId || !groupId) {
    await ctx.reply("Щось пішло не так. Спробуйте /wishlist ще раз.");
    ctx.session.awaitingInput = undefined;
    return;
  }

  // Check if text contains a URL
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
  const url = urlMatch ? urlMatch[1] : undefined;
  const itemText = url ? text.replace(url, "").trim() : text;

  if (!itemText) {
    await ctx.reply("Будь ласка, додайте опис, а не лише посилання.");
    return;
  }

  if (itemText.length > 200) {
    await ctx.reply("Опис занадто довгий. Використовуйте до 200 символів.");
    return;
  }

  const result = await ctx.services.wishlistService.addItem(groupId, telegramId, itemText, url);

  ctx.session.awaitingInput = undefined;

  if (!result.success) {
    const messages: Record<string, string> = {
      limit_reached: "Ви досягли максимуму — 10 позицій у списку бажань.",
      group_drawn: "Жеребкування відбулось. Додавати більше не можна.",
      not_member: "Ви не учасник цієї групи.",
    };
    await ctx.reply(messages[result.error!] || "Не вдалося додати позицію.");
    return;
  }

  await ctx.reply("Додано до списку бажань! ✨");
  await showWishlistMenu(ctx, groupId, telegramId);
}
