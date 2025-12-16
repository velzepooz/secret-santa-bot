import { InlineKeyboard } from "grammy";
import type { BotContext } from "../context.ts";

export async function drawCommand(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) {
    await ctx.reply("Не вдалося вас ідентифікувати. Спробуйте ще раз.");
    return;
  }

  const memberships = await ctx.services.groupService.getUserGroups(telegramId);
  const organizerGroups = memberships.filter(
    (m) => m.group.organizerTelegramId === telegramId && m.group.status === "open"
  );

  if (organizerGroups.length === 0) {
    await ctx.reply(
      "У вас немає груп, де ви організатор і жеребкування ще не відбулось."
    );
    return;
  }

  // If only one group, show draw confirmation directly
  if (organizerGroups.length === 1) {
    ctx.session.activeGroupId = organizerGroups[0]!.group.id;
    await showDrawConfirmation(ctx, organizerGroups[0]!.group.id);
    return;
  }

  // Multiple groups - let user select
  const keyboard = new InlineKeyboard();
  for (const membership of organizerGroups) {
    keyboard.text(membership.group.name, `draw_group:${membership.group.id}`);
    keyboard.row();
  }

  await ctx.reply("Оберіть групу для жеребкування:", { reply_markup: keyboard });
}

export async function showDrawConfirmation(ctx: BotContext, groupId: string): Promise<void> {
  const group = await ctx.services.groupService.getGroupById(groupId);
  if (!group) {
    await ctx.reply("Групу не знайдено.");
    return;
  }

  const participants = await ctx.services.participantService.getGroupParticipants(groupId);
  const count = participants.length;

  if (count < 2) {
    await ctx.reply(
      `Неможливо провести жеребкування з ${count} учасником.\n\nПотрібно щонайменше 2 людини. Поділіться кодом запрошення: \`${group.inviteCode}\``,
      { parse_mode: "Markdown" }
    );
    return;
  }

  const keyboard = new InlineKeyboard()
    .text("✅ Так, розіграти!", `confirm_draw:${groupId}`)
    .text("❌ Скасувати", `cancel_draw:${groupId}`);

  const participantList = participants.map((p) => `• ${p.displayName}`).join("\n");

  await ctx.reply(
    `*Готові до жеребкування "${group.name}"?*

*Учасники (${count}):*
${participantList}

⚠️ *Цю дію неможливо скасувати!*
Після жеребкування ніхто більше не зможе приєднатися, а списки бажань будуть заблоковані.`,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
}

export async function performDraw(ctx: BotContext, groupId: string): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) {
    await ctx.reply("Не вдалося вас ідентифікувати.");
    return;
  }

  const result = await ctx.services.drawService.performDraw(groupId, telegramId);

  if (!result.success) {
    const messages: Record<string, string> = {
      not_organizer: "Тільки організатор може проводити жеребкування.",
      already_drawn: "У цій групі вже відбулося жеребкування.",
      too_few_participants: "Потрібно щонайменше 2 учасники для жеребкування.",
      group_not_found: "Групу не знайдено.",
    };
    await ctx.reply(messages[result.error!] || "Не вдалося провести жеребкування.");
    return;
  }

  const group = await ctx.services.groupService.getGroupById(groupId);
  await ctx.reply(
    `🎄 *Жеребкування завершено!* 🎄

Кожен учасник групи "${group?.name}" отримав свого Таємного Санту.

Кожен отримає приватне повідомлення зі своїм призначенням.`,
    { parse_mode: "Markdown" }
  );

  // Send assignments to all participants
  const assignments = await ctx.services.drawService.getAllAssignments(groupId);

  for (const assignment of assignments) {
    try {
      let message = `🎅 *Ваше призначення Таємного Санти*\n\nВи даруєте подарунок: *${assignment.receiver.displayName}*`;

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

      message += "\n\n_Тримайте в таємниці! 🤫_";

      await ctx.api.sendMessage(assignment.giver.telegramId, message, {
        parse_mode: "Markdown",
        link_preview_options: { is_disabled: true },
      });
    } catch (error) {
      console.error(`Failed to send assignment to ${assignment.giver.telegramId}:`, error);
    }
  }
}
