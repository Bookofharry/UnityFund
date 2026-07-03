import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div>
          <p className="text-lg font-bold text-white">
            UnityFund <span className="text-amber-400">Admin</span>
          </p>
          <p className="text-xs text-slate-400">Platform administration — not scoped to any organization</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span>{user?.firstName} {user?.lastName}</span>
          <button onClick={logout} className="text-red-400 hover:underline">Sign out</button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
