import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Announcements() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.announcements().then((r) => setItems(r.announcements));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow">Yangiliklar</div>
        <h2 className="title">📢 E'lonlar peshtaxtasi</h2>
      </div>

      {items.length === 0 && (
        <div className="card text-center py-8 text-emerald-600/80">
          Hozircha e'lon yo'q. Yangi xabarlar shu yerda paydo bo'ladi.
        </div>
      )}

      {items.map((a) => {
        const cat = categoryMeta(a.category);
        return (
          <article key={a.id} className="card overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className={`chip ${cat.chip}`}>{cat.icon} {cat.label}</span>
              <span className="text-[11px] text-emerald-500">{a.created_at?.slice(0, 10)}</span>
            </div>
            <h3 className="text-base font-bold text-emerald-950">{a.title}</h3>
            <p className="text-[14px] mt-1.5 whitespace-pre-line text-emerald-800/90 leading-relaxed">
              {a.body}
            </p>
            {a.card_number && (
              <div className="mt-4 rounded-2xl p-4 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-soft relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gold-400/30 blur-2xl" aria-hidden />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
                <div className="relative flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-widest text-emerald-100/80">
                    💳 Karta raqami
                  </div>
                  <button
                    onClick={() => copy(a.card_number)}
                    className="text-[11px] bg-white/15 hover:bg-white/25 px-2 py-1 rounded-full"
                  >
                    Nusxa
                  </button>
                </div>
                <div className="relative font-mono font-bold tracking-[0.2em] text-lg mt-2">
                  {formatCard(a.card_number)}
                </div>
                {a.card_holder && (
                  <div className="relative text-[12px] text-emerald-100/90 mt-1.5">
                    {a.card_holder}
                  </div>
                )}
                <div className="relative text-[10px] text-emerald-100/60 mt-2">
                  Faqat ma'lumot uchun — to'lov tizimi ulanmagan.
                </div>
              </div>
            )}
          </article>
        );
      })}

      <footer className="text-center mt-6 py-4 border-t border-emerald-100/70">
        <div className="text-[11px] text-emerald-600/80">Loyiha ishlab chiquvchisi</div>
        <div className="font-bold text-emerald-800 mt-0.5">✦ Fazo Firmasi ✦</div>
        <div className="text-[11px] text-emerald-600 mt-1">
          <a href="https://t.me/fazocorp" className="underline hover:text-emerald-800">
            Telegram
          </a>{' '}
          ·{' '}
          <a href="#" className="underline hover:text-emerald-800">
            Veb-sayt
          </a>
        </div>
      </footer>
    </div>
  );
}

function categoryMeta(c: string) {
  switch (c) {
    case 'charity':
      return { label: 'Xayriya', icon: '🤲', chip: 'chip-gold' };
    case 'imam':
      return { label: "Imom uchun ehson", icon: '🕌', chip: 'chip-gold' };
    case 'event':
      return { label: 'Tadbir', icon: '📅', chip: 'chip-emerald' };
    default:
      return { label: "E'lon", icon: '📢', chip: 'chip-emerald' };
  }
}

function formatCard(n: string) {
  return String(n).replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(String(text).replace(/\s+/g, ''));
  } catch {
    /* noop */
  }
}
