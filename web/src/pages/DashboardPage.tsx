import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orgsApi } from '../api/organizations';
import { formatKobo } from '../lib/format';
import { LoadingState, ErrorState } from '../components/QueryStates';
import { hasRole, FINANCE_ROLES } from '../lib/roles';

const ROLE_LABELS: Record<string, string> = {
  organization_admin: 'Admin',
  treasurer:          'Treasurer',
  member:             'Member',
  platform_admin:     'Platform Admin',
};

const ROLE_COLORS: Record<string, string> = {
  organization_admin: 'bg-indigo-100 text-indigo-700',
  treasurer:          'bg-purple-100 text-purple-700',
  member:             'bg-gray-100 text-gray-600',
  platform_admin:     'bg-amber-100 text-amber-700',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  iconPath: string;
}

function StatCard({ label, value, sub, accent, iconBg, iconColor, iconPath }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${accent}`}>
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${iconBg}`}>
        <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <p className="mt-3 text-xs font-medium text-gray-500 sm:mt-4 sm:text-sm">{label}</p>
      <p className="mt-0.5 break-words text-lg font-bold tracking-tight text-gray-900 sm:text-2xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

const ADMIN_ACTIONS = [
  {
    to: '/funds',
    label: 'Manage Funds',
    desc: 'Create and configure collection funds',
    iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    to: '/members',
    label: 'Manage Members',
    desc: 'Invite members and manage roles',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    to: '/payouts',
    label: 'Payouts',
    desc: 'Approve and execute fund disbursements',
    iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];

const MEMBER_ACTIONS = [
  {
    to: '/contributions',
    label: 'My Contributions',
    desc: 'View history and make payments',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    to: '/bank-accounts',
    label: 'Bank Accounts',
    desc: 'Manage your payout bank accounts',
    iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    to: '/mandates',
    label: 'Direct Debit',
    desc: 'Set up automatic contribution deductions',
    iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
];

export function DashboardPage() {
  const { user, activeOrg } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', activeOrg?.id],
    queryFn: () => orgsApi.dashboard(activeOrg!.id),
    enabled: !!activeOrg,
  });

  if (!activeOrg) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50">
            <svg className="h-7 w-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-gray-900">No organization yet</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Create your organization to start managing funds and members, or ask your admin to send you an invitation.
          </p>
          <Link to="/onboarding" className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = hasRole(activeOrg.role, FINANCE_ROLES);
  const quickActions = isAdmin ? ADMIN_ACTIONS : MEMBER_ACTIONS;

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-5 py-6 text-white shadow-md sm:px-7 sm:py-7">
        <div className="relative z-10">
          <p className="text-sm font-medium text-indigo-200">{getGreeting()},</p>
          <h1 className="mt-0.5 break-words text-xl font-bold tracking-tight sm:text-2xl">
            {user?.firstName} {user?.lastName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/20">
              {activeOrg.name}
            </span>
            <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[activeOrg.role] ?? 'bg-gray-100 text-gray-600'}`}>
              {ROLE_LABELS[activeOrg.role] ?? activeOrg.role}
            </span>
          </div>
        </div>
        {/* Decorative circles — clipped by overflow-hidden above, safe at any width */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -right-4 h-56 w-56 rounded-full bg-white/5" />
      </div>

      {/* ── Stat cards ── */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
          <StatCard
            label="Active Funds"
            value={data?.activeFunds ?? 0}
            sub="funds currently open"
            accent="border-indigo-100"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
          <StatCard
            label="Active Cycles"
            value={data?.activeCycles ?? 0}
            sub="collection cycles running"
            accent="border-blue-100"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconPath="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
          <StatCard
            label="Total Collected"
            value={formatKobo(data?.totalCollectedKobo ?? 0)}
            sub="confirmed payments"
            accent="border-emerald-100"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <StatCard
            label="Outstanding"
            value={formatKobo(data?.totalOutstandingKobo ?? 0)}
            sub="pending contributions"
            accent="border-amber-100"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </div>
      )}

      {/* ── Quick actions ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-5"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${action.iconBg}`}>
                <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${action.iconColor}`} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.iconPath} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                <p className="mt-0.5 text-xs text-gray-400">{action.desc}</p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
