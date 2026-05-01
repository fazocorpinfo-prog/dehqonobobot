import { Telegraf, Markup, session } from 'telegraf';
import type { Context } from 'telegraf';
import { config, isAdmin } from '../config';
import { Users, Khatms, Tasks, DailyReports, Garden } from '../db/models';
import { assignTaskToUser, reduceTaskBySOS } from '../distribution';
import { pageRangeLabel } from '../quran';
import { todayLocalDate, formatPersonName } from '../utils';

interface SessionData {
  step?: 'name' | 'age' | 'capacity' | 'done';
  draft?: { firstName?: string; lastName?: string; age?: number; capacity?: number };
  awaitingPagesReport?: boolean;
}

type BotContext = Context & { session?: SessionData };

const mainKeyboard = (telegramId?: number) => {
  const rows: any[] = [
    [{ text: '📖 Bugungi vazifa' }, { text: '📊 Hisobot berish' }],
    [{ text: '🌳 Mening bog\'im' }, { text: '🏆 Reyting' }],
    [{ text: '📢 E\'lonlar' }, { text: '🕌 Namoz vaqtlari' }],
    [{ text: '🆘 Qiynalyapman' }, { text: '✨ Web App' }],
  ];
  if (telegramId && isAdmin(telegramId)) {
    rows.push([{ text: '🛠 Admin panel' }]);
  }
  return { keyboard: rows, resize_keyboard: true } as const;
};

const webAppButton = () =>
  Markup.inlineKeyboard([
    Markup.button.webApp("🟢 Web App'ni ochish", config.webAppUrl),
  ]);

