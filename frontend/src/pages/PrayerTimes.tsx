import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const PRAYERS = [
  { key: 'bomdod', label: 'Bomdod', icon: '🌅' },
  { key: 'quyosh', label: 'Quyosh', icon: '☀️' },
  { key: 'peshin', label: 'Peshin', icon: '🌞' },
  { key: 'asr', label: 'Asr', icon: '🌤️' },
  { key: 'shom', label: 'Shom', icon: '🌇' },
  { key: 'xufton', label: 'Xufton', icon: '🌙' },
] as const;

export default function PrayerTimes() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.prayerTimes().then((r) => setRows(r.prayerTimes));
  }, []);

  const today = useMemo(() => {
    const d = new Date().toISOString().slice(0, 10);
    return rows.find((r) => r.date === d) ?? rows[0];
  }, [rows]);

  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow">Bugungi vaqtlar</div>
        <h2 className="title">🕌 Namoz vaqtlari</h2>
      </div>

      {rows.length === 0 && (
        <div className="card text-center py-8 text-emerald-600/80">
          Vaqtlar hali kiritilmagan.
        </div>
      )}

      {today && (
        <section className="relative overflow-hidden card bg-gradient-hero text-white">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold-400/20 blur-3xl" aria-hidden />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-widest text-emerald-100/70">
              Bugun · {today.date}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {PRAYERS.map((p) => (
                <div
                  key={p.key}
                  className="rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-2 py-3 text-center"
                >
                  <div className="text-lg">{p.icon}</div>
                  <div className="text-[10.5px] uppercase tracking-wider opacity-80 mt-0.5">
                    {p.label}
                  </div>
                  <div className="font-extrabold mt-0.5 text-base">
                    {(today as any)[p.key] ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {rows.length > 1 && (
        <section className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-emerald-100/70 flex items-center justify-between">
            <div className="title">📅 30 kunlik jadval</div>
            <span className="chip-emerald">{rows.length} kun</span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-800">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold">Sana</th>
                  {PRAYERS.map((p) => (
                    <th key={p.key} className="px-2 py-2 text-center font-semibold">
                      {p.label.slice(0, 4)}.
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.date} className="even:bg-emerald-50/40 border-t border-emerald-50">
                    <td className="px-3 py-2 text-emerald-900 font-medium whitespace-nowrap">
                      {r.date}
                    </td>
                    {PRAYERS.map((p) => (
                      <td key={p.key} className="px-2 py-2 text-center text-emerald-800 font-medium">
                        {(r as any)[p.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
