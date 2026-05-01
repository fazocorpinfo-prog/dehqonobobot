import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Leaderboard() {
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('week');
  const [age, setAge] = useState<'' | 'kids' | 'adults'>('');
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.leaderboard(period, age || undefined).then((r) => setRows(r.leaderboard));
  }, [period, age]);

  return (
    <div className="space-y-4">
      <h2 className="title">🏆 Reyting</h2>
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((p) => (
          <button
            key={p}
            className={`flex-1 py-2 rounded-xl text-sm ${period === p ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-200'}`}
            onClick={() => setPeriod(p)}
          >
            {p === 'week' ? 'Hafta' : p === 'month' ? 'Oy' : 'Hammasi'}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(['', 'kids', 'adults'] as const).map((a) => (
          <button
            key={a}
            className={`flex-1 py-2 rounded-xl text-sm ${age === a ? 'bg-emerald-700 text-white' : 'bg-white border border-emerald-200'}`}
            onClick={() => setAge(a)}
          >
            {a === '' ? 'Hammasi' : a === 'kids' ? 'Bolalar (<16)' : 'Kattalar (16+)'}
          </button>
        ))}
      </div>
      <div className="card p-2">
        {rows.length === 0 ? (
          <div className="subtitle p-3">Ma'lumot yo'q.</div>
        ) : (
          rows.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between px-3 py-2 border-b border-emerald-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
                  i === 0 ? 'bg-yellow-400 text-white' :
                  i === 1 ? 'bg-gray-300 text-white' :
                  i === 2 ? 'bg-amber-600 text-white' :
                  'bg-emerald-100 text-emerald-700'
                }`}>{i + 1}</span>
                <span className="font-medium">{r.first_name} {r.last_name ?? ''}</span>
              </div>
              <span className="font-bold text-emerald-700">{r.total} bet</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
