import { useState } from 'react';
import { api } from '../api';

export default function Register({ onRegistered }: { onRegistered: (u: any) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [capacity, setCapacity] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await api.register({
        firstName,
        lastName,
        age: Number(age),
        dailyCapacity: Number(capacity),
        phone: phone || undefined,
      });
      onRegistered(r.user);
    } catch (e: any) {
      setError(e?.message ?? 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🕌</div>
        <h1 className="text-2xl font-bold text-emerald-900">Xatmi Qur'on</h1>
        <p className="subtitle">Dehqonbobo Jome masjidi</p>
      </div>

      <form onSubmit={submit} className="card space-y-3">
        <h2 className="title text-center">Ro'yxatdan o'tish</h2>

        <div>
          <label className="text-sm font-medium text-emerald-800">Ismingiz</label>
          <input className="input mt-1" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-emerald-800">Familiyangiz</label>
          <input className="input mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-emerald-800">Yoshingiz</label>
          <input
            className="input mt-1"
            type="number"
            min={5}
            max={110}
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-emerald-800">Kuniga necha bet o'qiy olasiz?</label>
          <input
            className="input mt-1"
            type="number"
            min={1}
            max={100}
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <p className="text-xs text-emerald-600 mt-1">
            Bot vazifani shu miqdorga qarab taqsimlaydi. Yaxlitlash uchun sal ko'proq berilishi mumkin.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-emerald-800">Telefon (ixtiyoriy)</label>
          <input
            className="input mt-1"
            placeholder="+998 90 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Saqlanyapti...' : "Ro'yxatdan o'tish"}
        </button>
      </form>
    </div>
  );
}
