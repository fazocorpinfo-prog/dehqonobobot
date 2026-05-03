import { Outlet, NavLink, Link } from 'react-router-dom';

export default function Layout({ user, isAdmin }: { user: any; isAdmin: boolean }) {
  const initials = (user.first_name?.[0] ?? '?') + (user.last_name?.[0] ?? '');
  const greeting = getGreeting();

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO HEADER */}
      <header className="relative overflow-hidden bg-gradient-hero text-white safe-top">
        <div className="absolute inset-0 bg-mesh-emerald opacity-70 pointer-events-none" />
        <div
          className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-gold-400/20 blur-3xl pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative max-w-xl mx-auto px-4 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner ring-1 ring-white/20">
                🕌
              </div>
              <div className="leading-tight">
                <div className="font-bold text-[15px] tracking-tight">Xatmi Qur'on</div>
                <div className="text-[11px] text-emerald-100/90">Dehqonbobo Jome masjidi</div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-semibold ring-1 ring-white/15"
                >
                  <span>⚙️</span> Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur pl-1.5 pr-3 py-1 rounded-full ring-1 ring-white/15"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-gold text-white text-[11px] font-bold flex items-center justify-center shadow-inner">
                  {initials.toUpperCase()}
                </span>
                <span className="text-xs font-semibold max-w-[100px] truncate">{user.first_name}</span>
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">{greeting.eyebrow}</div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
              Assalomu alaykum, <span className="text-gold-200">{user.first_name}</span>
            </h1>
            <p className="text-[13px] text-emerald-100/80 mt-1">{greeting.line}</p>
          </div>
        </div>

        {/* Wave divider */}
        <svg
          viewBox="0 0 1440 60"
          className="block w-full h-6 text-[#f6fbf8]"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,32 C240,72 480,0 720,16 C960,32 1200,72 1440,40 L1440,60 L0,60 Z"
          />
        </svg>
      </header>

      <main className="flex-1 px-4 py-4 max-w-xl mx-auto w-full pb-28 animate-fade-up">
        <Outlet />
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="max-w-xl mx-auto px-3 pb-2">
          <div className="bg-white/90 backdrop-blur-xl border border-emerald-100/80 shadow-card rounded-3xl flex items-center justify-around">
            <Tab to="/" icon="📖" label="Vazifa" />
            <Tab to="/garden" icon="🌳" label="Bog'" />
            <Tab to="/leaderboard" icon="🏆" label="Reyting" />
            <Tab to="/announcements" icon="📢" label="E'lonlar" />
            <Tab to="/articles" icon="📚" label="Maqola" />
          </div>
        </div>
      </nav>
    </div>
  );
}

function Tab({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative flex-1 flex flex-col items-center py-2.5 text-[10.5px] font-semibold transition-colors ${
          isActive ? 'text-emerald-700' : 'text-emerald-400 hover:text-emerald-600'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="nav-pill" />}
          <span
            className={`text-[20px] leading-none transition-transform ${
              isActive ? 'scale-110' : ''
            }`}
          >
            {icon}
          </span>
          <span className="mt-1">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function getGreeting(): { eyebrow: string; line: string } {
  const h = new Date().getHours();
  if (h < 5) return { eyebrow: 'Tahajjud', line: 'Bu fayzli vaqtda Qur\'on sizga nur bo\'lsin.' };
  if (h < 11) return { eyebrow: 'Hayrli tong', line: 'Bugun ham Qur\'on bilan boshlang.' };
  if (h < 16) return { eyebrow: 'Hayrli kun', line: 'Bir oz vaqt — bir oz nur. Hisobotni unutmang.' };
  if (h < 19) return { eyebrow: 'Hayrli kech', line: 'Asr-namozdan keyin — eng faol vaqt.' };
  return { eyebrow: 'Hayrli oqshom', line: 'Shomdan keyin — bir varaq ham buyuk savob.' };
}
