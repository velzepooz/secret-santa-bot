import type { BotContext } from "../context.ts";

export async function createCommand(ctx: BotContext): Promise<void> {
  ctx.session.awaitingInput = "group_name";

  await ctx.reply(
    "Створюємо нову групу Таємного Санти! 🎄\n\nЯк назвемо групу?"
  );
}

export async function handleGroupNameInput(ctx: BotContext): Promise<void> {
  const groupName = ctx.message?.text?.trim();
  if (!groupName) {
    await ctx.reply("Будь ласка, введіть назву групи.");
    return;
  }

  if (groupName.length > 100) {
    await ctx.reply("Назва занадто довга. Використовуйте до 100 символів.");
    return;
  }

  const telegramId = ctx.from?.id?.toString();
  const username = ctx.from?.username;
  const displayName = ctx.from?.first_name || username || "Анонім";

  if (!telegramId) {
    await ctx.reply("Не вдалося вас ідентифікувати. Спробуйте ще раз.");
    ctx.session.awaitingInput = undefined;
    return;
  }

  try {
    const { group } = await ctx.services.groupService.createGroup({
      name: groupName,
      organizerTelegramId: telegramId,
      organizerDisplayName: displayName,
      organizerUsername: username,
    });

    ctx.session.awaitingInput = undefined;
    ctx.session.activeGroupId = group.id;

    await ctx.reply(
      `Групу "${group.name}" створено! 🎉

*Код запрошення:* \`${group.inviteCode}\`

Поділіться цим кодом з друзями, щоб вони приєдналися:
/join ${group.inviteCode}

Ви — організатор. Коли всі приєднаються, використайте /draw для жеребкування.`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    await ctx.reply("Не вдалося створити групу. Спробуйте ще раз.");
    ctx.session.awaitingInput = undefined;
  }
}
