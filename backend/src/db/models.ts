import { getDb } from './index';

export interface User {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name: string | null;
  age: number | null;
  daily_capacity: number;
  role: 'user' | 'admin';
  status: 'active' | 'frozen' | 'blocked';
  frozen_until: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Khatm {
  id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  total_pages: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export interface Task {
  id: number;
  khatm_id: number;
  user_id: number;
  start_page: number;
  end_page: number;
  pages_done: number;
  status: 'active' | 'completed' | 'reassigned' | 'cancelled';
}

export const Users = {
  byTelegramId(telegramId: number): User | undefined {
    return getDb()
      .prepare('SELECT * FROM users WHERE telegram_id = ?')
      .get(telegramId) as User | undefined;
  },
  byId(id: number): User | undefined {
    return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },
  create(input: {
    telegram_id: number;
    first_name: string;
    last_name?: string;
    age?: number;
    daily_capacity: number;
    phone?: string;
  }): User {
    const info = getDb()
      .prepare(
        `INSERT INTO users (telegram_id, first_name, last_name, age, daily_capacity, phone)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.telegram_id,
        input.first_name,
        input.last_name ?? null,
        input.age ?? null,
        input.daily_capacity,
        input.phone ?? null
      );
    return Users.byId(Number(info.lastInsertRowid))!;
  },
  update(id: number, patch: Partial<Omit<User, 'id' | 'telegram_id' | 'created_at'>>) {
    const keys = Object.keys(patch);
    if (!keys.length) return;
    const set = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (patch as any)[k]);
    getDb()
      .prepare(`UPDATE users SET ${set}, updated_at = datetime('now') WHERE id = ?`)
      .run(...values, id);
  },
  list(): User[] {
    return getDb().prepare('SELECT * FROM users ORDER BY id DESC').all() as User[];
  },
  setStatus(id: number, status: User['status'], frozenUntil?: string | null) {
    getDb()
      .prepare(
        `UPDATE users SET status = ?, frozen_until = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .run(status, frozenUntil ?? null, id);
  },
};

export const Khatms = {
  active(): Khatm | undefined {
    return getDb()
      .prepare(
        `SELECT * FROM khatms WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1`
      )
      .get() as Khatm | undefined;
  },
  byId(id: number): Khatm | undefined {
    return getDb().prepare('SELECT * FROM khatms WHERE id = ?').get(id) as Khatm | undefined;
  },
  list(): Khatm[] {
    return getDb().prepare('SELECT * FROM khatms ORDER BY starts_at DESC').all() as Khatm[];
  },
  create(input: { title: string; starts_at: string; ends_at: string; total_pages?: number }): Khatm {
    const info = getDb()
      .prepare(
        `INSERT INTO khatms (title, starts_at, ends_at, total_pages, status)
         VALUES (?, ?, ?, ?, 'active')`
      )
      .run(input.title, input.starts_at, input.ends_at, input.total_pages ?? 604);
    return Khatms.byId(Number(info.lastInsertRowid))!;
  },
};

export const Tasks = {
  byUserAndKhatm(userId: number, khatmId: number): Task | undefined {
    return getDb()
      .prepare(`SELECT * FROM tasks WHERE user_id = ? AND khatm_id = ? AND status != 'cancelled'`)
      .get(userId, khatmId) as Task | undefined;
  },
  activeForUser(userId: number): Task | undefined {
    return getDb()
      .prepare(
        `SELECT t.* FROM tasks t
         JOIN khatms k ON k.id = t.khatm_id
         WHERE t.user_id = ? AND t.status = 'active' AND k.status = 'active'
         ORDER BY t.created_at DESC LIMIT 1`
      )
      .get(userId) as Task | undefined;
  },
  forKhatm(khatmId: number): Task[] {
    return getDb()
      .prepare(`SELECT * FROM tasks WHERE khatm_id = ? ORDER BY start_page ASC`)
      .all(khatmId) as Task[];
  },
  create(input: {
    khatm_id: number;
    user_id: number;
    start_page: number;
    end_page: number;
  }): Task {
    const info = getDb()
      .prepare(
        `INSERT INTO tasks (khatm_id, user_id, start_page, end_page) VALUES (?, ?, ?, ?)`
      )
      .run(input.khatm_id, input.user_id, input.start_page, input.end_page);
    return getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid) as Task;
  },
  updatePagesDone(id: number, pagesDone: number) {
    getDb()
      .prepare(
        `UPDATE tasks SET pages_done = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .run(pagesDone, id);
  },
  updateRange(id: number, startPage: number, endPage: number) {
    getDb()
      .prepare(
        `UPDATE tasks SET start_page = ?, end_page = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .run(startPage, endPage, id);
  },
  setStatus(id: number, status: Task['status']) {
    getDb()
      .prepare(`UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(status, id);
  },
};

export const DailyReports = {
  forTaskOnDate(taskId: number, date: string) {
    return getDb()
      .prepare('SELECT * FROM daily_reports WHERE task_id = ? AND report_date = ?')
      .get(taskId, date) as { id: number; pages_read: number } | undefined;
  },
  upsert(input: { task_id: number; user_id: number; report_date: string; pages_read: number; note?: string }) {
    const existing = DailyReports.forTaskOnDate(input.task_id, input.report_date);
    if (existing) {
      getDb()
        .prepare(`UPDATE daily_reports SET pages_read = ?, note = ? WHERE id = ?`)
        .run(input.pages_read, input.note ?? null, existing.id);
      return existing.id;
    }
    const info = getDb()
      .prepare(
        `INSERT INTO daily_reports (task_id, user_id, report_date, pages_read, note)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(input.task_id, input.user_id, input.report_date, input.pages_read, input.note ?? null);
    return Number(info.lastInsertRowid);
  },
  forUser(userId: number, limit = 30) {
    return getDb()
      .prepare(
        `SELECT * FROM daily_reports WHERE user_id = ? ORDER BY report_date DESC LIMIT ?`
      )
      .all(userId, limit) as Array<{ report_date: string; pages_read: number; note: string | null }>;
  },
  lastReportDate(userId: number): string | null {
    const row = getDb()
      .prepare(
        `SELECT MAX(report_date) AS d FROM daily_reports WHERE user_id = ? AND pages_read > 0`
      )
      .get(userId) as { d: string | null };
    return row?.d ?? null;
  },
};

export const Reserve = {
  add(input: { khatm_id: number; start_page: number; end_page: number; reason: string }) {
    getDb()
      .prepare(
        `INSERT INTO reserve_pages (khatm_id, start_page, end_page, reason) VALUES (?, ?, ?, ?)`
      )
      .run(input.khatm_id, input.start_page, input.end_page, input.reason);
  },
  available(khatmId: number) {
    return getDb()
      .prepare(`SELECT * FROM reserve_pages WHERE khatm_id = ? AND claimed_by IS NULL ORDER BY start_page`)
      .all(khatmId) as Array<{ id: number; start_page: number; end_page: number; reason: string }>;
  },
  claim(reserveId: number, userId: number) {
    getDb()
      .prepare(
        `UPDATE reserve_pages SET claimed_by = ?, claimed_at = datetime('now') WHERE id = ? AND claimed_by IS NULL`
      )
      .run(userId, reserveId);
  },
};

export const Garden = {
  forUser(userId: number) {
    let row = getDb().prepare('SELECT * FROM garden_state WHERE user_id = ?').get(userId) as
      | { user_id: number; trees: number; fruits: number; health: number; last_watered: string | null; withered: number }
      | undefined;
    if (!row) {
      getDb()
        .prepare('INSERT INTO garden_state (user_id, trees, fruits, health) VALUES (?, 1, 0, 100)')
        .run(userId);
      row = getDb().prepare('SELECT * FROM garden_state WHERE user_id = ?').get(userId) as any;
    }
    return row!;
  },
  water(userId: number, opts: { fruitGained: number; healthGained: number; treeBonus: number }) {
    const g = Garden.forUser(userId);
    const newHealth = Math.min(100, g.health + opts.healthGained);
    const newFruits = g.fruits + opts.fruitGained;
    const newTrees = g.trees + opts.treeBonus;
    getDb()
      .prepare(
        `UPDATE garden_state SET trees = ?, fruits = ?, health = ?, last_watered = datetime('now'), withered = 0 WHERE user_id = ?`
      )
      .run(newTrees, newFruits, newHealth, userId);
  },
  decay(userId: number, healthLoss: number) {
    const g = Garden.forUser(userId);
    const newHealth = Math.max(0, g.health - healthLoss);
    const withered = newHealth === 0 ? 1 : 0;
    getDb()
      .prepare('UPDATE garden_state SET health = ?, withered = ? WHERE user_id = ?')
      .run(newHealth, withered, userId);
  },
};

export const Settings = {
  get(key: string): string | undefined {
    const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as
      | { value: string }
      | undefined;
    return row?.value;
  },
  set(key: string, value: string) {
    getDb()
      .prepare(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`
      )
      .run(key, value);
  },
};
