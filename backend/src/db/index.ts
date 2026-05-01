import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('DB initialized emas. Avval initDatabase() chaqiring.');
  }
  return db;
}

export function initDatabase(): Database.Database {
  if (db) return db;

  const dir = path.dirname(config.dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  // Birinchi adminlarni qo'shib qo'yamiz (agar mavjud bo'lsa)
  const upsertAdmin = db.prepare(
    `INSERT INTO users (telegram_id, first_name, role)
     VALUES (?, ?, 'admin')
     ON CONFLICT(telegram_id) DO UPDATE SET role='admin'`
  );
  for (const tgId of config.adminIds) {
    upsertAdmin.run(tgId, 'Admin');
  }

  console.log(`[db] SQLite ishga tushdi: ${config.dbPath}`);
  return db;
}

export type Row = Record<string, any>;
