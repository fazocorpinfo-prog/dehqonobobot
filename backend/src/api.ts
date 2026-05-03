import express from 'express';
import cors from 'cors';
import type { Telegraf } from 'telegraf';
import { telegramAuth, type AuthedRequest } from './auth';
import { getDb } from './db';
import {
  Users,
  Khatms,
  Tasks,
  DailyReports,
  Garden,
  Reserve,
  Settings,
} from './db/models';
import { assignTaskToUser, reduceTaskBySOS, reassignTask } from './distribution';
import { pageRangeLabel } from './quran';
import { todayLocalDate } from './utils';
import {
  Certificates,
  awardCertificatesForKhatm,
  renderCertificatePdf,
  topReadersForKhatm,
} from './certificates';

export function createApi(_bot: Telegraf<any>) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  // ============== USER ==============

  // Hozirgi foydalanuvchi (Telegram initData orqali). Yo'q bo'lsa register'ga yo'naltiriladi.
  app.get('/api/me', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.json({ user: null });
    res.json({ user: req.authUser, isAdmin: req.isAdmin });
  });

  // Ro'yxatdan o'tish (Web App ichidan)
  app.post('/api/register', telegramAuth(), (req: AuthedRequest, res) => {
    const { firstName, lastName, age, dailyCapacity, phone } = req.body ?? {};
    if (!firstName || !dailyCapacity) {
      return res.status(400).json({ error: 'invalid_payload' });
    }
    let user = req.authUser;
    if (!user) {
      const tgId = req.telegramUserId ?? Number(req.headers['x-telegram-id'] ?? 0);
      if (!tgId) return res.status(401).json({ error: 'no_telegram_id' });
      user = Users.create({
        telegram_id: tgId,
        first_name: firstName,
        last_name: lastName,
        age,
        daily_capacity: dailyCapacity,
        phone,
      });
    } else {
      Users.update(user.id, {
        first_name: firstName,
        last_name: lastName ?? null,
        age: age ?? null,
        daily_capacity: dailyCapacity,
        phone: phone ?? null,
      });
      user = Users.byTelegramId(user.telegram_id);
    }

    // Aktiv xatm bo'lsa avtomatik vazifa
    const khatm = Khatms.active();
    if (khatm && user) {
      const existing = Tasks.byUserAndKhatm(user.id, khatm.id);
      if (!existing) assignTaskToUser(user);
    }
    res.json({ user });
  });

  // Bugungi vazifa
  app.get('/api/tasks/active', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'unauth' });
    const task = Tasks.activeForUser(req.authUser.id);
    if (!task) return res.json({ task: null });
    const label = pageRangeLabel(task.start_page, task.end_page);
    res.json({ task: { ...task, label } });
  });

  // Hisobot berish
  app.post('/api/reports', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'unauth' });
    const { pages, note } = req.body ?? {};
    const p = Number(pages);
    if (!Number.isFinite(p) || p < 0 || p > 200) {
      return res.status(400).json({ error: 'invalid_pages' });
    }
    const task = Tasks.activeForUser(req.authUser.id);
    if (!task) return res.status(400).json({ error: 'no_task' });
    const today = todayLocalDate();
    DailyReports.upsert({
      task_id: task.id,
      user_id: req.authUser.id,
      report_date: today,
      pages_read: p,
      note,
    });
    const newDone = Math.min(task.pages_done + p, task.end_page - task.start_page + 1);
    Tasks.updatePagesDone(task.id, newDone);
    Garden.water(req.authUser.id, {
      fruitGained: p > 0 ? 1 : 0,
      healthGained: p > 0 ? 20 : 0,
      treeBonus: p >= req.authUser.daily_capacity ? 1 : 0,
    });
    res.json({ ok: true, total: newDone });
  });

  // Hisobotlar tarixi
  app.get('/api/reports', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'unauth' });
    res.json({ reports: DailyReports.forUser(req.authUser.id) });
  });

  // SOS
  app.post('/api/sos', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'unauth' });
    const { pages } = req.body ?? {};
    const p = Number(pages);
    if (!Number.isFinite(p) || p < 1 || p > 50) return res.status(400).json({ error: 'invalid' });
    const task = Tasks.activeForUser(req.authUser.id);
    if (!task) return res.status(400).json({ error: 'no_task' });
    const result = reduceTaskBySOS(task.id, p);
    res.json({ ok: !!result, ...result });
  });

  // Bog'
  app.get('/api/garden', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'unauth' });
    res.json({ garden: Garden.forUser(req.authUser.id) });
  });

  // Leaderboard
  app.get('/api/leaderboard', telegramAuth(), (req, res) => {
    const period = (req.query.period as string) ?? 'all'; // all | week | month
    const ageGroup = req.query.age as string | undefined; // 'kids' | 'adults' | undefined
    let dateClause = '';
    if (period === 'week') dateClause = `AND dr.report_date >= date('now','-7 days')`;
    if (period === 'month') dateClause = `AND dr.report_date >= date('now','-30 days')`;
    let ageClause = '';
    if (ageGroup === 'kids') ageClause = `AND u.age < 16`;
    if (ageGroup === 'adults') ageClause = `AND u.age >= 16`;

    const rows = getDb()
      .prepare(
        `SELECT u.id, u.first_name, u.last_name, u.age,
                COALESCE(SUM(dr.pages_read), 0) AS total
         FROM users u
         LEFT JOIN daily_reports dr ON dr.user_id = u.id ${dateClause}
         WHERE u.role = 'user' AND u.status = 'active' ${ageClause}
         GROUP BY u.id
         ORDER BY total DESC
         LIMIT 50`
      )
      .all() as any[];
    res.json({ leaderboard: rows });
  });

  // E'lonlar
  app.get('/api/announcements', telegramAuth(), (_req, res) => {
    const rows = getDb()
      .prepare(`SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC`)
      .all();
    res.json({ announcements: rows });
  });

  // Challenges
  app.get('/api/challenges', telegramAuth(), (_req, res) => {
    const list = getDb()
      .prepare(`SELECT * FROM challenges WHERE is_active = 1 ORDER BY ends_at ASC`)
      .all() as any[];
    const totals = getDb()
      .prepare(
        `SELECT challenge_id, COALESCE(SUM(count), 0) AS total
         FROM challenge_entries GROUP BY challenge_id`
      )
      .all() as any[];
    const totalMap = new Map(totals.map((t: any) => [t.challenge_id, t.total]));
    const enriched = list.map((c: any) => ({ ...c, total: totalMap.get(c.id) ?? 0 }));
    res.json({ challenges: enriched });
  });

  app.post('/api/challenges/:id/contribute', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'unauth' });
    const id = Number(req.params.id);
    const count = Number(req.body?.count);
    if (!Number.isFinite(count) || count < 1 || count > 100000) {
      return res.status(400).json({ error: 'invalid_count' });
    }
    const db = getDb();
    db.prepare(
      `INSERT INTO challenge_entries (challenge_id, user_id, count, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(challenge_id, user_id) DO UPDATE SET count = count + excluded.count, updated_at = datetime('now')`
    ).run(id, req.authUser.id, count);
    const total = db
      .prepare(`SELECT COALESCE(SUM(count),0) AS s FROM challenge_entries WHERE challenge_id = ?`)
      .get(id) as { s: number };
    res.json({ ok: true, total: total.s });
  });

  // Namoz vaqtlari
  app.get('/api/prayer-times', telegramAuth(), (_req, res) => {
    const rows = getDb()
      .prepare(`SELECT * FROM prayer_times WHERE date >= date('now') ORDER BY date ASC LIMIT 7`)
      .all();
    res.json({ prayerTimes: rows });
  });

  // Maqolalar va duolar
  app.get('/api/articles', telegramAuth(), (req, res) => {
    const cat = req.query.category as string | undefined;
    const rows = cat
      ? getDb()
          .prepare(
            `SELECT * FROM articles WHERE is_published = 1 AND category = ? ORDER BY created_at DESC`
          )
          .all(cat)
      : getDb()
          .prepare(`SELECT * FROM articles WHERE is_published = 1 ORDER BY created_at DESC`)
          .all();
    res.json({ articles: rows });
  });

  // Bugungi oyat
  app.get('/api/verse-of-day', telegramAuth(), (_req, res) => {
    const today = todayLocalDate();
    let v = getDb()
      .prepare(`SELECT * FROM verses WHERE scheduled_for = ? AND is_active = 1 LIMIT 1`)
      .get(today);
    if (!v) {
      v = getDb()
        .prepare(`SELECT * FROM verses WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1`)
        .get();
    }
    res.json({ verse: v ?? null });
  });

  // ============== ADMIN ==============

  app.get('/api/admin/stats', telegramAuth({ adminOnly: true }), (_req, res) => {
    const db = getDb();
    const stats = db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM users WHERE role = 'user') AS users,
          (SELECT COUNT(*) FROM users WHERE role = 'user' AND status = 'active') AS active_users,
          (SELECT COUNT(*) FROM khatms WHERE status = 'active') AS active_khatms,
          (SELECT COUNT(*) FROM khatms WHERE status = 'completed') AS completed_khatms,
          (SELECT COALESCE(SUM(pages_done), 0) FROM tasks) AS pages_total
        `
      )
      .get();
    res.json({ stats });
  });

  // Khatm boshqaruv
  app.get('/api/admin/khatms', telegramAuth({ adminOnly: true }), (_req, res) => {
    res.json({ khatms: Khatms.list() });
  });

  app.post('/api/admin/khatms', telegramAuth({ adminOnly: true }), (req, res) => {
    const { title, startsAt, endsAt, totalPages } = req.body ?? {};
    if (!title || !startsAt || !endsAt) return res.status(400).json({ error: 'invalid' });
    // Aktivlarni completed qilamiz
    getDb().prepare(`UPDATE khatms SET status = 'completed' WHERE status = 'active'`).run();
    const k = Khatms.create({ title, starts_at: startsAt, ends_at: endsAt, total_pages: totalPages });
    res.json({ khatm: k });
  });

  // Foydalanuvchilar ro'yxati va boshqaruv
  app.get('/api/admin/users', telegramAuth({ adminOnly: true }), (_req, res) => {
    const today = todayLocalDate();
    const rows = getDb()
      .prepare(
        `SELECT u.*,
                (SELECT MAX(report_date) FROM daily_reports WHERE user_id = u.id AND pages_read > 0) AS last_report,
                (SELECT id FROM tasks WHERE user_id = u.id AND status='active' LIMIT 1) AS task_id,
                (SELECT pages_done FROM tasks WHERE user_id = u.id AND status='active' LIMIT 1) AS pages_done,
                (SELECT (end_page - start_page + 1) FROM tasks WHERE user_id = u.id AND status='active' LIMIT 1) AS pages_total
         FROM users u WHERE u.role = 'user' ORDER BY u.id DESC`
      )
      .all() as any[];
    // Qiynalayotganlarni belgilaymiz: 2+ kun hisobot bermagan
    const enriched = rows.map((r: any) => {
      const last = r.last_report ? new Date(r.last_report) : null;
      const days = last ? Math.floor((Date.now() - last.getTime()) / 86400000) : 999;
      return { ...r, days_silent: days, needs_call: days >= 2 };
    });
    res.json({ users: enriched, today });
  });

  app.post('/api/admin/users/:id/status', telegramAuth({ adminOnly: true }), (req, res) => {
    const id = Number(req.params.id);
    const { status, frozenUntil } = req.body ?? {};
    if (!['active', 'frozen', 'blocked'].includes(status)) return res.status(400).json({ error: 'invalid' });
    Users.setStatus(id, status, frozenUntil ?? null);
    res.json({ ok: true });
  });

  app.post('/api/admin/tasks/:id/reassign', telegramAuth({ adminOnly: true }), (req, res) => {
    const id = Number(req.params.id);
    const ok = reassignTask(id);
    res.json({ ok: !!ok });
  });

  // Kontent: oyatlar
  app.get('/api/admin/verses', telegramAuth({ adminOnly: true }), (_req, res) => {
    res.json({ verses: getDb().prepare('SELECT * FROM verses ORDER BY id DESC').all() });
  });
  app.post('/api/admin/verses', telegramAuth({ adminOnly: true }), (req, res) => {
    const { surahNumber, surahName, ayahNumber, arabic, uzbek, tafsir, scheduledFor } = req.body ?? {};
    if (!surahNumber || !surahName || !ayahNumber || !uzbek) return res.status(400).json({ error: 'invalid' });
    getDb()
      .prepare(
        `INSERT INTO verses (surah_number, surah_name, ayah_number, arabic, uzbek, tafsir, scheduled_for)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(surahNumber, surahName, ayahNumber, arabic ?? null, uzbek, tafsir ?? null, scheduledFor ?? null);
    res.json({ ok: true });
  });

  // Kontent: maqolalar
  app.post('/api/admin/articles', telegramAuth({ adminOnly: true }), (req, res) => {
    const { title, body, category } = req.body ?? {};
    if (!title || !body) return res.status(400).json({ error: 'invalid' });
    getDb()
      .prepare(`INSERT INTO articles (title, body, category) VALUES (?, ?, ?)`)
      .run(title, body, category ?? 'article');
    res.json({ ok: true });
  });

  // Kontent: e'lonlar
  app.post('/api/admin/announcements', telegramAuth({ adminOnly: true }), (req, res) => {
    const { title, body, category, cardNumber, cardHolder, expiresAt } = req.body ?? {};
    if (!title || !body) return res.status(400).json({ error: 'invalid' });
    getDb()
      .prepare(
        `INSERT INTO announcements (title, body, category, card_number, card_holder, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(title, body, category ?? 'general', cardNumber ?? null, cardHolder ?? null, expiresAt ?? null);
    res.json({ ok: true });
  });

  // Kontent: challenges
  app.post('/api/admin/challenges', telegramAuth({ adminOnly: true }), (req, res) => {
    const { title, description, targetCount, startsAt, endsAt } = req.body ?? {};
    if (!title || !targetCount || !startsAt || !endsAt) return res.status(400).json({ error: 'invalid' });
    getDb()
      .prepare(
        `INSERT INTO challenges (title, description, target_count, starts_at, ends_at) VALUES (?, ?, ?, ?, ?)`
      )
      .run(title, description ?? null, targetCount, startsAt, endsAt);
    res.json({ ok: true });
  });

  // Kontent: namoz vaqtlari (haftalik kiritish)
  app.post('/api/admin/prayer-times', telegramAuth({ adminOnly: true }), (req, res) => {
    const { items } = req.body ?? {};
    if (!Array.isArray(items)) return res.status(400).json({ error: 'invalid' });
    const stmt = getDb().prepare(
      `INSERT INTO prayer_times (date, bomdod, quyosh, peshin, asr, shom, xufton)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         bomdod=excluded.bomdod, quyosh=excluded.quyosh, peshin=excluded.peshin,
         asr=excluded.asr, shom=excluded.shom, xufton=excluded.xufton`
    );
    const trx = getDb().transaction((rows: any[]) => {
      for (const r of rows) stmt.run(r.date, r.bomdod, r.quyosh, r.peshin, r.asr, r.shom, r.xufton);
    });
    trx(items);
    res.json({ ok: true, count: items.length });
  });

  // Sozlamalar
  app.get('/api/admin/settings', telegramAuth({ adminOnly: true }), (_req, res) => {
    const rows = getDb().prepare('SELECT key, value FROM settings').all();
    res.json({ settings: rows });
  });
  app.post('/api/admin/settings', telegramAuth({ adminOnly: true }), (req, res) => {
    const { key, value } = req.body ?? {};
    if (!key) return res.status(400).json({ error: 'invalid' });
    Settings.set(key, value ?? '');
    res.json({ ok: true });
  });

  // Reserve betlar
  app.get('/api/admin/reserve', telegramAuth({ adminOnly: true }), (_req, res) => {
    const k = Khatms.active();
    if (!k) return res.json({ reserve: [] });
    res.json({ reserve: Reserve.available(k.id) });
  });

  // ============== SERTIFIKATLAR ==============

  // Foydalanuvchining sertifikatlari ro'yxati
  app.get('/api/certificates', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'unauth' });
    res.json({ certificates: Certificates.forUser(req.authUser.id) });
  });

  // Sertifikat PDF yuklab olish
  app.get('/api/certificates/:id/pdf', telegramAuth(), (req: AuthedRequest, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'unauth' });
    const id = Number(req.params.id);
    const cert = Certificates.byId(id);
    if (!cert) return res.status(404).json({ error: 'not_found' });
    if (cert.user_id !== req.authUser.id && !req.isAdmin) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const user = Users.byId(cert.user_id);
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    const khatm = cert.khatm_id ? Khatms.byId(cert.khatm_id) : null;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sertifikat-${cert.id}.pdf"`
    );
    const doc = renderCertificatePdf(cert, user, khatm ?? null);
    doc.pipe(res);
    doc.end();
  });

  // Admin: aktiv yoki tugagan xatm uchun top-N foydalanuvchilarga sertifikat berish
  app.post(
    '/api/admin/certificates/award',
    telegramAuth({ adminOnly: true }),
    (req, res) => {
      const { khatmId, topN } = req.body ?? {};
      const id = Number(khatmId);
      if (!id) return res.status(400).json({ error: 'invalid' });
      const created = awardCertificatesForKhatm(id, Number(topN) || 10);
      res.json({ ok: true, awarded: created.length, certificates: created });
    }
  );

  // Admin: top o'quvchilar (sertifikat berishdan oldin ko'rib chiqish uchun)
  app.get(
    '/api/admin/certificates/preview',
    telegramAuth({ adminOnly: true }),
    (req, res) => {
      const khatmId = Number(req.query.khatmId);
      const topN = Number(req.query.topN) || 10;
      if (!khatmId) return res.status(400).json({ error: 'invalid' });
      res.json({ top: topReadersForKhatm(khatmId, topN) });
    }
  );

  // Admin: barcha berilgan sertifikatlar
  app.get(
    '/api/admin/certificates',
    telegramAuth({ adminOnly: true }),
    (req, res) => {
      const khatmId = req.query.khatmId ? Number(req.query.khatmId) : null;
      const rows = khatmId
        ? getDb()
            .prepare(
              `SELECT c.*, u.first_name, u.last_name FROM certificates c
               JOIN users u ON u.id = c.user_id
               WHERE c.khatm_id = ? ORDER BY c.rank ASC`
            )
            .all(khatmId)
        : getDb()
            .prepare(
              `SELECT c.*, u.first_name, u.last_name FROM certificates c
               JOIN users u ON u.id = c.user_id
               ORDER BY c.awarded_at DESC LIMIT 200`
            )
            .all();
      res.json({ certificates: rows });
    }
  );

  return app;
}
