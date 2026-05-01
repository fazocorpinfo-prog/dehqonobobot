import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Announcements() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.announcements().then((r) => setItems(r.announcements));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="title">📢 E'lonlar peshtaxtasi</h2>
      {items.length === 0 && <div className="subtitle">Hozircha e'lon yo'q.</div>}
      {items.map((a) => (
        <article key={a.id} className="card">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wide text-emerald-600">{categoryLabel(a.category)}</span>
            <span className="text-xs text-emerald-500">{a.created_at?.slice(0, 10)}</span>
          </div>
          <h3 className="font-bold text-emerald-900">{a.title}</h3>
          <p className="text-sm mt-1 whitespace-pre-line text-emerald-800">{a.body}</p>
          {a.card_number && (
            <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div className="text-xs text-emerald-600">💳 Karta raqami</div>
              <div className="font-mono font-bold tracking-wider">{a.card_number}</div>
              {a.card_holder && <div className="text-xs text-emerald-700">{a.card_holder}</div>}
              <div className="text-[10px] text-emerald-500 mt-1">
                Faqat ma'lumot uchun - to'lov tizimi ulanmagan.
              </div>
            </div>
          )}
        </article>
      ))}

      <footer className="text-center mt-8 py-4 border-t border-emerald-100">
        <div className="text-xs text-emerald-600">Loyiha ishlab chiquvchisi:</div>
        <div className="font-bold text-emerald-800">Fazo Firmasi</div>
        <div className="text-xs text-emerald-600 mt-1">
          <a href="https://t.me/fazocorp" className="underline">Telegram</a> ·{' '}
          <a href="#" className="underline">Veb-sayt</a>
        </div>
      </footer>
    </div>
  );
}

function categoryLabel(c: string) {
  switch (c) {
    case 'charity': return '🤲 Xayriya';
    case 'imam': return '🕌 Imom uchun ehson';
    case 'event': return '📅 Tadbir';
    default: return '📢 E\'lon';
  }
}
