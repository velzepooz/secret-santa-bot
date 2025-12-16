import { InlineKeyboard } from "grammy";
import type { BotContext } from "../context.ts";

export async function startCommand(ctx: BotContext): Promise<void> {
  const keyboard = new InlineKeyboard()
    .text("Створити групу", "create_group")
    .text("Приєднатися", "join_group")
    .row()
    .text("Мої групи", "my_groups");

  await ctx.reply(
    `Вітаю у боті Таємний Санта! 🎅

Я допоможу організувати обмін подарунками серед друзів.

*Що бажаєте зробити?*`,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
}
