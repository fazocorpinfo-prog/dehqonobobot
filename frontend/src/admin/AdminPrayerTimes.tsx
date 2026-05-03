import { useState } from 'react';
import { api } from '../api';

interface Row {
  date: string;
  bomdod: string;
  quyosh: string;
  peshin: string;
  asr: string;
  shom: string;
  xufton: string;
}

const PRAYERS = [
  { key: 'bomdod', label: 'Bomdod', icon: '🌅' },
  { key: 'quyosh', label: 'Quyosh', icon: '☀️' },
  { key: 'peshin', label: 'Peshin', icon: '🌞' },
  { key: 'asr', label: 'Asr', icon: '🌤️' },
  { key: 'shom', label: 'Shom', icon: '🌇' },
  { key: 'xufton', label: 'Xufton', icon: '🌙' },
] as const;

function nextDates(n: number): string[] {
  const out: string[] = [];
  const t = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(t);
    d.setDate(t.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const DEFAULT: Omit<Row, 'date'> = {
  bomdod: '04:30',
  quyosh: '05:55',
  peshin: '12:30',
  asr: '17:00',
  shom: '19:25',
  xufton: '20:55',
};

export default function AdminPrayerTimes() {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<Row[]>(
    nextDates(7).map((date) => ({ date, ...DEFAULT }))
  );
  const [msg, setMsg] = useState<string | null>(null);

  function update(i: number, field: keyof Row, value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function applyAllFromFirst() {
    if (!confirm("Birinchi qatorning vaqtlari hammaga qo'llanilsinmi?")) return;
    const first = rows[0];
    setRows((r) =>
      r.map((row) => ({
        ...row,
        bomdod: first.bomdod,
        quyosh: first.quyosh,
        peshin: first.peshin,
        asr: first.asr,
        shom: first.shom,
        xufton: first.xufton,
      }))
    );
  }

  function setRange(n: number) {
    setDays(n);
    setRows(nextDates(n).map((date) => ({ date, ...DEFAULT })));
  }

  async function save() {
    await api.admin.setPrayerTimes(rows);
    setMsg(`✅ ${rows.length} kunlik vaqtlar saqlandi`);
    setTimeout(() => setMsg(null), 2500);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">Jadvalni kiritish</div>
        <h2 className="title">🕌 Namoz vaqtlari</h2>
      </div>

      {msg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 text-sm animate-fade-up">
          {msg}
        </div>
      )}

      <div className="card space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="font-semibold text-emerald-900">Davomiyligi</div>
            <div className="text-[12px] text-emerald-600">
              Necha kunlik jadval kiritmoqchisiz?
            </div>
          </div>
          <div className="flex gap-1 bg-emerald-50 rounded-xl p-1">
            {[7, 14, 30].map((n) => (
              <button
                key={n}
                onClick={() => setRange(n)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  days === n
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-emerald-600 hover:text-emerald-800'
                }`}
              >
                {n} kun
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={applyAllFromFirst}
          className="text-xs btn-soft self-start"
        >
          ↧ 1-qatordan hammaga
        </button>
      </div>

      <section className="card p-0 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">Sana</th>
                {PRAYERS.map((p) => (
                  <th key={p.key} className="px-2 py-3 font-semibold">
                    <div className="flex flex-col items-center">
                      <span className="text-base">{p.icon}</span>
                      <span className="text-[11px] mt-0.5">{p.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.date}
                  className={`border-t border-emerald-50 ${i % 2 ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="px-3 py-2 font-medium text-emerald-900 whitespace-nowrap">
                    {r.date}
                  </td>
                  {PRAYERS.map((p) => (
                    <td key={p.key} className="px-1.5 py-1.5">
                      <input
                        className="w-20 mx-auto block bg-white border border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/60 rounded-lg px-2 py-1.5 text-center font-semibold text-emerald-900 outline-none"
                        value={(r as any)[p.key]}
                        onChange={(e) => update(i, p.key as keyof Row, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button className="btn-primary w-full" onClick={save}>
        💾 Saqlash ({rows.length} kun)
      </button>
    </div>
  );
}
