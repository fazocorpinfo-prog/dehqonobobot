import { config } from './config';
import { initDatabase } from './db';
import { createBot } from './bot';
import { createApi } from './api';
import { startScheduler } from './scheduler';

async function main() {
  initDatabase();

  const bot = createBot();
  const app = createApi(bot);

  app.listen(config.port, () => {
    console.log(`[api] http://localhost:${config.port} da ishlayapti`);
  });

  bot
    .launch()
    .then(() => console.log('[bot] Telegram bot ishga tushdi'))
    .catch((e) => {
      console.warn(
        `[bot] launch fail (BOT_TOKEN dummy bo'lishi mumkin): ${e?.message ?? e}. API ishlashda davom etadi.`
      );
    });

  startScheduler(bot);
  console.log('[scheduler] Scheduler ishga tushdi');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
