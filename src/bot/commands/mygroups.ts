import { InlineKeyboard } from "grammy";
import type { BotContext } from "../context.ts";

export async function myGroupsCommand(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) {
    await ctx.reply("Не вдалося вас ідентифікувати. Спробуйте ще раз.");
    return;
  }

  const memberships = await ctx.services.groupService.getUserGroups(telegramId);

  if (memberships.length === 0) {
    const keyboard = new InlineKeyboard()
      .text("Створити групу", "create_group")
      .text("Приєднатися", "join_group");

    await ctx.reply(
      "Ви ще не в жодній групі Таємного Санти.\n\nСтворіть нову групу або приєднайтеся до існуючої!",
      { reply_markup: keyboard }
    );
    return;
  }

  const keyboard = new InlineKeyboard();

  for (const membership of memberships) {
    const statusEmoji = membership.group.status === "drawn" ? "🎁" : "⏳";
    keyboard.text(
      `${statusEmoji} ${membership.group.name}`,
      `select_group:${membership.group.id}`
    );
    keyboard.row();
  }

  await ctx.reply(
    `*Ваші групи Таємного Санти*\n\n${memberships
      .map((m) => {
        const status = m.group.status === "drawn" ? "Розіграно" : "Відкрита";
        return `• ${m.group.name} (${status})`;
      })
      .join("\n")}`,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
}
