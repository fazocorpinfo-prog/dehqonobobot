import { Outlet, NavLink, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-emerald-900 text-white px-4 py-3 shadow">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠</span>
            <span className="font-bold">Admin panel</span>
          </div>
          <Link to="/" className="text-xs bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded-lg">
            ← Foydalanuvchi rejimi
          </Link>
        </div>
      </header>
      <nav className="bg-white border-b border-emerald-100 sticky top-12 z-10">
        <div className="max-w-3xl mx-auto flex overflow-x-auto">
          <Tab to="/admin">📊 Dashboard</Tab>
          <Tab to="/admin/khatms">📖 Xatmlar</Tab>
          <Tab to="/admin/users">👥 Foydalanuvchilar</Tab>
          <Tab to="/admin/content">📝 Kontent</Tab>
          <Tab to="/admin/prayer">🕌 Namoz vaqtlari</Tab>
        </div>
      </nav>
      <main className="flex-1 px-4 py-4 max-w-3xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

function Tab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 ${
          isActive ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-emerald-500 hover:text-emerald-700'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
