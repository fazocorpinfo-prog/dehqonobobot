import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { config, isAdmin } from './config';
import { Users, type User } from './db/models';

/**
 * Telegram Web App initData ni botToken yordamida tekshiradi.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(initData: string): { user?: any; valid: boolean } {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { valid: false };
    params.delete('hash');

    const dataCheck = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.botToken)
      .digest();
    const computed = crypto.createHmac('sha256', secretKey).update(dataCheck).digest('hex');
    if (computed !== hash) return { valid: false };

    const userParam = params.get('user');
    const user = userParam ? JSON.parse(userParam) : undefined;
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}

export interface AuthedRequest extends Request {
  authUser?: User;
  isAdmin?: boolean;
  telegramUserId?: number;
}

export function telegramAuth(opts: { adminOnly?: boolean } = {}) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const initData = (req.headers['x-telegram-init-data'] as string) || (req.query.initData as string);
    // Dev bypass: agar X-Telegram-Id header'i mavjud bo'lsa va NODE_ENV development bo'lsa
    if (process.env.NODE_ENV !== 'production' && req.headers['x-telegram-id']) {
      const tgId = Number(req.headers['x-telegram-id']);
      req.telegramUserId = tgId;
      const u = Users.byTelegramId(tgId);
      if (u) {
        req.authUser = u;
        req.isAdmin = u.role === 'admin' || isAdmin(u.telegram_id);
      }
      if (opts.adminOnly && !req.isAdmin) return res.status(403).json({ error: 'admin_only' });
      return next();
    }

    if (!initData) return res.status(401).json({ error: 'no_init_data' });
    const result = verifyTelegramInitData(initData);
    if (!result.valid || !result.user) return res.status(401).json({ error: 'invalid_init_data' });

    const tgId = Number(result.user.id);
    req.telegramUserId = tgId;
    const u = Users.byTelegramId(tgId);
    if (u) {
      req.authUser = u;
      req.isAdmin = u.role === 'admin' || isAdmin(u.telegram_id);
    }
    if (opts.adminOnly && !req.isAdmin) return res.status(403).json({ error: 'admin_only' });
    next();
  };
}