export function createBot(): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(config.botToken);

  bot.use(session({ defaultSession: () => ({}) }));

  // /start - ro'yxatdan o'tish yoki bosh menyu
  bot.start(async (ctx) => {
    const tgId = ctx.from!.id;
    const existing = Users.byTelegramId(tgId);
    if (existing && existing.daily_capacity > 0 && existing.first_name) {
      await ctx.reply(
        `Assalomu alaykum, ${formatPersonName(existing)}!\n\nDehqonbobo Jome masjidi - Xatmi Qur'on botiga xush kelibsiz.`,
        { reply_markup: mainKeyboard(tgId) }
      );
      await ctx.reply('Web App orqali to\'liq interfeysga kiring:', webAppButton());
      return;
    }

    ctx.session = { step: 'name', draft: {} };
    await ctx.reply(
      '📖 *Xatmi Qur\'on - Dehqonbobo Jome masjidi*\n\nAssalomu alaykum! Ro\'yxatdan o\'tish uchun ism va familiyangizni yozing (masalan: _Ahmad Karimov_):',
      { parse_mode: 'Markdown' }
    );
  });

  // Ro'yxatdan o'tish bosqichlari
  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    const session = ctx.session ?? {};

    // Ro'yxatdan o'tish bosqichlari
    if (session.step && session.step !== 'done') {
      session.draft = session.draft ?? {};

      if (session.step === 'name') {
        const parts = text.trim().split(/\s+/);
        if (parts.length < 1 || !parts[0]) {
          await ctx.reply('Iltimos, ism va familiyangizni yozing.');
          return;
        }
        session.draft.firstName = parts[0];
        session.draft.lastName = parts.slice(1).join(' ') || undefined;
        session.step = 'age';
        await ctx.reply('Yoshingizni yozing (raqam):');
        ctx.session = session;
        return;
      }

      if (session.step === 'age') {
        const age = parseInt(text.trim(), 10);
        if (!Number.isFinite(age) || age < 5 || age > 110) {
          await ctx.reply('Yosh noto\'g\'ri kiritildi. Iltimos, qaytadan yozing:');
          return;
        }
        session.draft!.age = age;
        session.step = 'capacity';
        await ctx.reply('Kuniga taxminan necha bet o\'qiy olasiz? (raqam, masalan: 5)');
        ctx.session = session;
        return;
      }

      if (session.step === 'capacity') {
        const cap = parseInt(text.trim(), 10);
        if (!Number.isFinite(cap) || cap < 1 || cap > 100) {
          await ctx.reply('Kunlik o\'qish miqdori 1 dan 100 betgacha bo\'lishi kerak.');
          return;
        }
        session.draft!.capacity = cap;

        const tgId = ctx.from!.id;
        const draft = session.draft!;
        let user = Users.byTelegramId(tgId);
        if (!user) {
          user = Users.create({
            telegram_id: tgId,
            first_name: draft.firstName!,
            last_name: draft.lastName,
            age: draft.age,
            daily_capacity: draft.capacity!,
          });
        } else {
          Users.update(user.id, {
            first_name: draft.firstName!,
            last_name: draft.lastName ?? null,
            age: draft.age ?? null,
            daily_capacity: draft.capacity!,
          });
          user = Users.byTelegramId(tgId)!;
        }

        // Aktiv xatm bo'lsa avtomatik vazifa beriladi
        const khatm = Khatms.active();
        let taskMsg = '';
        if (khatm) {
          const existingTask = Tasks.byUserAndKhatm(user.id, khatm.id);
          const task = existingTask ?? assignTaskToUser(user);
          if (task) {
            taskMsg = `\n\n📚 *Vazifangiz:* ${pageRangeLabel(task.start_page, task.end_page)}\nJami: ${task.end_page - task.start_page + 1} bet`;
          } else {
            taskMsg = '\n\n_Hozircha xatm uchun bo\'sh bet qolmadi. Admin sizni navbatga qo\'yadi._';
          }
        } else {
          taskMsg = '\n\n_Hozircha aktiv xatm yo\'q. Yangi xatm boshlanganda sizga vazifa beriladi._';
        }

        session.step = 'done';
        ctx.session = session;
        await ctx.reply(
          `✅ Ro'yxatdan o'tdingiz, ${draft.firstName}!${taskMsg}`,
          { parse_mode: 'Markdown', reply_markup: mainKeyboard(tgId) }
        );
        await ctx.reply('Web App orqali to\'liq interfeysga kiring:', webAppButton());
        return;
      }
    }

    // Tugma bosishlar
    if (text === '📖 Bugungi vazifa') return showTask(ctx);
    if (text === '📊 Hisobot berish') return promptReport(ctx);
    if (text === '🌳 Mening bog\'im') return showGarden(ctx);
    if (text === '🏆 Reyting') return showLeaderboard(ctx);
    if (text === '📢 E\'lonlar') return showAnnouncements(ctx);
    if (text === '🕌 Namoz vaqtlari') return showPrayerTimes(ctx);
    if (text === '🆘 Qiynalyapman') return startSos(ctx);
    if (text === '✨ Web App') return ctx.reply('Web App\'ni oching:', webAppButton());
    if (text === '🛠 Admin panel') return showAdminPanel(ctx);

    // Hisobot raqami kutilayotgan bo'lsa
    if (session.awaitingPagesReport) {
      const pages = parseInt(text.trim(), 10);
      if (!Number.isFinite(pages) || pages < 0 || pages > 200) {
        await ctx.reply('Iltimos, 0 dan 200 gacha bo\'lgan raqam yozing.');
        return;
      }
      const user = Users.byTelegramId(ctx.from!.id);
      if (!user) return ctx.reply('Avval /start bosing.');
      const task = Tasks.activeForUser(user.id);
      if (!task) return ctx.reply('Sizda aktiv vazifa yo\'q.');

      const today = todayLocalDate();
      DailyReports.upsert({
        task_id: task.id,
        user_id: user.id,
        report_date: today,
        pages_read: pages,
      });
      const totalDone = task.pages_done + pages;
      Tasks.updatePagesDone(task.id, Math.min(totalDone, task.end_page - task.start_page + 1));

      // Bog' suvlanadi
      Garden.water(user.id, {
        fruitGained: pages > 0 ? 1 : 0,
        healthGained: pages > 0 ? 20 : 0,
        treeBonus: pages >= user.daily_capacity ? 1 : 0,
      });

      session.awaitingPagesReport = false;
      ctx.session = session;

      await ctx.reply(
        `✅ Bugun ${pages} bet o'qiganingiz qayd etildi.\n🌳 Bog'ingizdagi daraxtlar suv oldi!\nUmumiy progres: ${Math.min(totalDone, task.end_page - task.start_page + 1)} / ${task.end_page - task.start_page + 1} bet`
      );
      return;
    }

    return next();
  });

  // /admin
  bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx.from!.id)) return ctx.reply('Bu buyruq faqat admin uchun.');
    await showAdminPanel(ctx);
  });

  bot.catch((err) => {
    console.error('[bot] xato:', err);
  });

  return bot;
}

