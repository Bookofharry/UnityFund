import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orgsApi } from '../api/organizations';
import { authApi } from '../api/auth';

const ORG_TYPES = [
  { value: 'cooperative',              label: 'Cooperative Society' },
  { value: 'welfare_association',      label: 'Welfare Association' },
  { value: 'alumni_association',       label: 'Alumni Association' },
  { value: 'professional_association', label: 'Professional Association' },
  { value: 'other',                    label: 'Other' },
];

type Path = 'choose' | 'create' | 'join';

export function OnboardingPage() {
  const { user, activeOrg, setSession } = useAuth();
  const navigate = useNavigate();

  const [path, setPath] = useState<Path>('choose');
  const [form, setForm] = useState({
    name: '',
    organizationType: 'cooperative',
    email: user?.email ?? '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect users who already have an org
  useEffect(() => {
    if (activeOrg) navigate('/dashboard', { replace: true });
  }, [activeOrg, navigate]);

  // Keep email in sync if user loads after mount
  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, email: f.email || user.email }));
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Organization name is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await orgsApi.create({
        name: form.name.trim(),
        organizationType: form.organizationType,
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
      });
      // Re-fetch the user profile so the new org membership is in context
      const updated = await authApi.me();
      const token = localStorage.getItem('access_token')!;
      setSession(updated, token);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to create organization. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-navy-800 px-12 py-16">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="11" cy="16" r="9" fill="#4f46e5" />
            <circle cx="21" cy="16" r="9" fill="#1a2b6e" />
            <circle cx="16" cy="16" r="5.5" fill="#818cf8" />
          </svg>
          <span className="text-xl font-bold text-white">UnityFund</span>
        </Link>

        <div>
          <p className="text-3xl font-bold leading-snug text-white">
            Set up your organization<br />in under 2 minutes.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              'Invite your members by email',
              'Create funds with custom rules',
              'Collect payments automatically via Nomba',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500">© {new Date().getFullYear()} UnityFund</p>
      </div>

      {/* Right panel — flow */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">

        {/* Mobile logo */}
        <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="11" cy="16" r="9" fill="#4f46e5" />
            <circle cx="21" cy="16" r="9" fill="#1a2b6e" />
            <circle cx="16" cy="16" r="5.5" fill="#818cf8" />
          </svg>
          <span className="text-xl font-bold text-navy-800">UnityFund</span>
        </Link>

        <div className="w-full max-w-md">

          {/* ── STEP 1: Choose a path ── */}
          {path === 'choose' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
              <p className="mt-2 text-gray-500">How would you like to get started?</p>

              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setPath('create')}
                  className="group flex w-full items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Create my organization</p>
                    <p className="mt-0.5 text-sm text-gray-500">You'll be the admin. Invite your team afterwards.</p>
                  </div>
                </button>

                <button
                  onClick={() => setPath('join')}
                  className="group flex w-full items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Join an existing organization</p>
                    <p className="mt-0.5 text-sm text-gray-500">You received an invitation from your admin.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2A: Create org form ── */}
          {path === 'create' && (
            <div>
              <button
                onClick={() => { setPath('choose'); setError(''); }}
                className="mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <h1 className="text-2xl font-bold text-gray-900">Create your organization</h1>
              <p className="mt-1 text-sm text-gray-500">You'll be assigned as the administrator.</p>

              <form onSubmit={handleCreate} className="mt-7 space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>
                )}

                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
                    Organization name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="org-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Lagos Teachers Cooperative"
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all duration-150 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label htmlFor="org-type" className="block text-sm font-medium text-gray-700">
                    Organization type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      id="org-type"
                      value={form.organizationType}
                      onChange={(e) => setForm((f) => ({ ...f, organizationType: e.target.value }))}
                      className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 pr-10 text-sm text-gray-900 shadow-sm transition-all duration-150 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                    >
                      {ORG_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label htmlFor="org-email" className="block text-sm font-medium text-gray-700">
                    Contact email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="org-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all duration-150 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label htmlFor="org-phone" className="block text-sm font-medium text-gray-700">
                    Phone <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="org-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all duration-150 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:opacity-60"
                >
                  {loading ? 'Creating…' : 'Create organization →'}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2B: Join via invitation ── */}
          {path === 'join' && (
            <div>
              <button
                onClick={() => setPath('choose')}
                className="mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">Check your email</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Your organization administrator sends invitation links from UnityFund. Open the email and click the link — it will bring you straight in with the correct role assigned.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Haven't received one? Ask your admin to invite you from their <strong>Members</strong> page.
                </p>
                <a
                  href={`mailto:?subject=Please%20invite%20me%20to%20UnityFund`}
                  className="mt-6 inline-block rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700"
                >
                  Email my admin →
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
