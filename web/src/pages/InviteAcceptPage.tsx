import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { invitationsApi, InviteValidation } from '../api/invitations';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { BrandedLoaderBlock } from '../components/BrandedLoader';

const ROLE_LABELS: Record<string, string> = {
  member: 'Member',
  treasurer: 'Treasurer',
  organization_admin: 'Organization Admin',
};

export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, setSession } = useAuth();

  const [state, setState] = useState<'loading' | 'valid' | 'invalid' | 'accepting' | 'done'>('loading');
  const [invite, setInvite] = useState<InviteValidation | null>(null);
  const [reason, setReason] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    invitationsApi.validate(token).then((res) => {
      setInvite(res);
      setState('valid');
    }).catch((err: unknown) => {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      const status = e?.response?.status;
      const msg = e?.response?.data?.error ?? '';
      let r = 'unknown';
      if (status === 404) r = 'not_found';
      else if (msg.includes('expired')) r = 'expired';
      else if (msg.includes('already accepted')) r = 'already_accepted';
      else if (msg.includes('cancelled')) r = 'cancelled';
      setReason(r);
      setState('invalid');
    });
  }, [token]);

  const handleAccept = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setState('accepting');
    try {
      const payload = invite?.requiresRegistration && !user
        ? { firstName: form.firstName, lastName: form.lastName, password: form.password }
        : undefined;

      const res = await invitationsApi.accept(token!, payload);
      const updated = await authApi.me();
      setSession(updated, res.accessToken, res.refreshToken);
      setState('done');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to accept invitation.';
      setError(msg);
      setState('valid');
    }
  };

  if (state === 'loading') {
    return <BrandedLoaderBlock message="" size="lg" fullScreen />;
  }

  if (state === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900">You're in!</p>
          <p className="mt-1 text-sm text-gray-500">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  if (state === 'invalid') {
    const reasonMessages: Record<string, string> = {
      expired: 'This invitation link has expired. Ask your admin to resend it.',
      already_accepted: 'This invitation has already been accepted.',
      cancelled: 'This invitation was cancelled by the administrator.',
      not_found: 'This invitation link is invalid or does not exist.',
    };
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Invitation not valid</h1>
          <p className="mt-2 text-sm text-gray-500">{reasonMessages[reason] ?? 'This invitation link is not valid.'}</p>
          <Link to="/login" className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const needsReg = invite?.requiresRegistration && !user;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="11" cy="16" r="9" fill="#4f46e5" />
              <circle cx="21" cy="16" r="9" fill="#1a2b6e" />
              <circle cx="16" cy="16" r="5.5" fill="#818cf8" />
            </svg>
            <span className="text-xl font-bold text-navy-800">UnityFund</span>
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 rounded-lg bg-indigo-50 p-4">
            <p className="text-sm text-indigo-700">
              You've been invited to join <strong>{invite?.organization.name}</strong> as a{' '}
              <strong>{ROLE_LABELS[invite?.role ?? ''] ?? invite?.role}</strong>.
            </p>
            <p className="mt-1 text-xs text-indigo-500">Invite sent to {invite?.email}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>
          )}

          {needsReg ? (
            <form onSubmit={handleAccept} className="space-y-4">
              <p className="text-sm text-gray-500">Complete your registration to accept this invitation.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inv-fn" className="block text-sm font-medium text-gray-700">First name</label>
                  <input id="inv-fn" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label htmlFor="inv-ln" className="block text-sm font-medium text-gray-700">Last name</label>
                  <input id="inv-ln" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label htmlFor="inv-pw" className="block text-sm font-medium text-gray-700">Password</label>
                <input id="inv-pw" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required minLength={8} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <button type="submit" disabled={state === 'accepting'}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                {state === 'accepting' ? 'Accepting…' : 'Create account & join'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {user && (
                <p className="text-sm text-gray-500">
                  You're signed in as <strong>{user.firstName} {user.lastName}</strong>. Click below to join the organization.
                </p>
              )}
              {!user && (
                <p className="text-sm text-gray-500">
                  You already have a UnityFund account with this email. Sign in to accept this invitation.
                </p>
              )}
              {!user && (
                <Link to={`/login?redirect=/invite/${token}`}
                  className="block w-full rounded-lg border border-indigo-600 py-2.5 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
                  Sign in to accept
                </Link>
              )}
              {user && (
                <button onClick={() => handleAccept()} disabled={state === 'accepting'}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                  {state === 'accepting' ? 'Accepting…' : `Join ${invite?.organization.name} →`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
