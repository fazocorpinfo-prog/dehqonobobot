import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Khatms() {
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('Yangi xatm');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [totalPages, setTotalPages] = useState(604);
  const [msg, setMsg] = useState<string | null>(null);

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
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
