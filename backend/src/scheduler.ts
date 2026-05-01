import cron from 'node-cron';
import type { Telegraf } from 'telegraf';
import { config } from './config';
import { getDb } from './db';
import { Users, Garden, DailyReports } from './db/models';
import { todayLocalDate, formatPersonName } from './utils';
import { awardCertificatesForKhatm } from './certificates';

/**
 * Har kuni kerakli holatlarda eslatma yuboradi.
 */
export function startScheduler(bot: Telegraf<any>) {
  // Har kuni soat 09:00 — kunlik eslatma + oyat
  cron.schedule('0 9 * * *', async () => {
    await sendDailyReminders(bot);
  });

  // Har kuni soat 21:00 — hisobot bermaganlarga eslatma
  cron.schedule('0 21 * * *', async () => {
    await sendEveningReminders(bot);
  });

  // Har daqiqada namoz vaqtini tekshiramiz (HH:MM aniqligida match)
  cron.schedule('* * * * *', async () => {
    await checkPrayerTimes(bot);
  });

  // Har kuni yarim tunda — bog'lar suvsizlanishi va admin signalini yuborish
  cron.schedule('5 0 * * *', async () => {
    await dailyMaintenance(bot);
  });

  // Har soatda — tugagan xatmlarni completed deb belgilash va top-10 ga sertifikat berish
  cron.schedule('15 * * * *', async () => {
    await checkExpiredKhatms(bot);
  });
}

async function checkExpiredKhatms(bot: Telegraf<any>) {
  const db = getDb();
  const expired = db
    .prepare(
      `SELECT * FROM khatms WHERE status = 'active' AND ends_at <= datetime('now')`
    )
    .all() as Array<{ id: number; title: string }>;
  for (const k of expired) {
    db.prepare(`UPDATE khatms SET status = 'completed' WHERE id = ?`).run(k.id);
    const awarded = awardCertificatesForKhatm(k.id, 10);
    console.log(
      `[scheduler] Xatm tugadi: ${k.title} (id=${k.id}), ${awarded.length} ta sertifikat berildi`
    );
    // Sertifikat olganlarga xabar yuboramiz
    for (const cert of awarded) {
      const u = Users.byId(cert.user_id);
      if (!u) continue;
      try {
        await bot.telegram.sendMessage(
          u.telegram_id,
          `🎉 Tabriklaymiz! Siz "${k.title}" xatmi yakunida ${cert.rank}-o'rinni egalladingiz.\n\n📜 Sertifikatingizni Web App > Profil bo'limidan yuklab olishingiz mumkin.`
        );
      } catch {
        /* skip */
      }
    }
    // Adminga yakuniy hisobot
    for (const adminTgId of config.adminIds) {
      try {
        await bot.telegram.sendMessage(
          adminTgId,
          `✅ Xatm yakunlandi: *${k.title}*\nTop-${awarded.length} foydalanuvchiga sertifikat berildi.`,
          { parse_mode: 'Markdown' }
        );
      } catch {
        /* skip */
      }
    }
  }
}

async function sendDailyReminders(bot: Telegraf<any>) {
  const db = getDb();
  const verse = pickTodayVerse();
  const users = db
    .prepare(
      `SELECT u.* FROM users u
       JOIN tasks t ON t.user_id = u.id AND t.status = 'active'
       JOIN khatms k ON k.id = t.khatm_id AND k.status = 'active'
       WHERE u.status = 'active'
       GROUP BY u.id`
    )
    .all() as Array<{ telegram_id: number; first_name: string; last_name: string | null }>;

  for (const u of users) {
    const greeting = `Assalomu alaykum, ${formatPersonName(u)}! 🌙\n\nBugungi vazifangizni unutmang.`;
    let msg = greeting;
    if (verse) {
      msg += `\n\n📖 *Bugungi oyat*\n_${verse.surah_name} ${verse.surah_number}:${verse.ayah_number}_\n\n${verse.uzbek}`;
      if (verse.tafsir) msg += `\n\n_${verse.tafsir}_`;
    }
    try {
      await bot.telegram.sendMessage(u.telegram_id, msg, { parse_mode: 'Markdown' });
    } catch (e: any) {
      console.warn(`[scheduler] yuborib bo'lmadi ${u.telegram_id}:`, e?.message);
    }
  }
}

