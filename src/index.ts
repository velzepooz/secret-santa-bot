import { webhookCallback } from "grammy";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { createBot } from "./bot/bot.ts";
import { processedUpdates } from "./db/schema.ts";
import type { Env } from "./types.ts";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response("Secret Santa Bot is running!", { status: 200 });
    }

    // Webhook endpoint
    if (url.pathname === "/webhook" && request.method === "POST") {
      // Clone the request to read body twice (for dedup check and actual processing)
      const clonedRequest = request.clone();
      const body = await clonedRequest.json() as { update_id?: number };
      const updateId = body.update_id;

      if (updateId) {
        const db = drizzle(env.DB);
        
        // Check if this update was already processed
        const existing = await db
          .select()
          .from(processedUpdates)
          .where(eq(processedUpdates.updateId, updateId))
          .limit(1);

        if (existing.length > 0) {
          // Already processed, return OK to prevent Telegram from retrying
          console.log(`Duplicate update_id ${updateId}, skipping`);
          return new Response("OK", { status: 200 });
        }

        // Mark as processed BEFORE handling (to prevent race conditions)
        await db.insert(processedUpdates).values({ updateId }).onConflictDoNothing();
      }

      const bot = createBot(env);
      const handleUpdate = webhookCallback(bot, "cloudflare-mod");
      return handleUpdate(request);
    }

    // Set webhook endpoint (for initial setup)
    if (url.pathname === "/set-webhook" && request.method === "GET") {
      const webhookUrl = `${url.origin}/webhook`;
      const bot = createBot(env);

      await bot.api.setWebhook(webhookUrl);

      return new Response(`Webhook set to: ${webhookUrl}`, { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },
};
