-- Dehqonbobo Jome masjidi - Xatmi Qur'on bot DB schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  age INTEGER,
  daily_capacity INTEGER NOT NULL DEFAULT 1, -- kuniga necha bet o'qiy oladi
  role TEXT NOT NULL DEFAULT 'user',         -- 'user' | 'admin'
  status TEXT NOT NULL DEFAULT 'active',     -- 'active' | 'frozen' | 'blocked'
  frozen_until TEXT,                         -- ISO datetime
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS khatms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,                       -- masalan: "1-hafta xatmi"
  starts_at TEXT NOT NULL,                   -- ISO datetime (soatigacha)
  ends_at TEXT NOT NULL,                     -- ISO datetime
  total_pages INTEGER NOT NULL DEFAULT 604,  -- standart Madina mushafi
  status TEXT NOT NULL DEFAULT 'planned',    -- 'planned' | 'active' | 'completed' | 'cancelled'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Xatm ichida har bir foydalanuvchining vazifasi (boshlang'ich va qolgan betlar oralig'i)
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  khatm_id INTEGER NOT NULL REFERENCES khatms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_page INTEGER NOT NULL,               -- 1..604
  end_page INTEGER NOT NULL,                 -- inclusive
  pages_done INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',     -- 'active' | 'completed' | 'reassigned' | 'cancelled'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_khatm ON tasks(khatm_id);

-- Kunlik hisobotlar (foydalanuvchi har kuni nechta bet o'qigani)
CREATE TABLE IF NOT EXISTS daily_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date TEXT NOT NULL,                 -- YYYY-MM-DD
  pages_read INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(task_id, report_date)
);

-- Zaxira betlar (SOS yoki bekor qilingan vazifalardan qolgan, qo'shimcha vazifa olishni xohlovchilarga)
CREATE TABLE IF NOT EXISTS reserve_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  khatm_id INTEGER NOT NULL REFERENCES khatms(id) ON DELETE CASCADE,
  start_page INTEGER NOT NULL,
  end_page INTEGER NOT NULL,
  reason TEXT,                               -- 'sos' | 'reassigned' | 'unread'
  claimed_by INTEGER REFERENCES users(id),
  claimed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Raqamli bog' holati (gamification)
CREATE TABLE IF NOT EXISTS garden_state (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  trees INTEGER NOT NULL DEFAULT 1,          -- qancha daraxt
  fruits INTEGER NOT NULL DEFAULT 0,         -- mevalar (kunlik vazifa to'liq)
  health INTEGER NOT NULL DEFAULT 100,       -- 0..100, 2 kun hisobot bermasa pasayadi
  last_watered TEXT,                         -- ISO datetime
  withered INTEGER NOT NULL DEFAULT 0
);

-- E'lonlar peshtaxtasi
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',  -- 'general' | 'charity' | 'imam' | 'event'
  card_number TEXT,                          -- xayriya/karta raqam (faqat ma'lumot)
  card_holder TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT
);

-- Challenge'lar (zikr challenge va h.k.)
CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,                       -- "1 haftada 1 million Istig'for"
  description TEXT,
  target_count INTEGER NOT NULL,             -- 1000000
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS challenge_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(challenge_id, user_id)
);

-- Namoz vaqtlari (haftalik admin tomonidan kiritiladi)
CREATE TABLE IF NOT EXISTS prayer_times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,                 -- YYYY-MM-DD
  bomdod TEXT NOT NULL,                      -- HH:MM
  quyosh TEXT NOT NULL,
  peshin TEXT NOT NULL,
  asr TEXT NOT NULL,
  shom TEXT NOT NULL,
  xufton TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Maqolalar va duolar
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'article',  -- 'article' | 'dua'
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Qur'ondan oyatlar (admin tomonidan tanlanadi yoki rejalashtiriladi)
CREATE TABLE IF NOT EXISTS verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surah_number INTEGER NOT NULL,             -- 1..114
  surah_name TEXT NOT NULL,
  ayah_number INTEGER NOT NULL,
  arabic TEXT,
  uzbek TEXT NOT NULL,                       -- o'zbek tilida tarjima
  tafsir TEXT,                               -- qisqa tafsir
  scheduled_for TEXT,                        -- YYYY-MM-DD (agar belgilangan bo'lsa shu kuni ko'rsatiladi)
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sertifikatlar (PDF metadata)
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  khatm_id INTEGER REFERENCES khatms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  rank INTEGER,
  awarded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tugma orqali jo'natilgan SOS so'rovlari
CREATE TABLE IF NOT EXISTS sos_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pages_reduced INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'auto-applied', -- 'auto-applied' | 'admin-review'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sozlamalar (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
