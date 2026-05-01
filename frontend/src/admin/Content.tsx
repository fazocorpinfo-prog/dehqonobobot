import { useState } from 'react';
import { api } from '../api';

export default function Content() {
  return (
    <div className="space-y-4">
      <h2 className="title">📝 Kontent boshqaruvi</h2>
      <VerseForm />
      <ArticleForm />
      <AnnouncementForm />
      <ChallengeForm />
    </div>
  );
}

function VerseForm() {
  const [form, setForm] = useState({ surahNumber: '', surahName: '', ayahNumber: '', arabic: '', uzbek: '', tafsir: '', scheduledFor: '' });
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
    setMsg('✅ Oyat qo\'shildi');
    setForm({ surahNumber: '', surahName: '', ayahNumber: '', arabic: '', uzbek: '', tafsir: '', scheduledFor: '' });
    setTimeout(() => setMsg(null), 2000);
  }
  return (
    <form onSubmit={submit} className="card space-y-2">
      <h3 className="font-semibold">📖 Yangi oyat qo'shish</h3>
      <div className="grid grid-cols-3 gap-2">
        <input className="input" placeholder="Sura raqami" required type="number" value={form.surahNumber} onChange={(e) => setForm({ ...form, surahNumber: e.target.value })} />
        <input className="input col-span-2" placeholder="Sura nomi (Al-Baqara)" required value={form.surahName} onChange={(e) => setForm({ ...form, surahName: e.target.value })} />
      </div>
      <input className="input" placeholder="Oyat raqami" required type="number" value={form.ayahNumber} onChange={(e) => setForm({ ...form, ayahNumber: e.target.value })} />
      <input className="input" placeholder="Arab matni (ixtiyoriy)" value={form.arabic} onChange={(e) => setForm({ ...form, arabic: e.target.value })} />
      <textarea className="input" placeholder="O'zbek tarjimasi" required value={form.uzbek} onChange={(e) => setForm({ ...form, uzbek: e.target.value })} />
      <textarea className="input" placeholder="Tafsir (ixtiyoriy)" value={form.tafsir} onChange={(e) => setForm({ ...form, tafsir: e.target.value })} />
      <div>
        <label className="text-xs text-emerald-700">Rejalashtirilgan sana (ixtiyoriy)</label>
        <input className="input" type="date" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} />
      </div>
      <button className="btn-primary w-full">Qo'shish</button>
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
    </form>
  );
}

function ArticleForm() {
  const [form, setForm] = useState({ title: '', body: '', category: 'article' });
  const [msg, setMsg] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.admin.addArticle(form);
    setMsg('✅ Qo\'shildi');
    setForm({ title: '', body: '', category: 'article' });
    setTimeout(() => setMsg(null), 2000);
  }
  return (
    <form onSubmit={submit} className="card space-y-2">
      <h3 className="font-semibold">📚 Maqola/Duo qo'shish</h3>
      <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        <option value="article">Maqola</option>
        <option value="dua">Duo</option>
      </select>
      <input className="input" placeholder="Sarlavha" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="input" rows={5} placeholder="Matn" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      <button className="btn-primary w-full">Qo'shish</button>
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
    </form>
  );
}

function AnnouncementForm() {
  const [form, setForm] = useState({ title: '', body: '', category: 'general', cardNumber: '', cardHolder: '' });
  const [msg, setMsg] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.admin.addAnnouncement(form);
    setMsg('✅ E\'lon qo\'shildi');
    setForm({ title: '', body: '', category: 'general', cardNumber: '', cardHolder: '' });
    setTimeout(() => setMsg(null), 2000);
  }
  return (
    <form onSubmit={submit} className="card space-y-2">
      <h3 className="font-semibold">📢 E'lon qo'shish</h3>
      <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        <option value="general">Umumiy</option>
        <option value="charity">Xayriya</option>
        <option value="imam">Imom uchun ehson</option>
        <option value="event">Tadbir</option>
      </select>
      <input className="input" placeholder="Sarlavha" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="input" rows={4} placeholder="Matn" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      <input className="input" placeholder="Karta raqami (ixtiyoriy)" value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} />
      <input className="input" placeholder="Karta egasi" value={form.cardHolder} onChange={(e) => setForm({ ...form, cardHolder: e.target.value })} />
      <button className="btn-primary w-full">Qo'shish</button>
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
    </form>
  );
}

function ChallengeForm() {
  const [form, setForm] = useState({ title: '', description: '', targetCount: '', startsAt: '', endsAt: '' });
  const [msg, setMsg] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.admin.addChallenge({
      ...form,
      targetCount: Number(form.targetCount),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    });
    setMsg('✅ Challenge qo\'shildi');
    setForm({ title: '', description: '', targetCount: '', startsAt: '', endsAt: '' });
    setTimeout(() => setMsg(null), 2000);
  }
  return (
    <form onSubmit={submit} className="card space-y-2">
      <h3 className="font-semibold">🎯 Challenge qo'shish</h3>
      <input className="input" placeholder="Sarlavha" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="input" placeholder="Tavsifi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input className="input" placeholder="Maqsadli son (masalan: 1000000)" type="number" required value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <input className="input" type="datetime-local" required value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
        <input className="input" type="datetime-local" required value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
      </div>
      <button className="btn-primary w-full">Qo'shish</button>
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
    </form>
  );
}
