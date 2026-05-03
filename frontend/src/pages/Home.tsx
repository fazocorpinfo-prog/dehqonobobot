import { useEffect, useState } from 'react';
import { api } from '../api';
import { haptic } from '../telegram';

export default function Home() {
  const [task, setTask] = useState<any>(null);
  const [verse, setVerse] = useState<any>(null);
  const [pagesInput, setPagesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [t, v] = await Promise.all([api.activeTask(), api.verseOfDay()]);
      setTask(t.task);
      setVerse(v.verse);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitReport() {
    const p = Number(pagesInput);
    if (!Number.isFinite(p) || p < 0) return;
    setSubmitting(true);
    try {
      await api.submitReport(p);
      haptic('medium');
      setMessage(`✅ Bugun ${p} bet o'qiganingiz qayd etildi.`);
      setPagesInput('');
      await load();
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  async function sos(pages: number) {
    await api.sos(pages);
    haptic('heavy');
    setSosOpen(false);
    setMessage(`Vazifa ${pages} betga kamaytirildi.`);
    await load();
    setTimeout(() => setMessage(null), 3000);
  }

  const total = task ? task.end_page - task.start_page + 1 : 0;
  const remaining = task ? Math.max(0, total - task.pages_done) : 0;
  const progress = task && total > 0 ? Math.min(100, Math.round((task.pages_done / total) * 100)) : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-44" />
        <div className="skeleton h-32" />
        <div className="skeleton h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bugungi vazifa - HERO CARD */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero text-white p-5 shadow-card">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold-400/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="eyebrow text-emerald-100/80">Bugungi vazifa</div>
            {task ? (
              <>
                <h2 className="text-xl font-extrabold tracking-tight mt-0.5 text-white">
                  {task.label}
                </h2>
                <p className="text-[12px] text-emerald-100/80 mt-1">
                  {task.start_page}–{task.end_page} betlar · jami {total} bet
                </p>
              </>
            ) : (
              <h2 className="text-lg font-bold mt-0.5">Hozircha vazifa yo'q</h2>
            )}
          </div>

          {task && <ProgressRing progress={progress} />}
        </div>

        {task ? (
          <>
            <div className="relative grid grid-cols-3 gap-2 mt-5">
              <HeroStat label="Jami" value={total} />
              <HeroStat label="O'qigan" value={task.pages_done} accent />
              <HeroStat label="Qolgan" value={remaining} />
            </div>
            <div className="relative mt-4">
              <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-300 to-gold-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="relative text-emerald-100/85 text-sm mt-3">
            Admin yangi xatm boshlasa, sizga vazifa avtomatik beriladi. Tayyor turing!
          </p>
        )}
      </section>

      {/* Hisobot */}
      {task && (
        <section className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="title">📝 Bugungi hisobot</h2>
            <span className="chip-emerald">avtomatik qayd</span>
          </div>
          <div className="flex gap-2">
            <input
              className="input"
              type="number"
              min={0}
              max={200}
              inputMode="numeric"
              placeholder="Necha bet o'qidingiz?"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
            />
            <button
              className="btn-primary whitespace-nowrap"
              disabled={submitting || pagesInput === ''}
              onClick={submitReport}
            >
              {submitting ? '...' : 'Yuborish'}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setPagesInput(String(n))}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl py-2 text-sm font-semibold transition active:scale-95"
              >
                {n} bet
              </button>
            ))}
          </div>
          {message && (
            <div className="mt-3 bg-emerald-50 text-emerald-800 text-sm rounded-xl px-3 py-2 animate-fade-up">
              {message}
            </div>
          )}
        </section>
      )}

      {/* Bugungi oyat */}
      {verse && (
        <section className="relative overflow-hidden card bg-gradient-to-br from-emerald-50 via-white to-gold-50/40">
          <div className="absolute top-3 right-3 text-emerald-200/50 text-5xl select-none" aria-hidden>
            ❝
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="chip-gold">📖 Bugungi oyat</span>
            <span className="text-[11px] text-emerald-600/80">
              {verse.surah_name} {verse.surah_number}:{verse.ayah_number}
            </span>
          </div>
          {verse.arabic && (
            <p className="arabic text-right text-2xl text-emerald-900 my-3 leading-loose">
              {verse.arabic}
            </p>
          )}
          <p className="text-emerald-900 leading-relaxed">{verse.uzbek}</p>
          {verse.tafsir && (
            <div className="mt-3 text-[13px] text-emerald-700 italic border-l-2 border-gold-300 pl-3">
              {verse.tafsir}
            </div>
          )}
        </section>
      )}

      {/* SOS */}
      {task && (
        <section className="card border-amber-200 bg-gradient-to-br from-amber-50 to-rose-50/60">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🆘</div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-amber-900">Qiynalyapsizmi?</h2>
              <p className="text-[13px] text-amber-800/90 mt-1">
                Vazifani kamaytirsangiz, qolgan betlar boshqa o'quvchilarga zaxiraga yuboriladi.
                Bu uyat emas — birodarlik.
              </p>
            </div>
          </div>
          {!sosOpen ? (
            <button
              className="mt-3 w-full bg-white text-amber-800 border border-amber-200 hover:bg-amber-50 px-4 py-2.5 rounded-2xl font-medium transition active:scale-[0.98]"
              onClick={() => setSosOpen(true)}
            >
              Vazifani kamaytirish
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  className="bg-white text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-xl py-2.5 font-semibold transition active:scale-95"
                  onClick={() => sos(n)}
                >
                  −{n}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function HeroStat({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl py-2.5 text-center backdrop-blur ${
        accent
          ? 'bg-gradient-gold text-white shadow-gold'
          : 'bg-white/12 text-white ring-1 ring-white/15'
      }`}
    >
      <div className="text-xl font-extrabold tracking-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  return (
    <div
      className="ring-bg w-20 h-20 rounded-full flex items-center justify-center shrink-0"
      style={{ ['--p' as any]: `${progress}%` }}
    >
      <div className="w-[60px] h-[60px] rounded-full bg-emerald-900/90 backdrop-blur flex items-center justify-center text-white">
        <div className="text-center leading-none">
          <div className="text-lg font-extrabold">{progress}</div>
          <div className="text-[9px] opacity-70">%</div>
        </div>
      </div>
    </div>
  );
}
