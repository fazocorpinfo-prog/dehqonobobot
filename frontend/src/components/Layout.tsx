import { Outlet, NavLink, Link } from 'react-router-dom';

export default function Layout({ user, isAdmin }: { user: any; isAdmin: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-emerald-700 text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕌</span>
            <div>
              <div className="font-bold leading-tight">Xatmi Qur'on</div>
              <div className="text-xs text-emerald-100">Dehqonbobo Jome masjidi</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg text-xs">
                🛠 Admin
              </Link>
            )}
            <Link to="/profile" className="bg-emerald-800 px-2 py-1 rounded-full text-xs">
              {user.first_name}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-xl mx-auto w-full pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 shadow-lg">
        <div className="flex justify-around max-w-xl mx-auto">
          <Tab to="/" icon="📖" label="Vazifa" />
          <Tab to="/garden" icon="🌳" label="Bog'" />
          <Tab to="/leaderboard" icon="🏆" label="Reyting" />
          <Tab to="/announcements" icon="📢" label="E'lonlar" />
          <Tab to="/articles" icon="📚" label="Maqola" />
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
        `flex-1 flex flex-col items-center py-2 text-[11px] ${
          isActive ? 'text-emerald-700 font-semibold' : 'text-emerald-500'
        }`
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="mt-0.5">{label}</span>
    </NavLink>
  );
}
