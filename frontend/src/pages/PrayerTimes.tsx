import { useEffect, useState } from 'react';
import { api } from '../api';

export default function PrayerTimes() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.prayerTimes().then((r) => setRows(r.prayerTimes)); }, []);
  return (
    <div className="space-y-4">
      <h2 className="title">🕌 Namoz vaqtlari</h2>
      {rows.length === 0 && <div className="subtitle">Vaqtlar kiritilmagan.</div>}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Sana</th>
              <th className="px-2 py-2">Bom.</th>
              <th className="px-2 py-2">Quy.</th>
              <th className="px-2 py-2">Pesh.</th>
              <th className="px-2 py-2">Asr</th>
              <th className="px-2 py-2">Shom</th>
              <th className="px-2 py-2">Xuf.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} className="even:bg-emerald-50">
                <td className="px-3 py-2 text-emerald-800 font-medium">{r.date}</td>
                <td className="px-2 py-2 text-center">{r.bomdod}</td>
                <td className="px-2 py-2 text-center">{r.quyosh}</td>
                <td className="px-2 py-2 text-center">{r.peshin}</td>
                <td className="px-2 py-2 text-center">{r.asr}</td>
                <td className="px-2 py-2 text-center">{r.shom}</td>
                <td className="px-2 py-2 text-center">{r.xufton}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