async function showTask(ctx: BotContext) {
  const user = Users.byTelegramId(ctx.from!.id);
  if (!user) return ctx.reply('Avval /start bosing.');
  const task = Tasks.activeForUser(user.id);
  if (!task) return ctx.reply('Sizda aktiv vazifa yo\'q.');
  const total = task.end_page - task.start_page + 1;
  const remaining = total - task.pages_done;
  await ctx.reply(
    `📚 *Vazifangiz*\n${pageRangeLabel(task.start_page, task.end_page)}\n\nJami: ${total} bet\nO'qigan: ${task.pages_done} bet\nQolgan: ${remaining} bet`,
    { parse_mode: 'Markdown' }
  );
}

async function promptReport(ctx: BotContext) {
  const user = Users.byTelegramId(ctx.from!.id);
  if (!user) return ctx.reply('Avval /start bosing.');
  const task = Tasks.activeForUser(user.id);
  if (!task) return ctx.reply('Sizda aktiv vazifa yo\'q.');
  ctx.session = { ...(ctx.session ?? {}), awaitingPagesReport: true };
  await ctx.reply('Bugun necha bet o\'qidingiz? Raqamni yozing:');
}

async function showGarden(ctx: BotContext) {
  const user = Users.byTelegramId(ctx.from!.id);
  if (!user) return ctx.reply('Avval /start bosing.');
  const g = Garden.forUser(user.id);
  const heart = g.health >= 70 ? '💚' : g.health >= 30 ? '💛' : '🤎';
  const tree = g.withered ? '🥀' : g.health >= 70 ? '🌳' : g.health >= 30 ? '🌿' : '🍂';
  await ctx.reply(
    `🌳 *Mening bog'im*\n\n${tree.repeat(Math.min(5, Math.max(1, g.trees)))}\n\nDaraxtlar: ${g.trees}\nMevalar: ${g.fruits} 🍎\nSog'lik: ${heart} ${g.health}%${g.withered ? '\n⚠️ Bog\'ingiz qurib qoldi - hisobot bering!' : ''}`,
    { parse_mode: 'Markdown' }
  );
}

async function showLeaderboard(ctx: BotContext) {
  const db = (await import('../db')).getDb();
  const top = db
    .prepare(
      `SELECT u.first_name, u.last_name, u.age, COALESCE(SUM(dr.pages_read), 0) AS total
       FROM users u
       LEFT JOIN daily_reports dr ON dr.user_id = u.id
       WHERE u.role = 'user' AND u.status = 'active'
       GROUP BY u.id
       ORDER BY total DESC LIMIT 10`
    )
    .all() as Array<{ first_name: string; last_name: string | null; age: number | null; total: number }>;
  if (top.length === 0) return ctx.reply('Hozircha ma\'lumot yo\'q.');
  const lines = top.map(
    (r, i) =>
      `${i + 1}. ${r.first_name}${r.last_name ? ' ' + r.last_name : ''} — ${r.total} bet`
  );
  await ctx.reply(`🏆 *Top o'quvchilar*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' });
}

async function showAnnouncements(ctx: BotContext) {
  const db = (await import('../db')).getDb();
  const items = db
    .prepare(
      `SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5`
    )
    .all() as Array<{ title: string; body: string; card_number: string | null; card_holder: string | null }>;
  if (items.length === 0) return ctx.reply('Hozircha e\'lonlar yo\'q.');
  for (const a of items) {
    let body = `📢 *${a.title}*\n\n${a.body}`;
    if (a.card_number) {
      body += `\n\n💳 Karta: \`${a.card_number}\`${a.card_holder ? ' (' + a.card_holder + ')' : ''}`;
    }
    await ctx.reply(body, { parse_mode: 'Markdown' });
  }
}

