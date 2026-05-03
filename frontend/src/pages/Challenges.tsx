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
  useEffect(() => {
    load();
  }, []);

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
      <div>
        <div className="eyebrow">Jamoaviy harakat</div>
        <h2 className="title">🎯 Challenge'lar</h2>
      </div>

      {items.length === 0 && (
        <div className="card text-center py-8 text-emerald-600/80">
          Hozircha challenge yo'q. Yangi ko'rinishlar tez orada.
        </div>
      )}

      {items.map((c) => {
        const pct = Math.min(100, Math.round((c.total / c.target_count) * 100));
        const completed = pct >= 100;
        return (
          <article
            key={c.id}
            className={`card ${completed ? 'bg-gradient-to-br from-gold-50 to-emerald-50 border-gold-200' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-emerald-950">{c.title}</h3>
                {c.description && (
                  <p className="text-[13px] text-emerald-700 mt-1">{c.description}</p>
                )}
              </div>
              {completed && <span className="chip-gold shrink-0">✓ Bajarildi</span>}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[12px] text-emerald-800 mb-1.5 font-semibold">
                <span>
                  {c.total.toLocaleString()} / {c.target_count.toLocaleString()}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    completed
                      ? 'bg-gradient-to-r from-gold-300 to-gold-500'
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Miqdorni kiriting"
                value={inputs[c.id] ?? ''}
                onChange={(e) => setInputs((p) => ({ ...p, [c.id]: e.target.value }))}
              />
              <button className="btn-primary whitespace-nowrap" onClick={() => add(c.id)}>
                Qo'shish
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
