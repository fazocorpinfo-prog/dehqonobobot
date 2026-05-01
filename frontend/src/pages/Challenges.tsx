import { useEffect, useState } from 'react';
import { api } from '../api';
import { haptic } from '../telegram';

export default function Challenges() {
  const [items, setItems] = useState<any[]>([]);
  const [inputs, setInputs] = useState<Record<number, string>>({});

  async function load() {
    const r = await api.challenges();
    setItems(r.challenges);
  }
  useEffect(() => { load(); }, []);

  async function add(id: number) {
    const c = Number(inputs[id]);
    if (!Number.isFinite(c) || c < 1) return;
    await api.contributeChallenge(id, c);
    haptic('light');
    setInputs((p) => ({ ...p, [id]: '' }));
    await load();
  }

  return (
    <div className="space-y-4">
      <h2 className="title">🎯 Challenge'lar</h2>
      {items.length === 0 && <div className="subtitle">Hozircha challenge yo'q.</div>}
      {items.map((c) => {
        const pct = Math.min(100, Math.round((c.total / c.target_count) * 100));
        return (
          <article key={c.id} className="card">
            <h3 className="font-bold text-emerald-900">{c.title}</h3>
            {c.description && <p className="text-sm text-emerald-700 mt-1">{c.description}</p>}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-emerald-700 mb-1">
                <span>{c.total.toLocaleString()} / {c.target_count.toLocaleString()}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <input
                className="input"
                type="number"
                min={1}
                placeholder="O'qigan miqdor"
                value={inputs[c.id] ?? ''}
                onChange={(e) => setInputs((p) => ({ ...p, [c.id]: e.target.value }))}
              />
              <button className="btn-primary" onClick={() => add(c.id)}>Qo'shish</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