async function showPrayerTimes(ctx: BotContext) {
  const db = (await import('../db')).getDb();
  const today = todayLocalDate();
  const row = db.prepare('SELECT * FROM prayer_times WHERE date = ?').get(today) as
    | { bomdod: string; quyosh: string; peshin: string; asr: string; shom: string; xufton: string }
    | undefined;
  if (!row) return ctx.reply('Bugungi namoz vaqtlari kiritilmagan.');
  await ctx.reply(
    `🕌 *Namoz vaqtlari (${today})*\n\nBomdod: ${row.bomdod}\nQuyosh: ${row.quyosh}\nPeshin: ${row.peshin}\nAsr: ${row.asr}\nShom: ${row.shom}\nXufton: ${row.xufton}`,
    { parse_mode: 'Markdown' }
  );
}

async function startSos(ctx: BotContext) {
  const user = Users.byTelegramId(ctx.from!.id);
  if (!user) return ctx.reply('Avval /start bosing.');
  const task = Tasks.activeForUser(user.id);
  if (!task) return ctx.reply('Sizda aktiv vazifa yo\'q.');

  await ctx.reply(
    'Necha bet kamaytirishni xohlaysiz?',
    Markup.inlineKeyboard([
      [Markup.button.callback('5 bet', 'sos:5'), Markup.button.callback('10 bet', 'sos:10')],
      [Markup.button.callback('15 bet', 'sos:15'), Markup.button.callback('20 bet', 'sos:20')],
    ])
  );
}

async function showAdminPanel(ctx: BotContext) {
  if (!isAdmin(ctx.from!.id)) return;
  const db = (await import('../db')).getDb();
  const stats = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'user') AS users,
        (SELECT COUNT(*) FROM khatms WHERE status = 'active') AS khatms,
        (SELECT COALESCE(SUM(pages_done), 0) FROM tasks WHERE status = 'active') AS pages
      `
    )
    .get() as { users: number; khatms: number; pages: number };
  await ctx.reply(
    `🛠 *Admin panel*\n\nFoydalanuvchilar: ${stats.users}\nAktiv xatmlar: ${stats.khatms}\nO'qilgan betlar (jami): ${stats.pages}\n\nTo'liq boshqaruv Web App orqali:`,
    { parse_mode: 'Markdown', reply_markup: webAppButton().reply_markup }
  );
}

// SOS callback handlerlari
export function registerSosHandlers(bot: Telegraf<BotContext>) {
  bot.action(/sos:(\d+)/, async (ctx) => {
    const pages = parseInt(ctx.match[1], 10);
    const user = Users.byTelegramId(ctx.from!.id);
    if (!user) return ctx.answerCbQuery('Avval /start bosing.');
    const task = Tasks.activeForUser(user.id);
    if (!task) return ctx.answerCbQuery('Aktiv vazifa yo\'q.');
    const result = reduceTaskBySOS(task.id, pages);
    if (!result) {
      await ctx.answerCbQuery('Kamaytirib bo\'lmadi.');
      return;
    }
    await ctx.editMessageText(
      `✅ Vazifangiz ${result.reducedPages} betga kamaytirildi.\nYangi oraliq: ${result.newStart}–${result.newEnd}-betlar.\n\n_Kamaytirilgan betlar zaxiraga tushdi - boshqa o'quvchilar olishi mumkin._`,
      { parse_mode: 'Markdown' }
    );
  });
}
