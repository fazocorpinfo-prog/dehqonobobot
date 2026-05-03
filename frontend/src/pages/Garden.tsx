import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Garden() {
  const [g, setG] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    api.garden().then((r) => setG(r.garden));
    api.reports().then((r) => setReports(r.reports));
  }, []);

  if (!g) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-56" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  const treeEmoji = g.withered ? '🥀' : g.health >= 70 ? '🌳' : g.health >= 30 ? '🌿' : '🍂';
  const trees = Math.min(12, Math.max(1, g.trees));
  const maxPages = Math.max(1, ...reports.map((r) => r.pages_read ?? 0));

  return (
    <div className="space-y-4">
      {/* Garden hero */}
      <section className="relative overflow-hidden rounded-3xl shadow-card border border-emerald-100/70">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/40 via-emerald-100/40 to-emerald-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-emerald-200/70 to-transparent" aria-hidden />
        {/* Sun */}
        <div className="absolute top-3 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-gold-200 to-gold-400 shadow-gold" aria-hidden />

        <div className="relative px-5 pt-5 pb-4 text-center">
          <div className="eyebrow text-emerald-700">Mening raqamli bog'im</div>
          <div className="title mt-1">🌳 Hisobot bering — bog'ingiz gullaydi</div>

          <div className="my-5 leading-tight min-h-[72px] flex items-end justify-center flex-wrap gap-1">
            {Array.from({ length: trees }).map((_, i) => (
              <span
                key={i}
                className="text-4xl inline-block animate-sway"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {treeEmoji}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Daraxtlar" value={g.trees} icon="🌳" />
            <Stat label="Mevalar" value={g.fruits} icon="🍎" accent />
            <Stat label="Sog'lik" value={`${g.health}%`} icon="💚" />
          </div>

          {g.withered ? (
            <div className="mt-4 mx-auto max-w-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-3 py-2 text-sm">
              ⚠️ Bog'ingiz quriy boshladi — bugun hisobot bering, suvlanadi!
            </div>
          ) : (
            <div className="mt-4 text-xs text-emerald-700/90">
              Har kuni hisobot bering — daraxtlaringiz ko'karadi va meva beradi.
            </div>
          )}
        </div>
      </section>

      {/* Reports timeline */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="title">📅 Oxirgi 30 kun</h3>
          <span className="chip-emerald">{reports.length} kun</span>
        </div>
        {reports.length === 0 ? (
          <div className="subtitle text-center py-6">Hozircha hisobot yo'q.</div>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => {
              const pct = Math.round(((r.pages_read ?? 0) / maxPages) * 100);
              return (
                <div key={r.report_date} className="flex items-center gap-3">
                  <div className="text-[11px] text-emerald-600 w-20 shrink-0 font-medium">
                    {formatDate(r.report_date)}
                  </div>
                  <div className="flex-1 h-7 bg-emerald-50 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] font-bold text-emerald-900">
                      {r.pages_read} bet
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, icon, accent = false }: { label: string; value: any; icon: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl py-2.5 ${
        accent ? 'bg-gradient-gold text-white shadow-gold' : 'bg-white/80 text-emerald-900 border border-emerald-100'
      }`}
    >
      <div className="text-xl font-extrabold tracking-tight flex items-center justify-center gap-1">
        <span className="text-base">{icon}</span> {value}
      </div>
      <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${accent ? 'opacity-90' : 'text-emerald-600'}`}>
        {label}
      </div>
    </div>
  );
}

function formatDate(s: string) {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
}
