import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { payoutsApi } from '../api/payouts';
import { formatKobo, formatDate } from '../lib/format';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason?: string;
  paidAt?: string;
  createdAt: string;
  fund: { id: string; name: string; organizationId: string };
  recipient: {
    id: string;
    rotationPosition?: number;
    orgMember: { user: { id: string; firstName: string; lastName: string } };
  };
}

const STATUS_COLORS: Record<string, string> = {
  successful: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  approved: 'bg-indigo-100 text-indigo-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
  draft: 'bg-gray-100 text-gray-500',
};

function getMutationError(err: unknown) {
  return (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Action failed.';
}

export function PayoutsPage() {
  const { activeOrg } = useAuth();
  const qc = useQueryClient();
  const orgId = activeOrg?.id ?? '';
  const role = activeOrg?.role ?? '';

  const canApprove = ['approver', 'organization_admin', 'platform_admin'].includes(role);
  const canExecute = ['treasurer', 'organization_admin', 'platform_admin'].includes(role);

  const { data: payouts = [], isLoading, isError } = useQuery({
    queryKey: ['payouts', orgId],
    queryFn: () => api.get<{ payouts: Payout[] }>(`/organizations/${orgId}/payouts`).then((r) => r.data.payouts),
    enabled: !!orgId,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => payoutsApi.approve(orgId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payouts', orgId] }),
  });

  const executeMutation = useMutation({
    mutationFn: (id: string) => payoutsApi.execute(orgId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payouts', orgId] }),
  });

  if (!activeOrg) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
      <p className="mt-1 text-sm text-gray-500">Track fund payouts and disbursements</p>

      {(approveMutation.isError || executeMutation.isError) && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {getMutationError(approveMutation.error ?? executeMutation.error)}
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : payouts.length === 0 ? (
        <EmptyState message="No payouts yet. Payouts are created automatically when collection cycles close." />
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Recipient</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Fund</th>
                <th scope="col" className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map((p: Payout) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {p.recipient.orgMember.user.firstName} {p.recipient.orgMember.user.lastName}
                    </p>
                    {p.recipient.rotationPosition && (
                      <p className="text-xs text-gray-400">Position #{p.recipient.rotationPosition}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.fund.name}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatKobo(p.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-gray-100'}`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {p.status === 'pending_approval' && canApprove && (
                        <button
                          onClick={() => approveMutation.mutate(p.id)}
                          disabled={approveMutation.isPending}
                          className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                      )}
                      {p.status === 'approved' && canExecute && (
                        <button
                          onClick={() => executeMutation.mutate(p.id)}
                          disabled={executeMutation.isPending}
                          className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          Execute
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