async function sendEveningReminders(bot: Telegraf<any>) {
  const db = getDb();
  const today = todayLocalDate();
  const rows = db
    .prepare(
      `SELECT u.telegram_id, u.first_name FROM users u
       JOIN tasks t ON t.user_id = u.id AND t.status = 'active'
       LEFT JOIN daily_reports dr ON dr.task_id = t.id AND dr.report_date = ?
       WHERE u.status = 'active' AND dr.id IS NULL`
    )
    .all(today) as Array<{ telegram_id: number; first_name: string }>;

  for (const r of rows) {
    try {
      await bot.telegram.sendMessage(
        r.telegram_id,
        `${r.first_name}, bugun nechta bet o'qiganingizni hali bildirmadingiz. \n📊 *Hisobot berish* tugmasini bosing.`,
        { parse_mode: 'Markdown' }
      );
    } catch {
      /* skip */
    }
  }
}

async function checkPrayerTimes(bot: Telegraf<any>) {
  const db = getDb();
  const today = todayLocalDate();
  const row = db.prepare('SELECT * FROM prayer_times WHERE date = ?').get(today) as
    | { bomdod: string; quyosh: string; peshin: string; asr: string; shom: string; xufton: string }
    | undefined;
  if (!row) return;

  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const labels: Array<[keyof typeof row, string]> = [
    ['bomdod', 'Bomdod'],
    ['peshin', 'Peshin'],
    ['asr', 'Asr'],
    ['shom', 'Shom'],
    ['xufton', 'Xufton'],
  ];
  const matched = labels.find(([k]) => row[k] === hhmm);
  if (!matched) return;

  const users = db
    .prepare(`SELECT telegram_id FROM users WHERE status = 'active'`)
    .all() as Array<{ telegram_id: number }>;
  for (const u of users) {
    try {
      await bot.telegram.sendMessage(u.telegram_id, `🕌 ${matched[1]} namozi vaqti kirdi (${row[matched[0]]})`);
    } catch {
      /* skip */
    }
  }
}

async function dailyMaintenance(bot: Telegraf<any>) {
  const db = getDb();
  // Har bir foydalanuvchi uchun oxirgi hisobot kuni
  const users = db
    .prepare(
      `SELECT u.id, u.telegram_id, u.first_name, u.last_name, u.phone,
              MAX(dr.report_date) AS last_report
       FROM users u
       LEFT JOIN daily_reports dr ON dr.user_id = u.id AND dr.pages_read > 0
       WHERE u.role = 'user' AND u.status = 'active'
       GROUP BY u.id`
    )
    .all() as Array<{
      id: number;
      telegram_id: number;
      first_name: string;
      last_name: string | null;
      phone: string | null;
      last_report: string | null;
    }>;

  const today = new Date();
  for (const u of users) {
    const last = u.last_report ? new Date(u.last_report) : null;
    const daysSince = last ? Math.floor((today.getTime() - last.getTime()) / 86400000) : 99;

    if (daysSince >= 2) {
      Garden.decay(u.id, 25);
    }
    if (daysSince >= 3) {
      // Adminlarga signal
      for (const adminTgId of config.adminIds) {
        try {
          await bot.telegram.sendMessage(
            adminTgId,
            `⚠️ Foydalanuvchi ${u.first_name}${u.last_name ? ' ' + u.last_name : ''} ${daysSince} kundan beri hisobot bermayapti.${u.phone ? '\nTel: ' + u.phone : ''}`
          );
        } catch {
          /* skip */
        }
      }
    }
  }
}

function pickTodayVerse() {
  const db = getDb();
  const today = todayLocalDate();
  const scheduled = db
    .prepare(`SELECT * FROM verses WHERE scheduled_for = ? AND is_active = 1 LIMIT 1`)
    .get(today) as
    | {
        surah_number: number;
        surah_name: string;
        ayah_number: number;
        uzbek: string;
        tafsir: string | null;
      }
    | undefined;
  if (scheduled) return scheduled;
  // Aks holda - random
  return db
    .prepare(`SELECT * FROM verses WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1`)
    .get() as
    | {
        surah_number: number;
        surah_name: string;
        ayah_number: number;
        uzbek: string;
        tafsir: string | null;
      }
    | undefined;
}
