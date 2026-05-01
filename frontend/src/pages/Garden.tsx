import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Garden() {
  const [g, setG] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    api.garden().then((r) => setG(r.garden));
    api.reports().then((r) => setReports(r.reports));
  }, []);

  if (!g) return <div className="subtitle">Yuklanyapti...</div>;

  const treeEmoji = g.withered ? '🥀' : g.health >= 70 ? '🌳' : g.health >= 30 ? '🌿' : '🍂';
  const trees = Math.min(12, Math.max(1, g.trees));

  return (
    <div className="space-y-4">
      <section className="card text-center bg-gradient-to-b from-emerald-100 to-emerald-50">
        <div className="title">🌳 Mening raqamli bog'im</div>
        <div className="text-5xl my-4 leading-tight">
          {Array.from({ length: trees }).map((_, i) => (
            <span key={i} className="inline-block animate-bounce" style={{ animationDelay: `${i * 0.08}s` }}>
              {treeEmoji}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Daraxtlar" value={g.trees} />
          <Stat label="Mevalar 🍎" value={g.fruits} />
          <Stat label="Sog'lik" value={`${g.health}%`} />
        </div>
        {g.withered ? (
          <div className="text-sm text-amber-700 mt-3">⚠️ Bog'ingiz qurib qoldi - hisobot bering, suvlanadi!</div>
        ) : (
          <div className="text-xs text-emerald-700 mt-3">
            Har kuni hisobot bering - daraxtlaringiz ko'karadi va meva beradi.
          </div>
        )}
      </section>

      <section className="card">
        <h3 className="title mb-2">📅 Oxirgi 30 kun</h3>
        {reports.length === 0 ? (
          <div className="subtitle">Hozircha hisobot yo'q.</div>
        ) : (
          <div className="space-y-1">
            {reports.map((r) => (
              <div key={r.report_date} className="flex justify-between text-sm">
                <span className="text-emerald-800">{r.report_date}</span>
                <span className="font-semibold text-emerald-700">{r.pages_read} bet</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-xl py-2">
      <div className="text-xl font-bold text-emerald-700">{value}</div>
      <div className="text-xs text-emerald-600">{label}</div>
    </div>
  );
}
