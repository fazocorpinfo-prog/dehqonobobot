import { Outlet, NavLink, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white safe-top">
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-gold-400/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />

        <div className="relative max-w-3xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-gold text-white flex items-center justify-center text-xl shadow-gold ring-1 ring-white/20">
                ⚙️
              </div>
              <div className="leading-tight">
                <div className="font-bold tracking-tight">Admin paneli</div>
                <div className="text-[11px] text-emerald-100/80">Dehqonbobo Jome · Boshqaruv</div>
              </div>
            </div>
            <Link
              to="/"
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-semibold ring-1 ring-white/15"
            >
              ← Foydalanuvchi
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-emerald-100">
        <div className="max-w-3xl mx-auto flex overflow-x-auto no-scrollbar px-2">
          <Tab to="/admin" icon="📊">Dashboard</Tab>
          <Tab to="/admin/khatms" icon="📖">Xatmlar</Tab>
          <Tab to="/admin/users" icon="👥">Jamoa</Tab>
          <Tab to="/admin/content" icon="📝">Kontent</Tab>
          <Tab to="/admin/prayer" icon="🕌">Namoz</Tab>
        </div>
      </nav>

      <main className="flex-1 px-4 py-5 max-w-3xl mx-auto w-full pb-12 animate-fade-up">
        <Outlet />
      </main>
    </div>
  );
}

function Tab({ to, icon, children }: { to: string; icon: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative whitespace-nowrap px-3.5 py-3 text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${
          isActive
            ? 'text-emerald-700'
            : 'text-emerald-500/80 hover:text-emerald-700'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="text-base leading-none">{icon}</span>
          <span>{children}</span>
          {isActive && (
            <span className="absolute left-3.5 right-3.5 -bottom-px h-[3px] rounded-t-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
          )}
        </>
      )}
    </NavLink>
  );
}
