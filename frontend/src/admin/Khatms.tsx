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

  async function load() {
    const r = await api.admin.khatms();
    setList(r.khatms);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!startsAt || !endsAt) return;
    await api.admin.createKhatm({ title, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), totalPages });
    setMsg('Xatm yaratildi');
    setTimeout(() => setMsg(null), 2000);
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
    <div className="space-y-4">
      <h2 className="title">📖 Xatmlar</h2>

      <form onSubmit={create} className="card space-y-3">
        <h3 className="font-semibold">Yangi xatm boshlash</h3>
        <input className="input" placeholder="Sarlavha" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-emerald-700">Boshlanish</label>
            <input className="input" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-emerald-700">Tugash</label>
            <input className="input" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="text-xs text-emerald-700">Jami betlar</label>
          <input className="input" type="number" value={totalPages} onChange={(e) => setTotalPages(Number(e.target.value))} />
        </div>
        <button className="btn-primary w-full">Xatmni boshlash</button>
        {msg && <div className="text-sm text-emerald-700">{msg}</div>}
      </form>

      <section className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Nomi</th>
              <th className="px-3 py-2 text-left">Boshlanish</th>
              <th className="px-3 py-2 text-left">Tugash</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Sertifikat</th>
            </tr>
          </thead>
          <tbody>
            {list.map((k) => (
              <tr key={k.id} className="even:bg-emerald-50">
                <td className="px-3 py-2 font-medium">{k.title}</td>
                <td className="px-3 py-2 text-xs">{new Date(k.starts_at).toLocaleString()}</td>
                <td className="px-3 py-2 text-xs">{new Date(k.ends_at).toLocaleString()}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    k.status === 'active' ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-700'
                  }`}>{k.status}</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => preview(k.id)}
                      className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded"
                    >
                      👁 Top-10
                    </button>
                    <button
                      onClick={() => award(k.id)}
                      disabled={awardingId === k.id}
                      className="text-xs bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-2 py-1 rounded"
                    >
                      {awardingId === k.id ? '...' : '🏆 Berish'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {topPreview && (
        <section className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              👁 Top-10 (Khatm #{topPreview.khatmId})
            </h3>
            <button
              onClick={() => setTopPreview(null)}
              className="text-xs text-emerald-600 hover:text-emerald-800"
            >
              ✕ Yopish
            </button>
          </div>
          {topPreview.rows.length === 0 ? (
            <div className="subtitle mt-2">Hozircha hisobotlar yo'q.</div>
          ) : (
            <ol className="mt-3 space-y-1">
              {topPreview.rows.map((u, i) => (
                <li
                  key={u.id}
                  className="flex justify-between items-center px-3 py-1.5 bg-emerald-50 rounded"
                >
                  <span className="font-medium">
                    {i + 1}. {u.first_name} {u.last_name ?? ''}
                  </span>
                  <span className="text-emerald-700 font-bold text-sm">
                    {u.total} bet
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
