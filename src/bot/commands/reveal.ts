import { InlineKeyboard } from "grammy";
import type { BotContext } from "../context.ts";

export async function revealCommand(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) {
    await ctx.reply("Не вдалося вас ідентифікувати. Спробуйте ще раз.");
    return;
  }

  const memberships = await ctx.services.groupService.getUserGroups(telegramId);
  const drawnGroups = memberships.filter((m) => m.group.status === "drawn");

  if (drawnGroups.length === 0) {
    const openGroups = memberships.filter((m) => m.group.status === "open");
    if (openGroups.length > 0) {
      await ctx.reply(
        "У жодній з ваших груп ще не відбулось жеребкування. Зачекайте, поки організатор його проведе!"
      );
    } else {
      await ctx.reply("Ви ще не в жодній групі. Спочатку створіть або приєднайтеся до групи!");
    }
    return;
  }

  // If only one drawn group, show assignment directly
  if (drawnGroups.length === 1) {
    await showAssignment(ctx, drawnGroups[0]!.group.id, telegramId);
    return;
  }

  // Multiple drawn groups - let user select
  const keyboard = new InlineKeyboard();
  for (const membership of drawnGroups) {
    keyboard.text(`🎁 ${membership.group.name}`, `reveal_group:${membership.group.id}`);
    keyboard.row();
  }

  await ctx.reply("Оберіть групу, щоб побачити своє призначення:", { reply_markup: keyboard });
}

export async function showAssignment(
  ctx: BotContext,
  groupId: string,
  telegramId: string
): Promise<void> {
  const assignment = await ctx.services.drawService.getAssignmentDetails(groupId, telegramId);

  if (!assignment) {
    await ctx.reply("Не вдалося знайти ваше призначення. Можливо, жеребкування ще не відбулось.");
    return;
  }

  const group = await ctx.services.groupService.getGroupById(groupId);

  let message = `🎅 *Ваше призначення Таємного Санти*\n*Група:* ${group?.name}\n\nВи даруєте подарунок: *${assignment.receiver.displayName}*`;

  if (assignment.wishlist.length > 0) {
    message += "\n\n*Список бажань:*\n";
    message += assignment.wishlist
      .map((item, i) => {
        let line = `${i + 1}. ${item.item}`;
        if (item.url) {
          line += ` [посилання](${item.url})`;
        }
        return line;
      })
      .join("\n");
  } else {
    message += "\n\n_Список бажань порожній._";
  }

  if (group?.budget) {
    message += `\n\n*Бюджет:* ${group.budget}`;
  }

  await ctx.reply(message, {
    parse_mode: "Markdown",
    link_preview_options: { is_disabled: true },
  });
}
