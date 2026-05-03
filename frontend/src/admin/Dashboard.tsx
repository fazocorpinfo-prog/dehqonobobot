import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [reserve, setReserve] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.admin.stats().then((r) => setStats(r.stats));
    api.admin.reserve().then((r) => setReserve(r.reserve));
    api.admin.users().then((r) => setUsers(r.users)).catch(() => setUsers([]));
  }, []);

  if (!stats) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-24" />
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  const silent = users.filter((u) => u.needs_call).length;
  const frozen = users.filter((u) => u.status === 'frozen').length;
  const blocked = users.filter((u) => u.status === 'blocked').length;
  const totalReservePages = reserve.reduce(
    (s, r) => s + (r.end_page - r.start_page + 1),
    0
  );

  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">Bugungi holat</div>
        <h2 className="title">📊 Boshqaruv ko'rinishi</h2>
      </div>

      {/* Asosiy statistika */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BigStat
          icon="👥"
          title="Jamoa"
          value={stats.users}
          hint={`${stats.active_users} aktiv`}
          gradient="from-emerald-500 to-emerald-700"
        />
        <BigStat
          icon="📖"
          title="Xatmlar"
          value={stats.active_khatms}
          hint="aktiv"
          gradient="from-teal-500 to-emerald-600"
        />
        <BigStat
          icon="📄"
          title="O'qilgan"
          value={stats.pages_total}
          hint="bet jami"
          gradient="from-gold-400 to-gold-600"
        />
        <BigStat
          icon="📦"
          title="Zaxira"
          value={totalReservePages}
          hint={`${reserve.length} diapazon`}
          gradient="from-amber-500 to-rose-500"
        />
      </div>

      {/* Diqqat talab */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="title">⚠️ Diqqat talab qiladi</div>
          <span className="chip-emerald">jonli</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <MiniStat icon="📞" label="Qo'ng'iroq kerak" value={silent} accent={silent > 0 ? 'amber' : 'emerald'} />
          <MiniStat icon="❄️" label="Muzlatilgan" value={frozen} />
          <MiniStat icon="⛔" label="Bloklangan" value={blocked} accent={blocked > 0 ? 'rose' : 'emerald'} />
        </div>
      </section>

      {/* Zaxira betlar */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="title">📦 Zaxiradagi betlar</div>
            <div className="subtitle text-[12px] mt-0.5">SOS yoki bekor qilingan vazifalardan qolgan</div>
          </div>
          {reserve.length > 0 && <span className="chip-gold">{reserve.length}</span>}
        </div>
        {reserve.length === 0 ? (
          <div className="rounded-2xl bg-emerald-50 border border-dashed border-emerald-200 px-3 py-5 text-center text-emerald-700/80 text-sm">
            Hozircha zaxira yo'q — barcha vazifalar to'liq taqsimlangan.
          </div>
        ) : (
          <ul className="space-y-2">
            {reserve.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    📄
                  </span>
                  <div>
                    <div className="font-semibold text-emerald-900 text-sm">
                      {r.start_page}–{r.end_page}-betlar
                    </div>
                    <div className="text-[11px] text-emerald-600">
                      {r.end_page - r.start_page + 1} bet · {reasonLabel(r.reason)}
                    </div>
                  </div>
                </div>
                <span className="chip-emerald">zaxira</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BigStat({
  icon,
  title,
  value,
  hint,
  gradient,
}: {
  icon: string;
  title: string;
  value: any;
  hint?: string;
  gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-white shadow-soft bg-gradient-to-br ${gradient}`}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/15 blur-2xl" aria-hidden />
      <div className="relative">
        <div className="text-2xl">{icon}</div>
        <div className="text-3xl font-extrabold tracking-tight mt-1">{value}</div>
        <div className="text-[11px] uppercase tracking-wider opacity-90 mt-0.5">{title}</div>
        {hint && <div className="text-[11px] opacity-80 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  accent = 'emerald',
}: {
  icon: string;
  label: string;
  value: number;
  accent?: 'emerald' | 'amber' | 'rose';
}) {
  const cls =
    accent === 'amber'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : accent === 'rose'
      ? 'bg-rose-50 text-rose-800 border-rose-200'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';
  return (
    <div className={`rounded-2xl border p-3 text-center ${cls}`}>
      <div className="text-xl">{icon}</div>
      <div className="text-2xl font-extrabold tracking-tight mt-1">{value}</div>
      <div className="text-[10.5px] uppercase tracking-wider opacity-80 mt-0.5">{label}</div>
    </div>
  );
}

function reasonLabel(r?: string) {
  switch (r) {
    case 'sos':
      return 'SOS';
    case 'reassigned':
      return "qayta o'tkazildi";
    case 'unread':
      return "o'qilmagan";
    default:
      return 'qoldiq';
  }
}
