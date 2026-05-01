import { useState } from 'react';
import { api } from '../api';

interface Row {
  date: string;
  bomdod: string;
  quyosh: string;
  peshin: string;
  asr: string;
  shom: string;
  xufton: string;
}

function nextWeekDates(): string[] {
  const out: string[] = [];
  const t = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(t);
    d.setDate(t.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function AdminPrayerTimes() {
  const [rows, setRows] = useState<Row[]>(
    nextWeekDates().map((date) => ({
      date,
      bomdod: '04:30', quyosh: '05:55', peshin: '12:30', asr: '17:00', shom: '19:25', xufton: '20:55',
    }))
  );
  const [msg, setMsg] = useState<string | null>(null);

  function update(i: number, field: keyof Row, value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  async function save() {
    await api.admin.setPrayerTimes(rows);
    setMsg('✅ Saqlandi');
    setTimeout(() => setMsg(null), 2000);
  }

  return (
    <div className="space-y-4">
      <h2 className="title">🕌 Namoz vaqtlari (haftalik)</h2>
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="px-2 py-2 text-left">Sana</th>
              <th className="px-2 py-2">Bomdod</th>
              <th className="px-2 py-2">Quyosh</th>
              <th className="px-2 py-2">Peshin</th>
              <th className="px-2 py-2">Asr</th>
              <th className="px-2 py-2">Shom</th>
              <th className="px-2 py-2">Xufton</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.date} className="even:bg-emerald-50">
                <td className="px-2 py-2 font-medium">{r.date}</td>
                {(['bomdod','quyosh','peshin','asr','shom','xufton'] as const).map((f) => (
                  <td key={f} className="px-1 py-1">
                    <input
                      className="w-20 border border-emerald-200 rounded px-1 py-1 text-center"
                      value={r[f]}
                      onChange={(e) => update(i, f, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn-primary w-full" onClick={save}>Saqlash</button>
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
    </div>
  );
}
