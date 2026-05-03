import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Khatms() {
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('Yangi xatm');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [totalPages, setTotalPages] = useState(604);
  const [msg, setMsg] = useState<string | null>(null);
  const [awardingId, setAwardingId] = useState<number | null>(null);
  const [topPreview, setTopPreview] = useState<{ khatmId: number; rows: any[] } | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    const r = await api.admin.khatms();
    setList(r.khatms);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!startsAt || !endsAt) return;
    await api.admin.createKhatm({
      title,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      totalPages,
    });
    setMsg('✅ Xatm yaratildi');
    setOpen(false);
    setTimeout(() => setMsg(null), 2500);
    await load();
  }

  async function preview(khatmId: number) {
    const r = await api.admin.previewTop(khatmId, 10);
    setTopPreview({ khatmId, rows: r.top });
  }

  async function award(khatmId: number) {
    if (!confirm("Top-10 foydalanuvchilarga sertifikat berilsinmi? (takroriy berilmaydi)")) return;
    setAwardingId(khatmId);
    try {
      const r = await api.admin.awardCertificates(khatmId, 10);
      setMsg(`✅ ${r.awarded} ta sertifikat berildi`);
      setTimeout(() => setMsg(null), 3000);
    } catch (e: any) {
      setMsg('Xato: ' + (e?.message ?? ''));
    } finally {
      setAwardingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Xatmlarni boshqarish</div>
          <h2 className="title">📖 Xatmlar</h2>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`btn-primary ${open ? '!bg-emerald-700' : ''}`}
        >
          {open ? '✕ Yopish' : '+ Yangi xatm'}
        </button>
      </div>

      {msg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 text-sm animate-fade-up">
          {msg}
        </div>
      )}

      {open && (
        <form onSubmit={create} className="card space-y-3 animate-fade-up">
          <h3 className="font-bold text-emerald-900">Yangi xatm boshlash</h3>
          <Field label="Sarlavha">
            <input
              className="input"
              placeholder="Masalan: Ramazon · 2-hafta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Boshlanish">
              <input
                className="input"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </Field>
            <Field label="Tugash">
              <input
                className="input"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="Jami betlar" hint="Madina mushafida 604">
            <input
              className="input"
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(Number(e.target.value))}
            />
          </Field>
          <button className="btn-primary w-full">Xatmni boshlash</button>
        </form>
      )}

      <section className="space-y-3">
        {list.length === 0 && (
          <div className="card text-center py-8 text-emerald-600/80">
            Hozircha xatmlar yo'q. Yangi xatmni yarating.
          </div>
        )}
        {list.map((k) => (
          <article key={k.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-emerald-950 truncate">{k.title}</h3>
                  <StatusChip status={k.status} />
                </div>
                <div className="text-[12px] text-emerald-600 mt-1">
                  {fmt(k.starts_at)} → {fmt(k.ends_at)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => preview(k.id)} className="btn-soft">
                👁 Top-10
              </button>
              <button
                onClick={() => award(k.id)}
                disabled={awardingId === k.id}
                className="btn-gold py-2 px-3 text-[13px] disabled:opacity-50"
              >
                {awardingId === k.id ? 'Berilmoqda...' : '🏆 Sertifikat berish'}
              </button>
            </div>
          </article>
        ))}
      </section>

      {topPreview && (
        <section className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-emerald-900">
              👁 Top-10 (Khatm #{topPreview.khatmId})
            </h3>
            <button
              onClick={() => setTopPreview(null)}
              className="text-xs text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-50"
            >
              ✕ Yopish
            </button>
          </div>
          {topPreview.rows.length === 0 ? (
            <div className="subtitle text-center py-5">Hozircha hisobotlar yo'q.</div>
          ) : (
            <ol className="space-y-1.5">
              {topPreview.rows.map((u, i) => (
                <li
                  key={u.id}
                  className={`flex justify-between items-center px-3 py-2 rounded-xl ${
                    i === 0
                      ? 'bg-gradient-to-r from-gold-100 to-amber-50 border border-gold-200'
                      : i < 3
                      ? 'bg-emerald-100/50 border border-emerald-200'
                      : 'bg-emerald-50'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium text-emerald-900">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                        i === 0
                          ? 'bg-gold-400 text-white'
                          : i === 1
                          ? 'bg-slate-300 text-white'
                          : i === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {u.first_name} {u.last_name ?? ''}
                  </span>
                  <span className="text-emerald-700 font-bold text-sm">{u.total} bet</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="label">{label}</span>
        {hint && <span className="text-[11px] text-emerald-600/70">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'chip-emerald',
    completed: 'chip-gold',
    planned: 'chip bg-slate-100 text-slate-700',
    cancelled: 'chip-rose',
  };
  const labels: Record<string, string> = {
    active: 'Aktiv',
    completed: 'Yakunlangan',
    planned: 'Rejalashtirilgan',
    cancelled: 'Bekor',
  };
  return <span className={map[status] ?? 'chip-emerald'}>{labels[status] ?? status}</span>;
}

function fmt(s: string) {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
}
