import { useState } from 'react';
import { api } from '../api';

type Tab = 'verse' | 'article' | 'announcement' | 'challenge';

export default function Content() {
  const [tab, setTab] = useState<Tab>('verse');

  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow">Mazmun va kontent</div>
        <h2 className="title">📝 Kontent boshqaruvi</h2>
      </div>

      <div className="bg-white border border-emerald-100/70 rounded-2xl p-1 grid grid-cols-2 md:grid-cols-4 gap-1 shadow-sm">
        <TabBtn active={tab === 'verse'} onClick={() => setTab('verse')}>
          📖 Oyat
        </TabBtn>
        <TabBtn active={tab === 'article'} onClick={() => setTab('article')}>
          📚 Maqola/Duo
        </TabBtn>
        <TabBtn active={tab === 'announcement'} onClick={() => setTab('announcement')}>
          📢 E'lon
        </TabBtn>
        <TabBtn active={tab === 'challenge'} onClick={() => setTab('challenge')}>
          🎯 Challenge
        </TabBtn>
      </div>

      {tab === 'verse' && <VerseForm />}
      {tab === 'article' && <ArticleForm />}
      {tab === 'announcement' && <AnnouncementForm />}
      {tab === 'challenge' && <ChallengeForm />}
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
      className={`py-2 text-sm font-semibold rounded-xl transition ${
        active
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft'
          : 'text-emerald-700 hover:bg-emerald-50'
      }`}
    >
      {children}
    </button>
  );
}

