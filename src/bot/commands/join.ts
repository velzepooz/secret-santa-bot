import type { BotContext } from "../context.ts";

export async function joinCommand(ctx: BotContext): Promise<void> {
  const args = ctx.message?.text?.split(" ").slice(1).join(" ").trim();

  if (args) {
    // Code provided directly
    await processJoinCode(ctx, args);
  } else {
    // Ask for code
    ctx.session.awaitingInput = "join_code";
    await ctx.reply("Введіть код запрошення (наприклад, SANTA-ABC123):");
  }
}

export async function handleJoinCodeInput(ctx: BotContext): Promise<void> {
  const code = ctx.message?.text?.trim();
  if (!code) {
    await ctx.reply("Будь ласка, введіть дійсний код запрошення.");
    return;
  }

  await processJoinCode(ctx, code);
}

async function processJoinCode(ctx: BotContext, code: string): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) {
    await ctx.reply("Не вдалося вас ідентифікувати. Спробуйте ще раз.");
    ctx.session.awaitingInput = undefined;
    return;
  }

  // Check if group exists first
  const group = await ctx.services.groupService.getGroupByInviteCode(code);
  if (!group) {
    await ctx.reply("Невірний код запрошення. Перевірте та спробуйте ще раз.");
    ctx.session.awaitingInput = undefined;
    return;
  }

  if (group.status !== "open") {
    await ctx.reply("У цій групі вже відбулося жеребкування. Приєднатися неможливо.");
    ctx.session.awaitingInput = undefined;
    return;
  }

  // Check if already a member
  const existingParticipant = await ctx.services.participantService.getParticipantByGroupAndTelegram(
    group.id,
    telegramId
  );

  if (existingParticipant) {
    await ctx.reply(`Ви вже учасник групи "${group.name}".`);
    ctx.session.awaitingInput = undefined;
    return;
  }

  // Store pending join info and ask for display name
  ctx.session.awaitingInput = "display_name";
  ctx.session.activeGroupId = group.id;

  await ctx.reply(
    `Ви приєднуєтесь до групи "${group.name}"! 🎄\n\nЯк вас називати в цій групі?`
  );
}

export async function handleDisplayNameInput(ctx: BotContext): Promise<void> {
  const displayName = ctx.message?.text?.trim();
  if (!displayName) {
    await ctx.reply("Будь ласка, введіть ім'я.");
    return;
  }

  if (displayName.length > 50) {
    await ctx.reply("Ім'я занадто довге. Використовуйте до 50 символів.");
    return;
  }

  const telegramId = ctx.from?.id?.toString();
  const username = ctx.from?.username;
  const groupId = ctx.session.activeGroupId;

  if (!telegramId || !groupId) {
    await ctx.reply("Щось пішло не так. Спробуйте /join ще раз.");
    ctx.session.awaitingInput = undefined;
    ctx.session.activeGroupId = undefined;
    return;
  }

  const group = await ctx.services.groupService.getGroupById(groupId);
  if (!group) {
    await ctx.reply("Групу не знайдено. Спробуйте /join ще раз.");
    ctx.session.awaitingInput = undefined;
    ctx.session.activeGroupId = undefined;
    return;
  }

  const result = await ctx.services.groupService.joinGroup(
    group.inviteCode,
    telegramId,
    displayName,
    username
  );

  ctx.session.awaitingInput = undefined;

  if (!result.success) {
    const messages: Record<string, string> = {
      invalid_code: "Невірний код запрошення.",
      already_member: "Ви вже учасник цієї групи.",
      group_closed: "У цій групі вже відбулося жеребкування.",
    };
    await ctx.reply(messages[result.error!] || "Не вдалося приєднатися до групи.");
    return;
  }

  const participantCount = await ctx.services.participantService.getParticipantCount(groupId);

  await ctx.reply(
    `Ласкаво просимо до "${group.name}", ${displayName}! 🎉

*Учасників:* ${participantCount}
${group.budget ? `*Бюджет:* ${group.budget}` : ""}

Використовуйте /wishlist щоб додати ідеї подарунків.`,
    { parse_mode: "Markdown" }
  );
}
