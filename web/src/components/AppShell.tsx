import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MEMBER_NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/funds', label: 'Funds' },
  { to: '/contributions', label: 'Contributions' },
  { to: '/payouts', label: 'Payouts' },
  { to: '/members', label: 'Members' },
  { to: '/bank-accounts', label: 'Bank Accounts' },
  { to: '/mandates', label: 'Mandates' },
  { to: '/notifications', label: 'Notifications' },
];

const ADMIN_ONLY_NAV = [
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

const ADMIN_ROLES = ['organization_admin', 'treasurer', 'platform_admin'];

export function AppShell() {
  const { user, activeOrg, logout } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = ADMIN_ROLES.includes(activeOrg?.role ?? '');
  const navItems = isAdmin ? [...MEMBER_NAV, ...ADMIN_ONLY_NAV] : MEMBER_NAV;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-lg font-bold text-indigo-700">UnityFund</p>
          {activeOrg && <p className="mt-0.5 truncate text-xs text-gray-500">{activeOrg.name}</p>}
        </div>

        <nav className="mt-2 flex-1 px-2">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(to)
                  ? 'border-dashed border-[#F7C948] bg-indigo-50 text-indigo-700'
                  : 'border-transparent text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-gray-100 px-5 py-4">
          <p className="text-xs font-medium text-gray-700">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-gray-400">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-xs text-red-500 hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
