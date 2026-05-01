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
      <section className="card text-center">
        <div className="text-5xl">👤</div>
        <div className="title mt-2">{user.first_name} {user.last_name ?? ''}</div>
        <div className="subtitle">Yosh: {user.age ?? '-'} · Kunlik: {user.daily_capacity} bet</div>
        {user.phone && <div className="text-xs text-emerald-600 mt-1">📞 {user.phone}</div>}
      </section>

      <section className="card">
        <div className="title">📊 Umumiy statistika</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-emerald-50 rounded-xl py-3 text-center">
            <div className="text-2xl font-bold text-emerald-700">{totalPages}</div>
            <div className="text-xs text-emerald-600">Jami o'qilgan bet</div>
          </div>
          <div className="bg-emerald-50 rounded-xl py-3 text-center">
            <div className="text-2xl font-bold text-emerald-700">{reports.length}</div>
            <div className="text-xs text-emerald-600">Hisobot kunlari</div>
          </div>
        </div>
        {task && (
          <div className="mt-3 text-sm text-emerald-700">
            Aktiv vazifa: {task.label} · O'qigan {task.pages_done}/{task.end_page - task.start_page + 1}
          </div>
        )}
      </section>

      <section className="card">
        <div className="title">📜 Sertifikatlarim</div>
        {certs.length === 0 ? (
          <div className="subtitle mt-2">
            Hozircha sertifikatingiz yo'q. Xatm tugaganda eng faollarga avtomatik beriladi.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {certs.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"
              >
                <div>
                  <div className="font-semibold text-amber-800">
                    {c.rank ? `#${c.rank} · ` : ''}{c.title}
                  </div>
                  <div className="text-xs text-amber-700">
                    {new Date(c.awarded_at).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
                <button
                  onClick={() => download(c.id)}
                  disabled={downloading === c.id}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3 py-2 rounded-lg"
                >
                  {downloading === c.id ? 'Yuklanmoqda...' : '📥 PDF'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
