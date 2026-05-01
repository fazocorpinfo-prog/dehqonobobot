import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Articles() {
  const [tab, setTab] = useState<'article' | 'dua'>('article');
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api.articles(tab).then((r) => setItems(r.articles)); }, [tab]);

  return (
    <div className="space-y-4">
      <h2 className="title">📚 Maqola va duolar</h2>
      <div className="flex gap-2">
        <button className={`flex-1 py-2 rounded-xl ${tab === 'article' ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-200'}`} onClick={() => setTab('article')}>
          Maqolalar
        </button>
        <button className={`flex-1 py-2 rounded-xl ${tab === 'dua' ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-200'}`} onClick={() => setTab('dua')}>
          Duolar
        </button>
      </div>
      {items.length === 0 && <div className="subtitle">Hozircha yozuvlar yo'q.</div>}
      {items.map((a) => (
        <article key={a.id} className="card">
          <h3 className="font-bold text-emerald-900">{a.title}</h3>
          <p className="text-sm mt-1 whitespace-pre-line text-emerald-800">{a.body}</p>
        </article>
      ))}
    </div>
  );
}
