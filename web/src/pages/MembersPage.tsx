import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { orgsApi, OrgMember } from '../api/organizations';
import { invitationsApi, Invitation } from '../api/invitations';
import { LoadingState, ErrorState } from '../components/QueryStates';
import { hasRole, ORG_MANAGER_ROLES } from '../lib/roles';
import { useToast, getErrorMessage } from '../context/ToastContext';

const ROLE_OPTIONS = ['member', 'treasurer', 'approver', 'organization_admin'];
const ROLE_LABELS: Record<string, string> = {
  member: 'Member',
  treasurer: 'Treasurer',
  approver: 'Approver',
  organization_admin: 'Admin',
  platform_admin: 'Platform Admin',
};
const ROLE_COLORS: Record<string, string> = {
  organization_admin: 'bg-indigo-100 text-indigo-700',
  treasurer: 'bg-purple-100 text-purple-700',
  approver: 'bg-blue-100 text-blue-700',
  member: 'bg-gray-100 text-gray-600',
};

type Tab = 'members' | 'invitations';

export function MembersPage() {
  const { activeOrg } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const orgId = activeOrg?.id ?? '';
  const isAdmin = hasRole(activeOrg?.role, ORG_MANAGER_ROLES);

  const [tab, setTab] = useState<Tab>('members');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });

  const { data: members = [], isLoading, isError } = useQuery({
    queryKey: ['members', orgId],
    queryFn: () => orgsApi.members(orgId),
    enabled: !!orgId,
  });

  const { data: invitations = [], isLoading: invLoading } = useQuery({
    queryKey: ['invitations', orgId],
    queryFn: () => invitationsApi.list(orgId),
    enabled: !!orgId && isAdmin && tab === 'invitations',
  });

  const inviteMutation = useMutation({
    mutationFn: () => invitationsApi.send(orgId, inviteForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations', orgId] });
      setInviteForm({ email: '', role: 'member' });
      setShowInvite(false);
      toast.success('Invitation sent successfully.');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Action failed.')),
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => invitationsApi.resend(orgId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations', orgId] });
      toast.success('Invitation resent.');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Action failed.')),
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (id: string) => invitationsApi.cancel(orgId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations', orgId] });
      toast.success('Invitation cancelled.');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Action failed.')),
  });

  const removesMutation = useMutation({
    mutationFn: (memberId: string) => orgsApi.removeMember(orgId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', orgId] });
      toast.success('Member removed.');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Action failed.')),
  });

  if (!activeOrg) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="mt-1 text-sm text-gray-500">{activeOrg.name}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowInvite(true); setTab('invitations'); }}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Invite member
          </button>
        )}
      </div>

      {/* Tabs */}
      {isAdmin && (
        <div className="mt-6 flex gap-4 border-b border-gray-200">
          {(['members', 'invitations'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === 'members' && (
        <div className="mt-6">
          {isLoading ? <LoadingState /> : isError ? <ErrorState /> : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                    <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Role</th>
                    <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                    {isAdmin && <th scope="col" className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((m: OrgMember) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {m.user.firstName} {m.user.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{m.user.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[m.role] ?? 'bg-gray-100'}`}>
                          {ROLE_LABELS[m.role] ?? m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {m.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          {m.role !== 'organization_admin' && (
                            <button
                              onClick={() => { if (confirm(`Remove ${m.user.firstName} from the organization?`)) removesMutation.mutate(m.id); }}
                              disabled={removesMutation.isPending}
                              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── INVITATIONS TAB ── */}
      {tab === 'invitations' && isAdmin && (
        <div className="mt-6 space-y-4">
          {/* Invite form */}
          {showInvite && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-medium text-gray-800">Send invitation</h3>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <button
                  onClick={() => inviteMutation.mutate()}
                  disabled={!inviteForm.email || inviteMutation.isPending}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {inviteMutation.isPending ? 'Sending…' : 'Send'}
                </button>
                <button onClick={() => setShowInvite(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Invitations list */}
          {invLoading ? <LoadingState /> : invitations.filter((inv: Invitation) => inv.status !== 'cancelled').length === 0 ? (
            <p className="text-sm text-gray-400">No pending invitations.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                    <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Role</th>
                    <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Expires</th>
                    <th scope="col" className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invitations.filter((inv: Invitation) => inv.status !== 'cancelled').map((inv: Invitation) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{inv.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[inv.role] ?? 'bg-gray-100'}`}>
                          {ROLE_LABELS[inv.role] ?? inv.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {inv.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => resendMutation.mutate(inv.id)}
                              disabled={resendMutation.isPending}
                              className="text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                            >
                              Resend
                            </button>
                            <button
                              onClick={() => cancelInviteMutation.mutate(inv.id)}
                              disabled={cancelInviteMutation.isPending}
                              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
