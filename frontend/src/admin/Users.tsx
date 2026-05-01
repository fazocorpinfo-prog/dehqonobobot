import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'silent' | 'frozen' | 'blocked'>('all');

  async function load() {
    const r = await api.admin.users();
    setUsers(r.users);
  }
  useEffect(() => { load(); }, []);

  const visible = users.filter((u) => {
    if (filter === 'silent') return u.needs_call;
    if (filter === 'frozen') return u.status === 'frozen';
    if (filter === 'blocked') return u.status === 'blocked';
    return true;
  });

  async function setStatus(id: number, status: string) {
    await api.admin.setUserStatus(id, status);
    await load();
  }

  async function freezeWeek(id: number) {
    const until = new Date();
    until.setDate(until.getDate() + 7);
    await api.admin.setUserStatus(id, 'frozen', until.toISOString());
    await load();
  }

  async function reassign(taskId: number) {
    await api.admin.reassignTask(taskId);
    await load();
  }

  function downloadCSV() {
    const calls = users.filter((u) => u.needs_call);
    const csv = ['Ism,Familiya,Telefon,Kunlar jim'].concat(
      calls.map((u) => `${u.first_name},${u.last_name ?? ''},${u.phone ?? ''},${u.days_silent}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'qongiroq-royxati.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h2 className="title">👥 Foydalanuvchilar</h2>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'silent', 'frozen', 'blocked'] as const).map((f) => (
          <button
            key={f}
            className={`px-3 py-1.5 rounded-xl text-sm ${filter === f ? 'bg-emerald-700 text-white' : 'bg-white border border-emerald-200'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Hammasi' : f === 'silent' ? 'Qiynalayotganlar' : f === 'frozen' ? 'Muzlatilgan' : 'Bloklangan'}
          </button>
        ))}
        <button className="btn-ghost ml-auto" onClick={downloadCSV}>
          📥 Qo'ng'iroq ro'yxati (CSV)
        </button>
      </div>

      <section className="card p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="px-2 py-2 text-left">Ism</th>
              <th className="px-2 py-2">Yosh</th>
              <th className="px-2 py-2">Vazifa</th>
              <th className="px-2 py-2">Jim kunlar</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.id} className={`even:bg-emerald-50 ${u.needs_call ? 'bg-amber-50' : ''}`}>
                <td className="px-2 py-2">
                  <div className="font-medium">{u.first_name} {u.last_name ?? ''}</div>
                  {u.phone && <div className="text-xs text-emerald-600">{u.phone}</div>}
                </td>
                <td className="px-2 py-2 text-center">{u.age ?? '-'}</td>
                <td className="px-2 py-2 text-xs text-center">
                  {u.task_id ? `${u.pages_done}/${u.pages_total}` : '-'}
                </td>
                <td className="px-2 py-2 text-center">
                  {u.days_silent < 999 ? (
                    <span className={u.days_silent >= 2 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                      {u.days_silent}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-2 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    u.status === 'frozen' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>{u.status}</span>
                </td>
                <td className="px-2 py-2 space-x-1">
                  {u.task_id && (
                    <button className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200" onClick={() => reassign(u.task_id)}>
                      Vazifani o'tkaz
                    </button>
                  )}
                  {u.status === 'active' && (
                    <>
                      <button className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200" onClick={() => freezeWeek(u.id)}>
                        Muzlat (1 hafta)
                      </button>
                      <button className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200" onClick={() => setStatus(u.id, 'blocked')}>
                        Blok
                      </button>
                    </>
                  )}
                  {(u.status === 'frozen' || u.status === 'blocked') && (
                    <button className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200" onClick={() => setStatus(u.id, 'active')}>
                      Tiklash
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
