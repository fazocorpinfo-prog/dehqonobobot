import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'silent' | 'frozen' | 'blocked'>('all');
  const [q, setQ] = useState('');

  async function load() {
    const r = await api.admin.users();
    setUsers(r.users);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filter === 'silent' && !u.needs_call) return false;
      if (filter === 'frozen' && u.status !== 'frozen') return false;
      if (filter === 'blocked' && u.status !== 'blocked') return false;
      if (q.trim()) {
        const t = q.toLowerCase();
        const name = `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase();
        const phone = (u.phone ?? '').toLowerCase();
        if (!name.includes(t) && !phone.includes(t)) return false;
      }
      return true;
    });
  }, [users, filter, q]);

  async function setStatus(id: number, status: string) {
    await api.admin.setUserStatus(id, status);
    await load();
  }

  async function freezeWeek(id: number) {
    const until = new Date();
    until.setDate(until.getDate() + 7);
    await api.admin.setUserStatus(id, 'frozen', until.toISOString());
    await load();
  }

  async function reassign(taskId: number) {
    if (!confirm("Bu vazifani zaxiraga o'tkazasizmi?")) return;
    await api.admin.reassignTask(taskId);
    await load();
  }

  function downloadCSV() {
    const calls = users.filter((u) => u.needs_call);
    const csv = ['Ism,Familiya,Telefon,Kunlar jim']
      .concat(calls.map((u) => `${u.first_name},${u.last_name ?? ''},${u.phone ?? ''},${u.days_silent}`))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qongiroq-royxati.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filterCounts = {
    all: users.length,
    silent: users.filter((u) => u.needs_call).length,
    frozen: users.filter((u) => u.status === 'frozen').length,
    blocked: users.filter((u) => u.status === 'blocked').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">Jamoa boshqaruvi</div>
        <h2 className="title">👥 Foydalanuvchilar</h2>
      </div>

      {/* Filters */}
      <div className="bg-white border border-emerald-100/70 rounded-2xl p-1 flex gap-1 shadow-sm overflow-x-auto no-scrollbar">
        {(
          [
            { v: 'all', label: 'Hammasi', icon: '👥' },
            { v: 'silent', label: 'Qiynalayotganlar', icon: '🔔' },
            { v: 'frozen', label: 'Muzlatilgan', icon: '❄️' },
            { v: 'blocked', label: 'Bloklangan', icon: '⛔' },
          ] as const
        ).map((f) => {
          const active = filter === f.v;
          const count = (filterCounts as any)[f.v];
          return (
            <button
              key={f.v}
              onClick={() => setFilter(f.v as any)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition ${
                active
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/25' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="🔍 Ism yoki telefon bo'yicha qidirish..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-ghost whitespace-nowrap" onClick={downloadCSV}>
          📥 CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-8 text-emerald-600/80">
          Bu filtr bo'yicha hech kim topilmadi.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <UserCard
              key={u.id}
              u={u}
              onSetStatus={setStatus}
              onFreezeWeek={freezeWeek}
              onReassign={reassign}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserCard({
  u,
  onSetStatus,
  onFreezeWeek,
  onReassign,
}: {
  u: any;
  onSetStatus: (id: number, s: string) => void;
  onFreezeWeek: (id: number) => void;
  onReassign: (taskId: number) => void;
}) {
  const initials = ((u.first_name?.[0] ?? '?') + (u.last_name?.[0] ?? '')).toUpperCase();
  const pct = u.pages_total > 0 ? Math.round(((u.pages_done ?? 0) / u.pages_total) * 100) : 0;

  const statusMap: Record<string, { label: string; cls: string }> = {
    active: { label: 'Aktiv', cls: 'chip-emerald' },
    frozen: { label: 'Muzlatilgan', cls: 'chip bg-amber-100 text-amber-800' },
    blocked: { label: 'Bloklangan', cls: 'chip-rose' },
  };
  const s = statusMap[u.status] ?? statusMap.active;

  return (
    <article
      className={`card p-4 ${u.needs_call ? 'ring-1 ring-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-200 to-emerald-300 text-emerald-900 flex items-center justify-center font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-bold text-emerald-950 truncate">
              {u.first_name} {u.last_name ?? ''}
            </div>
            <span className={s.cls}>{s.label}</span>
            {u.needs_call && (
              <span className="chip bg-amber-100 text-amber-800">📞 Qo'ng'iroq</span>
            )}
          </div>
          <div className="text-[12px] text-emerald-600 mt-0.5 flex items-center gap-2 flex-wrap">
            {u.age && <span>🎂 {u.age} yosh</span>}
            {u.phone && <span>📱 {u.phone}</span>}
            {typeof u.days_silent === 'number' && u.days_silent < 999 && (
              <span className={u.days_silent >= 2 ? 'text-amber-700 font-semibold' : ''}>
                🔕 {u.days_silent} kun
              </span>
            )}
          </div>

          {u.task_id && (
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-emerald-700 mb-1">
                <span>
                  Vazifa: {u.pages_done}/{u.pages_total} bet
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-emerald-100/60">
        {u.task_id && (
          <button
            onClick={() => onReassign(u.task_id)}
            className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 font-semibold"
          >
            ↻ Vazifani o'tkaz
          </button>
        )}
        {u.status === 'active' && (
          <>
            <button
              onClick={() => onFreezeWeek(u.id)}
              className="text-xs px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 font-semibold"
            >
              ❄️ 1 hafta muzlat
            </button>
            <button
              onClick={() => onSetStatus(u.id, 'blocked')}
              className="text-xs px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg hover:bg-rose-200 font-semibold"
            >
              ⛔ Blok
            </button>
          </>
        )}
        {(u.status === 'frozen' || u.status === 'blocked') && (
          <button
            onClick={() => onSetStatus(u.id, 'active')}
            className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 font-semibold"
          >
            ✓ Tiklash
          </button>
        )}
      </div>
    </article>
  );
}
