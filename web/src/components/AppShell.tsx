import { useEffect, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasRole, FINANCE_ROLES, ORG_MANAGER_ROLES, Role } from '../lib/roles';
import type { User } from '../api/auth';

const BASE_NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/funds', label: 'Funds' },
  { to: '/contributions', label: 'Contributions' },
  { to: '/payment-history', label: 'Payment History' },
  { to: '/payouts', label: 'Payouts' },
  { to: '/members', label: 'Members' },
  { to: '/bank-accounts', label: 'Bank Accounts' },
  { to: '/mandates', label: 'Mandates' },
  { to: '/notifications', label: 'Notifications' },
];

const REPORTS_ROLES: Role[] = FINANCE_ROLES;
// Settings can only be saved by org managers — Treasurer would silently 403 on save.
const SETTINGS_ROLES = ORG_MANAGER_ROLES;

interface NavItem {
  to: string;
  label: string;
}

interface SidebarContentProps {
  navItems: NavItem[];
  pathname: string;
  user: User | null;
  activeOrg: { name: string } | null;
  logout: () => void;
  onNavigate?: () => void;
}

function SidebarContent({ navItems, pathname, user, activeOrg, logout, onNavigate }: SidebarContentProps) {
  return (
    <>
      <div className="border-b border-gray-100 px-5 py-4">
        <p className="text-lg font-bold text-indigo-700">UnityFund</p>
        {activeOrg && <p className="mt-0.5 truncate text-xs text-gray-500">{activeOrg.name}</p>}
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-2">
        {navItems.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center rounded-md border-2 px-3 py-2.5 text-sm font-medium transition-colors sm:py-2 ${
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
        <p className="truncate text-xs font-medium text-gray-700">
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
    </>
  );
}

export function AppShell() {
  const { user, activeOrg, logout } = useAuth();
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const role = activeOrg?.role;
  const navItems = [
    ...BASE_NAV,
    ...(hasRole(role, REPORTS_ROLES) ? [{ to: '/reports', label: 'Reports' }] : []),
    ...(hasRole(role, SETTINGS_ROLES) ? [{ to: '/settings', label: 'Settings' }] : []),
  ];

  // Close the drawer automatically on route change.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      {/* Mobile / tablet top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="text-base font-bold text-indigo-700">UnityFund</p>
          {activeOrg && <p className="truncate text-xs text-gray-500">{activeOrg.name}</p>}
        </div>
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-sidebar"
          className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {/* Desktop sidebar — persistent, only from lg (small laptop) up */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <SidebarContent navItems={navItems} pathname={pathname} user={user} activeOrg={activeOrg} logout={logout} />
      </aside>

      {/* Mobile / tablet drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              id="mobile-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl lg:hidden"
            >
              <div className="flex items-center justify-end px-3 py-3">
                <button
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent
                navItems={navItems}
                pathname={pathname}
                user={user}
                activeOrg={activeOrg}
                logout={logout}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
