import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Profile({ user }: { user: any }) {
  const [reports, setReports] = useState<any[]>([]);
  const [task, setTask] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    api.reports().then((r) => setReports(r.reports));
    api.activeTask().then((r) => setTask(r.task));
    api.certificates().then((r) => setCerts(r.certificates)).catch(() => setCerts([]));
  }, []);

  const totalPages = reports.reduce((sum, r) => sum + (r.pages_read ?? 0), 0);
  const initials = ((user.first_name?.[0] ?? '?') + (user.last_name?.[0] ?? '')).toUpperCase();

  async function download(id: number) {
    setDownloading(id);
    try {
      await api.downloadCertificate(id);
    } catch (e: any) {
      alert("Yuklab bo'lmadi: " + (e?.message ?? 'xato'));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Profile hero */}
      <section className="relative overflow-hidden card text-center bg-gradient-to-br from-emerald-50 via-white to-gold-50/40">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gold-200/40 blur-2xl" aria-hidden />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-200/40 blur-3xl" aria-hidden />

        <div className="relative">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-hero text-white flex items-center justify-center text-2xl font-extrabold shadow-card ring-4 ring-white">
            {initials}
          </div>
          <div className="title mt-3">
            {user.first_name} {user.last_name ?? ''}
          </div>
          <div className="subtitle">
            {user.age ? `${user.age} yosh` : ''}
            {user.age && user.daily_capacity ? ' · ' : ''}
            {user.daily_capacity ? `Kuniga ${user.daily_capacity} bet` : ''}
          </div>
          {user.phone && (
            <div className="text-[12px] text-emerald-700/80 mt-1">📞 {user.phone}</div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="title mb-3">📊 Umumiy statistika</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl py-4 text-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft">
            <div className="text-3xl font-extrabold tracking-tight">{totalPages}</div>
            <div className="text-[11px] uppercase tracking-wider opacity-80 mt-0.5">
              Jami o'qilgan bet
            </div>
          </div>
          <div className="rounded-2xl py-4 text-center bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-gold">
            <div className="text-3xl font-extrabold tracking-tight">{reports.length}</div>
            <div className="text-[11px] uppercase tracking-wider opacity-90 mt-0.5">
              Hisobot kunlari
            </div>
          </div>
        </div>
        {task && (
          <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-[13px] text-emerald-800">
            <span className="font-semibold">Aktiv vazifa:</span> {task.label} · O'qigan{' '}
            <b>{task.pages_done}</b>/{task.end_page - task.start_page + 1}
          </div>
        )}
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-2">
          <div className="title">📜 Sertifikatlarim</div>
          {certs.length > 0 && <span className="chip-gold">{certs.length} ta</span>}
        </div>
        {certs.length === 0 ? (
          <div className="rounded-2xl bg-emerald-50 border border-dashed border-emerald-200 px-3 py-5 text-center text-emerald-700/80 text-sm">
            🏅 Hozircha sertifikatingiz yo'q. Xatm tugaganda eng faollarga avtomatik beriladi.
          </div>
        ) : (
          <ul className="space-y-2">
            {certs.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between bg-gradient-to-br from-gold-50 to-amber-50 border border-gold-200 rounded-2xl px-4 py-3"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-gold text-white flex items-center justify-center text-lg shrink-0">
                    🏅
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-amber-900 truncate">
                      {c.rank ? `#${c.rank} · ` : ''}
                      {c.title}
                    </div>
                    <div className="text-[11px] text-amber-700/80">
                      {new Date(c.awarded_at).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => download(c.id)}
                  disabled={downloading === c.id}
                  className="text-[12px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3 py-2 rounded-xl font-semibold shrink-0"
                >
                  {downloading === c.id ? '...' : '📥 PDF'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
