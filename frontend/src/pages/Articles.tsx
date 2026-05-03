import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Articles() {
  const [tab, setTab] = useState<'article' | 'dua'>('article');
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.articles(tab).then((r) => setItems(r.articles));
  }, [tab]);

  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow">Bilim manbalari</div>
        <h2 className="title">📚 Maqola va duolar</h2>
      </div>

      <div className="bg-white border border-emerald-100/70 rounded-2xl p-1 flex gap-1 shadow-sm">
        <TabBtn active={tab === 'article'} onClick={() => setTab('article')}>
          📄 Maqolalar
        </TabBtn>
        <TabBtn active={tab === 'dua'} onClick={() => setTab('dua')}>
          🤲 Duolar
        </TabBtn>
      </div>

      {items.length === 0 && (
        <div className="card text-center py-8 text-emerald-600/80">
          Hozircha {tab === 'dua' ? 'duo' : 'maqola'} mavjud emas.
        </div>
      )}

      {items.map((a) => (
        <article key={a.id} className="card">
          <h3 className="text-base font-bold text-emerald-950">{a.title}</h3>
          <p className="text-[14px] mt-2 whitespace-pre-line text-emerald-800/90 leading-relaxed">
            {a.body}
          </p>
        </article>
      ))}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${
        active
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft'
          : 'text-emerald-700 hover:bg-emerald-50'
      }`}
    >
      {children}
    </button>
  );
}
