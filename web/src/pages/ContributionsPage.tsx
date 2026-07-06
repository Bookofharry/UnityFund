import { useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { contributionsApi, Contribution } from '../api/contributions';
import { formatKobo, formatDate } from '../lib/format';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';
import { useToast, getErrorMessage } from '../context/ToastContext';
import { hasRole, FINANCE_ROLES } from '../lib/roles';

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-600',
};

function isPayable(c: Contribution): boolean {
  return ['pending', 'partial', 'overdue'].includes(c.status) && c.collectionCycle.status === 'active';
}

export function ContributionsPage() {
  const { activeOrg } = useAuth();
  const toast = useToast();
  const isElevated = hasRole(activeOrg?.role, FINANCE_ROLES);

  const { data: contributions = [], isLoading, isError } = useQuery({
    queryKey: ['contributions', activeOrg?.id],
    queryFn: () => contributionsApi.list(activeOrg!.id),
    enabled: !!activeOrg,
  });

  const payMutation = useMutation({
    mutationFn: (contributionId: string) =>
      contributionsApi.initiatePayment(activeOrg!.id, contributionId, { paymentMethod: 'checkout' }),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        toast.error('Payment could not be initiated. Please try again.');
      }
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to initiate payment.')),
  });

  // Own-contributions view: outstanding items first (soonest due date first),
  // then everything else, most recent first — surfaces what needs attention
  // when a member has several funds/cycles to pay into at once.
  const sorted = useMemo(() => {
    return [...contributions].sort((a, b) => {
      const aPayable = isPayable(a);
      const bPayable = isPayable(b);
      if (aPayable !== bPayable) return aPayable ? -1 : 1;
      if (aPayable && bPayable) {
        return (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [contributions]);

  const outstanding = useMemo(() => contributions.filter(isPayable), [contributions]);
  const outstandingTotal = useMemo(
    () => outstanding.reduce((sum, c) => sum + (c.expectedAmount - c.paidAmount), 0),
    [outstanding],
  );

  if (!activeOrg) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{isElevated ? 'Contributions' : 'My Contributions'}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {isElevated ? 'Track all member contributions across cycles' : 'Everything you owe, across every fund and cycle'}
      </p>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : contributions.length === 0 ? (
        <EmptyState
          message={
            isElevated
              ? 'No contributions found. Start a collection cycle to generate contributions.'
              : "You don't have any contributions yet. They'll show up here once your organization starts a collection cycle."
          }
        />
      ) : isElevated ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Member</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Fund</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Cycle</th>
                <th scope="col" className="px-4 py-3 text-right font-medium text-gray-500">Expected</th>
                <th scope="col" className="px-4 py-3 text-right font-medium text-gray-500">Paid</th>
                <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contributions.map((c: Contribution) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {c.fundMember.orgMember.user.firstName} {c.fundMember.orgMember.user.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{c.fundMember.orgMember.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.collectionCycle.fund.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.collectionCycle.name}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatKobo(c.expectedAmount)}</td>
                  <td className="px-4 py-3 text-right">{formatKobo(c.paidAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-gray-100'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.paidAt ? formatDate(c.paidAt) : c.dueDate ? formatDate(c.dueDate) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {isPayable(c) && (
                      <button
                        onClick={() => payMutation.mutate(c.id)}
                        disabled={payMutation.isPending}
                        className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6">
          {outstanding.length > 0 && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {outstanding.length} contribution{outstanding.length > 1 ? 's' : ''} due
                </p>
                <p className="mt-0.5 text-xs text-amber-700">Across {new Set(outstanding.map((c) => c.collectionCycle.fund.id)).size} fund(s)</p>
              </div>
              <p className="text-lg font-bold text-amber-800">{formatKobo(outstandingTotal)}</p>
            </div>
          )}

          <div className="space-y-3">
            {sorted.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl border bg-white p-5 shadow-sm ${isPayable(c) ? 'border-amber-200' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">{c.collectionCycle.fund.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{c.collectionCycle.name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-gray-100'}`}>
                    {c.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatKobo(c.paidAmount)}
                      <span className="text-sm font-normal text-gray-400"> / {formatKobo(c.expectedAmount)}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {c.paidAt ? `Paid ${formatDate(c.paidAt)}` : c.dueDate ? `Due ${formatDate(c.dueDate)}` : 'No due date'}
                    </p>
                  </div>

                  {isPayable(c) && (
                    <button
                      onClick={() => payMutation.mutate(c.id)}
                      disabled={payMutation.isPending}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {payMutation.isPending ? 'Opening…' : `Pay ${formatKobo(c.expectedAmount - c.paidAmount)}`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
