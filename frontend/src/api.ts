import { getInitData, getTelegramUser } from './telegram';

const BASE = (import.meta as any).env?.VITE_API_URL ?? '/api';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const initData = getInitData();
  const tgUser = getTelegramUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(initData ? { 'X-Telegram-Init-Data': initData } : {}),
    // Dev rejimida initData bo'lmasa, telegram-id bilan login qilinadi
    ...(tgUser ? { 'X-Telegram-Id': String(tgUser.id) } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
  return res.json();
}

export const api = {
  me: () => http<{ user: any | null; isAdmin?: boolean }>('/me'),
  register: (body: any) => http<{ user: any }>('/register', { method: 'POST', body: JSON.stringify(body) }),
  activeTask: () => http<{ task: any | null }>('/tasks/active'),
  submitReport: (pages: number, note?: string) =>
    http<{ ok: boolean; total: number }>('/reports', {
      method: 'POST',
      body: JSON.stringify({ pages, note }),
    }),
  reports: () => http<{ reports: Array<{ report_date: string; pages_read: number }> }>('/reports'),
  sos: (pages: number) => http<{ ok: boolean }>('/sos', { method: 'POST', body: JSON.stringify({ pages }) }),
  garden: () => http<{ garden: any }>('/garden'),
  leaderboard: (period = 'all', age?: string) => {
    const q = new URLSearchParams({ period });
    if (age) q.append('age', age);
    return http<{ leaderboard: any[] }>(`/leaderboard?${q}`);
  },
  announcements: () => http<{ announcements: any[] }>('/announcements'),
  challenges: () => http<{ challenges: any[] }>('/challenges'),
  contributeChallenge: (id: number, count: number) =>
    http<{ ok: boolean; total: number }>(`/challenges/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    }),
  prayerTimes: () => http<{ prayerTimes: any[] }>('/prayer-times'),
  articles: (category?: string) =>
    http<{ articles: any[] }>(`/articles${category ? `?category=${category}` : ''}`),
  verseOfDay: () => http<{ verse: any | null }>('/verse-of-day'),
  certificates: () =>
    http<{ certificates: Array<{ id: number; title: string; rank: number | null; awarded_at: string; khatm_id: number | null }> }>(
      '/certificates'
    ),
  downloadCertificate: async (id: number) => {
    const initData = getInitData();
    const tgUser = getTelegramUser();
    const headers: Record<string, string> = {
      ...(initData ? { 'X-Telegram-Init-Data': initData } : {}),
      ...(tgUser ? { 'X-Telegram-Id': String(tgUser.id) } : {}),
    };
    const res = await fetch(`${BASE}/certificates/${id}/pdf`, { headers });
    if (!res.ok) throw new Error(`PDF download failed: ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sertifikat-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  // admin
  admin: {
    stats: () => http<{ stats: any }>('/admin/stats'),
    khatms: () => http<{ khatms: any[] }>('/admin/khatms'),
    createKhatm: (b: any) => http('/admin/khatms', { method: 'POST', body: JSON.stringify(b) }),
    users: () => http<{ users: any[] }>('/admin/users'),
    setUserStatus: (id: number, status: string, frozenUntil?: string) =>
      http(`/admin/users/${id}/status`, { method: 'POST', body: JSON.stringify({ status, frozenUntil }) }),
    reassignTask: (id: number) => http(`/admin/tasks/${id}/reassign`, { method: 'POST' }),
    addVerse: (b: any) => http('/admin/verses', { method: 'POST', body: JSON.stringify(b) }),
    addArticle: (b: any) => http('/admin/articles', { method: 'POST', body: JSON.stringify(b) }),
    addAnnouncement: (b: any) => http('/admin/announcements', { method: 'POST', body: JSON.stringify(b) }),
    addChallenge: (b: any) => http('/admin/challenges', { method: 'POST', body: JSON.stringify(b) }),
    setPrayerTimes: (items: any[]) =>
      http('/admin/prayer-times', { method: 'POST', body: JSON.stringify({ items }) }),
    reserve: () => http<{ reserve: any[] }>('/admin/reserve'),
    awardCertificates: (khatmId: number, topN = 10) =>
      http<{ ok: boolean; awarded: number; certificates: any[] }>(
        '/admin/certificates/award',
        { method: 'POST', body: JSON.stringify({ khatmId, topN }) }
      ),
    previewTop: (khatmId: number, topN = 10) =>
      http<{ top: any[] }>(`/admin/certificates/preview?khatmId=${khatmId}&topN=${topN}`),
    certificates: (khatmId?: number) =>
      http<{ certificates: any[] }>(
        `/admin/certificates${khatmId ? `?khatmId=${khatmId}` : ''}`
      ),
  },
};
