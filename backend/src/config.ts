import 'dotenv/config';
import path from 'path';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Muhit o'zgaruvchisi yo'q: ${name}`);
  }
  return value;
}

const adminIds = (process.env.ADMIN_IDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => Number(s))
  .filter((n) => Number.isFinite(n));

export const config = {
  botToken: required('BOT_TOKEN'),
  webAppUrl: process.env.WEBAPP_URL ?? 'http://localhost:5173',
  adminIds,
  port: Number(process.env.PORT ?? 3001),
  dbPath: path.resolve(process.env.DB_PATH ?? './data/khatm.db'),
};

export function isAdmin(telegramId: number): boolean {
  return config.adminIds.includes(telegramId);
}
