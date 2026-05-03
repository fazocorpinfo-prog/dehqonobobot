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
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-hero text-white px-5 pt-8 pb-12 safe-top">
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-gold-400/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />

        <div className="relative max-w-md mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-white/15 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-3xl shadow-inner">
            🕌
          </div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-emerald-100/80">
            Bismillahir Rohmaanir Rohiym
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Xatmi Qur'on</h1>
          <p className="text-emerald-100/90 text-sm mt-1">Dehqonbobo Jome masjidi</p>
          <p className="text-emerald-100/80 text-[13px] mt-3 leading-relaxed">
            Jamoa bo'lib Qur'oni Karimni xatm qilamiz. Sizga kuniga bir necha bet beriladi —
            hisobot bersangiz, raqamli bog'ingiz gullaydi.
          </p>
        </div>
      </div>

      <div className="flex-1 -mt-6 px-4 pb-8 max-w-md w-full mx-auto">
        <form onSubmit={submit} className="card space-y-4 animate-fade-up">
          <div className="text-center">
            <h2 className="title">Ro'yxatdan o'tish</h2>
            <p className="subtitle mt-0.5">Bir martalik — tezda kirib boramiz</p>
          </div>

          <Field label="Ismingiz" required>
            <input
              className="input"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Masalan: Abdulloh"
            />
          </Field>

          <Field label="Familiyangiz">
            <input
              className="input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ixtiyoriy"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Yoshingiz" required>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min={5}
                max={110}
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
              />
            </Field>
            <Field label="Kuniga bet" required hint="Necha bet o'qiy olasiz?">
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="5"
              />
            </Field>
          </div>

          <Field label="Telefon" hint="Ixtiyoriy">
            <input
              className="input"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button className="btn-primary w-full text-base py-3.5" disabled={loading}>
            {loading ? 'Saqlanyapti...' : "✨ Ro'yxatdan o'tish"}
          </button>

          <p className="text-[11px] text-emerald-700/70 text-center px-2">
            Ma'lumotlaringiz faqat masjid ichida — vazifa taqsimoti uchun ishlatiladi.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="label">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {hint && <span className="text-[11px] text-emerald-600/70">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
