import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { orgsApi } from '../api/organizations';
import { LoadingState } from '../components/QueryStates';

const ORG_TYPES: Record<string, string> = {
  cooperative: 'Cooperative Society',
  welfare_association: 'Welfare Association',
  alumni_association: 'Alumni Association',
  professional_association: 'Professional Association',
  other: 'Other',
};

export function SettingsPage() {
  const { activeOrg, setSession } = useAuth();
  const qc = useQueryClient();
  const orgId = activeOrg?.id ?? '';

  const { data: orgData, isLoading } = useQuery({
    queryKey: ['org', orgId],
    queryFn: () => orgsApi.get(orgId),
    enabled: !!orgId,
  });

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (orgData?.organization) {
      setForm({
        name: orgData.organization.name,
        email: orgData.organization.email ?? '',
        phone: '',
      });
    }
  }, [orgData]);

  const updateMutation = useMutation({
    mutationFn: () => orgsApi.update(orgId, {
      name: form.name.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
    }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['org', orgId] });
      // Update sidebar org name if changed
      if (updated && activeOrg) {
        const token = localStorage.getItem('access_token')!;
        import('../api/auth').then(({ authApi }) =>
          authApi.me().then((u) => setSession(u, token))
        );
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (!activeOrg) return null;
  if (isLoading) return <LoadingState />;

  const org = orgData?.organization;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your organization profile</p>
      </div>

      {/* Org info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-semibold text-gray-800">Organization Details</h2>
        <p className="mb-5 text-xs text-gray-400">
          Type: <span className="font-medium text-gray-600">{ORG_TYPES[org?.organizationType ?? ''] ?? org?.organizationType}</span>
          <span className="mx-2">·</span>
          Status: <span className="font-medium text-gray-600">{org?.status}</span>
        </p>

        {updateMutation.isError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {(updateMutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Update failed.'}
          </div>
        )}

        {saved && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Changes saved.</div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">Organization name</label>
            <input
              id="org-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="org-email" className="block text-sm font-medium text-gray-700">Contact email</label>
            <input
              id="org-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="org-phone" className="block text-sm font-medium text-gray-700">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              id="org-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+234 800 000 0000"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Org ID */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Organization ID</p>
        <p className="mt-1 font-mono text-sm text-gray-700 break-all">{orgId}</p>
      </div>
    </div>
  );
}
