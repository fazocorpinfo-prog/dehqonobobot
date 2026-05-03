import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Leaderboard() {
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('week');
  const [age, setAge] = useState<'' | 'kids' | 'adults'>('');
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.leaderboard(period, age || undefined).then((r) => setRows(r.leaderboard));
  }, [period, age]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Reyting jadvali</div>
          <h2 className="title">🏆 Eng faollar</h2>
        </div>
      </div>

      <Segmented
        options={[
          { v: 'week', label: 'Hafta' },
          { v: 'month', label: 'Oy' },
          { v: 'all', label: 'Hammasi' },
        ]}
        value={period}
        onChange={(v) => setPeriod(v as any)}
      />
      <Segmented
        options={[
          { v: '', label: 'Hammasi' },
          { v: 'kids', label: 'Bolalar' },
          { v: 'adults', label: 'Kattalar' },
        ]}
        value={age}
        onChange={(v) => setAge(v as any)}
      />

      {top3.length > 0 && <Podium rows={top3} />}

      <div className="card p-2">
        {rows.length === 0 ? (
          <div className="subtitle p-6 text-center">Hozircha ma'lumot yo'q.</div>
        ) : (
          rest.length === 0 ? (
            <div className="subtitle px-3 py-2 text-center">Faqat top-3 mavjud.</div>
          ) : (
            rest.map((r, idx) => {
              const rank = idx + 4;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2.5 border-b border-emerald-50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold shrink-0">
                      {rank}
                    </span>
                    <span className="font-medium text-emerald-900 truncate">
                      {r.first_name} {r.last_name ?? ''}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700 shrink-0">{r.total} bet</span>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="bg-white border border-emerald-100/70 rounded-2xl p-1 flex gap-1 shadow-sm">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${
              active
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Podium({ rows }: { rows: any[] }) {
  const order = [rows[1], rows[0], rows[2]].filter(Boolean);
  const heights = ['h-20', 'h-28', 'h-16'];
  const ranks = [2, 1, 3];
  const medals = ['🥈', '🥇', '🥉'];
  const colors = [
    'from-slate-300 to-slate-400',
    'from-gold-300 to-gold-500',
    'from-amber-500 to-amber-700',
  ];

  return (
    <section className="card bg-gradient-to-b from-white to-emerald-50/40">
      <div className="flex items-end justify-around gap-2 pt-2">
        {order.map((r, i) => (
          <div key={r.id} className="flex-1 flex flex-col items-center">
            <div className="text-2xl">{medals[i]}</div>
            <div className="mt-1 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center text-emerald-800 font-bold ring-4 ring-white shadow-soft">
              {(r.first_name?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="text-[12px] font-semibold text-emerald-900 mt-1 max-w-[90px] truncate text-center">
              {r.first_name}
            </div>
            <div className="text-[11px] text-emerald-600">{r.total} bet</div>
            <div
              className={`mt-2 w-full ${heights[i]} rounded-t-2xl bg-gradient-to-b ${colors[i]} flex items-start justify-center pt-1 text-white font-extrabold`}
            >
              {ranks[i]}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