function Banner({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 text-sm animate-fade-up">
      {msg}
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

function VerseForm() {
  const [form, setForm] = useState({
    surahNumber: '',
    surahName: '',
    ayahNumber: '',
    arabic: '',
    uzbek: '',
    tafsir: '',
    scheduledFor: '',
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.admin.addVerse({
      surahNumber: Number(form.surahNumber),
      surahName: form.surahName,
      ayahNumber: Number(form.ayahNumber),
      arabic: form.arabic || undefined,
      uzbek: form.uzbek,
      tafsir: form.tafsir || undefined,
      scheduledFor: form.scheduledFor || undefined,
    });
    setMsg("✅ Oyat qo'shildi");
    setForm({ surahNumber: '', surahName: '', ayahNumber: '', arabic: '', uzbek: '', tafsir: '', scheduledFor: '' });
    setTimeout(() => setMsg(null), 2500);
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📖</span>
        <h3 className="font-bold text-emerald-900">Yangi oyat qo'shish</h3>
      </div>
      <Banner msg={msg} />
      <div className="grid grid-cols-3 gap-3">
        <Field label="Sura №">
          <input
            className="input"
            placeholder="2"
            required
            type="number"
            value={form.surahNumber}
            onChange={(e) => setForm({ ...form, surahNumber: e.target.value })}
          />
        </Field>
        <div className="col-span-2">
          <Field label="Sura nomi">
            <input
              className="input"
              placeholder="Al-Baqara"
              required
              value={form.surahName}
              onChange={(e) => setForm({ ...form, surahName: e.target.value })}
            />
          </Field>
        </div>
      </div>
      <Field label="Oyat raqami">
        <input
          className="input"
          required
          type="number"
          placeholder="286"
          value={form.ayahNumber}
          onChange={(e) => setForm({ ...form, ayahNumber: e.target.value })}
        />
      </Field>
      <Field label="Arab matni" hint="ixtiyoriy">
        <input
          className="input arabic text-right"
          placeholder="آية"
          value={form.arabic}
          onChange={(e) => setForm({ ...form, arabic: e.target.value })}
        />
      </Field>
      <Field label="O'zbek tarjimasi">
        <textarea
          className="input"
          rows={3}
          required
          value={form.uzbek}
          onChange={(e) => setForm({ ...form, uzbek: e.target.value })}
        />
      </Field>
      <Field label="Tafsir" hint="ixtiyoriy">
        <textarea
          className="input"
          rows={2}
          value={form.tafsir}
          onChange={(e) => setForm({ ...form, tafsir: e.target.value })}
        />
      </Field>
      <Field label="Rejalashtirilgan sana" hint="bo'sh qoldirilsa - tasodifiy">
        <input
          className="input"
          type="date"
          value={form.scheduledFor}
          onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
        />
      </Field>
      <button className="btn-primary w-full">Saqlash</button>
    </form>
  );
}

function ArticleForm() {
  const [form, setForm] = useState({ title: '', body: '', category: 'article' });
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.admin.addArticle(form);
    setMsg("✅ Qo'shildi");
    setForm({ title: '', body: '', category: 'article' });
    setTimeout(() => setMsg(null), 2500);
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📚</span>
        <h3 className="font-bold text-emerald-900">Maqola yoki duo qo'shish</h3>
      </div>
      <Banner msg={msg} />
      <Field label="Kategoriya">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: 'article', label: '📄 Maqola' },
            { v: 'dua', label: '🤲 Duo' },
          ].map((o) => (
            <button
              type="button"
              key={o.v}
              onClick={() => setForm({ ...form, category: o.v })}
              className={`py-2.5 rounded-xl font-semibold transition ${
                form.category === o.v
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Sarlavha">
        <input
          className="input"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Ertalabki duolar"
        />
      </Field>
      <Field label="Matn">
        <textarea
          className="input"
          rows={6}
          required
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </Field>
      <button className="btn-primary w-full">Saqlash</button>
    </form>
  );
}

function AnnouncementForm() {
  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'general',
    cardNumber: '',
    cardHolder: '',
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.admin.addAnnouncement(form);
    setMsg("✅ E'lon qo'shildi");
    setForm({ title: '', body: '', category: 'general', cardNumber: '', cardHolder: '' });
    setTimeout(() => setMsg(null), 2500);
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📢</span>
        <h3 className="font-bold text-emerald-900">E'lon qo'shish</h3>
      </div>
      <Banner msg={msg} />
      <Field label="Kategoriya">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: 'general', label: '📢 Umumiy' },
            { v: 'event', label: '📅 Tadbir' },
            { v: 'charity', label: '🤲 Xayriya' },
            { v: 'imam', label: '🕌 Imom uchun' },
          ].map((o) => (
            <button
              type="button"
              key={o.v}
              onClick={() => setForm({ ...form, category: o.v })}
              className={`py-2.5 rounded-xl font-semibold text-sm transition ${
                form.category === o.v
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Sarlavha">
        <input
          className="input"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </Field>
      <Field label="Matn">
        <textarea
          className="input"
          rows={5}
          required
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </Field>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3 space-y-3">
        <div className="text-xs font-semibold text-emerald-700">
          💳 Karta ma'lumotlari (xayriya uchun, ixtiyoriy)
        </div>
        <Field label="Karta raqami">
          <input
            className="input font-mono"
            placeholder="8600 1234 5678 9012"
            value={form.cardNumber}
            onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
          />
        </Field>
        <Field label="Karta egasi">
          <input
            className="input"
            placeholder="Ism Familiya"
            value={form.cardHolder}
            onChange={(e) => setForm({ ...form, cardHolder: e.target.value })}
          />
        </Field>
      </div>
      <button className="btn-primary w-full">Saqlash</button>
    </form>
  );
}

function ChallengeForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetCount: '',
    startsAt: '',
    endsAt: '',
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.admin.addChallenge({
      ...form,
      targetCount: Number(form.targetCount),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    });
    setMsg("✅ Challenge qo'shildi");
    setForm({ title: '', description: '', targetCount: '', startsAt: '', endsAt: '' });
    setTimeout(() => setMsg(null), 2500);
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        <h3 className="font-bold text-emerald-900">Yangi Challenge</h3>
      </div>
      <Banner msg={msg} />
      <Field label="Sarlavha">
        <input
          className="input"
          required
          placeholder="1 haftada 1 mln Istig'for"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </Field>
      <Field label="Tavsifi">
        <textarea
          className="input"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>
      <Field label="Maqsadli son" hint="masalan: 1000000">
        <input
          className="input"
          type="number"
          required
          value={form.targetCount}
          onChange={(e) => setForm({ ...form, targetCount: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Boshlanish">
          <input
            className="input"
            type="datetime-local"
            required
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
          />
        </Field>
        <Field label="Tugash">
          <input
            className="input"
            type="datetime-local"
            required
            value={form.endsAt}
            onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
          />
        </Field>
      </div>
      <button className="btn-primary w-full">Saqlash</button>
    </form>
  );
}
