import { Khatms, Tasks, Reserve, type Khatm, type User } from './db/models';
import { roundEndPage, TOTAL_PAGES } from './quran';

/**
 * Aktiv xatm ichidagi keyingi bo'sh betni topadi.
 * Tasklar start_page bo'yicha tartibda; ular orasidagi yoki oxiridagi bo'shliqni qaytaradi.
 */
export function nextFreeStartPage(khatm: Khatm): number | null {
  const tasks = Tasks.forKhatm(khatm.id).filter((t) => t.status !== 'cancelled');
  tasks.sort((a, b) => a.start_page - b.start_page);

  let cursor = 1;
  for (const t of tasks) {
    if (t.start_page > cursor) {
      return cursor;
    }
    cursor = Math.max(cursor, t.end_page + 1);
  }
  if (cursor > khatm.total_pages) return null;
  return cursor;
}

/**
 * Foydalanuvchi uchun vazifa hisoblaydi (kech qo'shilganni hisobga olib).
 * Qaytaradi: { startPage, endPage, days }
 */
export function computeTaskRange(
  khatm: Khatm,
  user: User,
  now: Date = new Date()
): { startPage: number; endPage: number; days: number } | null {
  const start = new Date(khatm.starts_at);
  const end = new Date(khatm.ends_at);
  const totalMs = end.getTime() - start.getTime();
  const remainingMs = end.getTime() - now.getTime();
  if (remainingMs <= 0) return null;

  const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(1, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
  const days = Math.min(totalDays, remainingDays);

  const desiredPages = Math.max(1, user.daily_capacity * days);

  const startPage = nextFreeStartPage(khatm);
  if (startPage === null) return null;

  const endPage = roundEndPage(startPage, desiredPages, khatm.total_pages);
  return { startPage, endPage, days };
}

/**
 * Foydalanuvchiga vazifa beradi (zaxiradan bo'lsa zaxiradan olinadi, aks holda navbatdagi bo'sh oraliqdan).
 * Qaytaradi yaratilgan task yoki null (xatm tugagan/bet qolmagan bo'lsa).
 */
export function assignTaskToUser(user: User, opts?: { fromReserveOnly?: boolean }) {
  const khatm = Khatms.active();
  if (!khatm) return null;

  // Avval zaxiradan tekshiramiz (qo'shimcha vazifa olishni xohlasa)
  const reserves = Reserve.available(khatm.id);
  if (reserves.length > 0) {
    const r = reserves[0];
    Reserve.claim(r.id, user.id);
    return Tasks.create({
      khatm_id: khatm.id,
      user_id: user.id,
      start_page: r.start_page,
      end_page: r.end_page,
    });
  }

  if (opts?.fromReserveOnly) return null;

  const range = computeTaskRange(khatm, user);
  if (!range) return null;

  return Tasks.create({
    khatm_id: khatm.id,
    user_id: user.id,
    start_page: range.startPage,
    end_page: range.endPage,
  });
}

/**
 * SOS: foydalanuvchi vazifasidan N bet kamaytirib so'raydi.
 * Kamaytirilgan oraliq zaxiraga tushadi.
 */
export function reduceTaskBySOS(taskId: number, pagesToReduce: number) {
  const db = require('./db').getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as
    | { id: number; khatm_id: number; start_page: number; end_page: number; pages_done: number }
    | undefined;
  if (!task) return null;

  const totalRemaining = task.end_page - task.start_page + 1 - task.pages_done;
  const reduce = Math.min(pagesToReduce, Math.max(0, totalRemaining - 1));
  if (reduce <= 0) return null;

  const newEnd = task.end_page - reduce;
  Tasks.updateRange(task.id, task.start_page, newEnd);

  Reserve.add({
    khatm_id: task.khatm_id,
    start_page: newEnd + 1,
    end_page: task.end_page,
    reason: 'sos',
  });

  return { newStart: task.start_page, newEnd, reducedPages: reduce };
}

/**
 * Vazifani bekor qilib, qolgan betlarni zaxiraga jo'natish (admin tomonidan).
 */
export function reassignTask(taskId: number) {
  const db = require('./db').getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as
    | { id: number; khatm_id: number; start_page: number; end_page: number; pages_done: number }
    | undefined;
  if (!task) return null;
  const remainStart = task.start_page + task.pages_done;
  if (remainStart <= task.end_page) {
    Reserve.add({
      khatm_id: task.khatm_id,
      start_page: remainStart,
      end_page: task.end_page,
      reason: 'reassigned',
    });
  }
  Tasks.setStatus(task.id, 'reassigned');
  return true;
}
