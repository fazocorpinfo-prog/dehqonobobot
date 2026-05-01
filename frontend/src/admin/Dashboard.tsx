import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [reserve, setReserve] = useState<any[]>([]);

  useEffect(() => {
    api.admin.stats().then((r) => setStats(r.stats));
    api.admin.reserve().then((r) => setReserve(r.reserve));
  }, []);

  if (!stats) return <div className="subtitle">Yuklanyapti...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat title="Foydalanuvchilar" value={stats.users} />
        <Stat title="Aktiv foydalan." value={stats.active_users} />
        <Stat title="Aktiv xatmlar" value={stats.active_khatms} />
        <Stat title="O'qilgan betlar" value={stats.pages_total} />
      </div>

      <section className="card">
        <h3 className="title">📦 Zaxiradagi betlar</h3>
        <div className="subtitle">SOS yoki bekor qilingan vazifalardan qolgan</div>
        {reserve.length === 0 ? (
          <div className="subtitle mt-2">Bo'sh.</div>
        ) : (
          <ul className="mt-2 text-sm">
            {reserve.map((r) => (
              <li key={r.id} className="flex justify-between border-b border-emerald-50 py-1">
                <span>{r.start_page}–{r.end_page}-betlar</span>
                <span className="text-emerald-500 text-xs">{r.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-emerald-700">{value}</div>
      <div className="text-xs text-emerald-600">{title}</div>
    </div>
  );
}
