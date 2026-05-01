import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Profile({ user }: { user: any }) {
  const [reports, setReports] = useState<any[]>([]);
  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    api.reports().then((r) => setReports(r.reports));
    api.activeTask().then((r) => setTask(r.task));
  }, []);

  const totalPages = reports.reduce((sum, r) => sum + (r.pages_read ?? 0), 0);

  return (
    <div className="space-y-4">
      <section className="card text-center">
        <div className="text-5xl">👤</div>
        <div className="title mt-2">{user.first_name} {user.last_name ?? ''}</div>
        <div className="subtitle">Yosh: {user.age ?? '-'} · Kunlik: {user.daily_capacity} bet</div>
        {user.phone && <div className="text-xs text-emerald-600 mt-1">📞 {user.phone}</div>}
      </section>

      <section className="card">
        <div className="title">📊 Umumiy statistika</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-emerald-50 rounded-xl py-3 text-center">
            <div className="text-2xl font-bold text-emerald-700">{totalPages}</div>
            <div className="text-xs text-emerald-600">Jami o'qilgan bet</div>
          </div>
          <div className="bg-emerald-50 rounded-xl py-3 text-center">
            <div className="text-2xl font-bold text-emerald-700">{reports.length}</div>
            <div className="text-xs text-emerald-600">Hisobot kunlari</div>
          </div>
        </div>
        {task && (
          <div className="mt-3 text-sm text-emerald-700">
            Aktiv vazifa: {task.label} · O'qigan {task.pages_done}/{task.end_page - task.start_page + 1}
          </div>
        )}
      </section>
    </div>
  );
}
