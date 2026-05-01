import { createBot as createBotInternal, registerSosHandlers } from './bot/index';

export function createBot() {
  const bot = createBotInternal();
  registerSosHandlers(bot);
  return bot;
}

export type Bot = ReturnType<typeof createBot>;
