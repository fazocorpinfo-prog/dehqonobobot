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

  async function load() {
    const [t, v] = await Promise.all([api.activeTask(), api.verseOfDay()]);
    setTask(t.task);
    setVerse(v.verse);
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
  const remaining = task ? total - task.pages_done : 0;
  const progress = task && total > 0 ? Math.round((task.pages_done / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Bugungi vazifa */}
      <section className="card">
        <h2 className="title mb-2">📚 Bugungi vazifangiz</h2>
        {task ? (
          <>
            <div className="text-emerald-800 font-semibold">{task.label}</div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <Stat label="Jami" value={`${total}`} />
              <Stat label="O'qigan" value={`${task.pages_done}`} />
              <Stat label="Qolgan" value={`${remaining}`} />
            </div>
            <div className="mt-3">
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-emerald-600 mt-1">{progress}%</div>
            </div>
          </>
        ) : (
          <div className="subtitle">Hozircha vazifa yo'q. Admin yangi xatm boshlasa, sizga vazifa beriladi.</div>
        )}
      </section>

      {/* Bugungi oyat */}
      {verse && (
        <section className="card bg-gradient-to-br from-emerald-50 to-white">
          <div className="text-xs text-emerald-600 font-semibold">📖 Bugungi oyat</div>
          {verse.arabic && <div className="text-right text-lg my-2 leading-loose">{verse.arabic}</div>}
          <div className="text-emerald-900">{verse.uzbek}</div>
          <div className="text-xs text-emerald-600 mt-1">
            {verse.surah_name} {verse.surah_number}:{verse.ayah_number}
          </div>
          {verse.tafsir && <div className="mt-2 text-sm text-emerald-700 italic">{verse.tafsir}</div>}
        </section>
      )}

      {/* Hisobot */}
      {task && (
        <section className="card">
          <h2 className="title mb-2">📊 Bugungi hisobot</h2>
          <div className="flex gap-2">
            <input
              className="input"
              type="number"
              min={0}
              max={200}
              placeholder="Bugun nechta bet o'qidingiz?"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
            />
            <button className="btn-primary" disabled={submitting || pagesInput === ''} onClick={submitReport}>
              Yuborish
            </button>
          </div>
          {message && <div className="text-sm text-emerald-700 mt-2">{message}</div>}
        </section>
      )}

      {/* SOS */}
      {task && (
        <section className="card border-amber-200 bg-amber-50">
          <h2 className="text-lg font-bold text-amber-900">🆘 Qiynalyapsizmi?</h2>
          <p className="text-sm text-amber-800 mt-1">
            Vazifani kamaytirsangiz, qolgan betlar boshqa o'quvchilarga zaxiraga yuboriladi.
          </p>
          {!sosOpen ? (
            <button className="btn-ghost mt-3" onClick={() => setSosOpen(true)}>
              Vazifani kamaytirish
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[5, 10, 15, 20].map((n) => (
                <button key={n} className="btn-ghost" onClick={() => sos(n)}>
                  -{n} bet
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-emerald-50 rounded-xl py-2">
      <div className="text-xl font-bold text-emerald-700">{value}</div>
      <div className="text-xs text-emerald-600">{label}</div>
    </div>
  );
}
