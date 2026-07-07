import { useMemo, useState } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { contributionsApi, Contribution } from '../api/contributions';
import { paymentsApi } from '../api/payments';
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

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  successful: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  initiated: 'bg-yellow-100 text-yellow-700',
  pending_review: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-600',
  reversed: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  checkout: 'Checkout',
  direct_debit: 'Direct Debit',
};

const RECENT_ATTEMPTS_LIMIT = 5;

function isPayable(c: Contribution): boolean {
  return ['pending', 'partial', 'overdue'].includes(c.status) && c.collectionCycle.status === 'active';
}

function PaymentAttemptHistory({ orgId, contributionId }: { orgId: string; contributionId: string }) {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payment-history', orgId, contributionId],
    queryFn: () => paymentsApi.list(orgId, { contributionId }),
  });

  if (isLoading) {
    return <p className="mt-3 text-xs text-gray-400">Loading payment attempts…</p>;
  }
  if (payments.length === 0) {
    return <p className="mt-3 text-xs text-gray-400">No payment attempts yet.</p>;
  }

  return (
    <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
      {payments.slice(0, RECENT_ATTEMPTS_LIMIT).map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-500">{PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}</span>
          <span className="font-medium text-gray-700">{formatKobo(p.amount)}</span>
          <span className={`rounded-full px-2 py-0.5 font-medium ${PAYMENT_STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {p.status.replace(/_/g, ' ')}
          </span>
          <span className="shrink-0 text-gray-400">{formatDate(p.paidAt ?? p.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}

interface MyContributionsSectionProps {
  contributions: Contribution[];
  orgId: string;
  payMutation: UseMutationResult<{ payment: unknown; checkoutUrl?: string }, unknown, string>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}

// Own-contributions view: outstanding items first (soonest due date first),
// then everything else, most recent first — surfaces what needs attention
// when someone has several funds/cycles to pay into at once. Used both for
// regular members (their whole list) and for Treasurer/Admin who are also
// fund-enrolled (their own subset, shown above the org-wide table below).
function MyContributionsSection({ contributions, orgId, payMutation, expandedId, setExpandedId }: MyContributionsSectionProps) {
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

  return (
    <div>
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
                  disabled={payMutation.isPending && payMutation.variables === c.id}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {payMutation.isPending && payMutation.variables === c.id
                    ? 'Opening…'
                    : `Pay ${formatKobo(c.expectedAmount - c.paidAmount)}`}
                </button>
              )}
            </div>

            <button
              onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
              className="mt-3 text-xs font-medium text-indigo-600 hover:underline"
            >
              {expandedId === c.id ? 'Hide payment history' : 'Show payment history'}
            </button>

            {expandedId === c.id && (
              <PaymentAttemptHistory orgId={orgId} contributionId={c.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContributionsPage() {
  const { activeOrg, user } = useAuth();
  const toast = useToast();
  const isElevated = hasRole(activeOrg?.role, FINANCE_ROLES);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        // Same tab, not a new one — Nomba redirects back to /payments/callback,
        // which is built to catch that return trip and show the result.
        // Opening in a new tab strands that callback page somewhere the user
        // has to go find instead of just landing on it.
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Payment could not be initiated. Please try again.');
      }
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to initiate payment.')),
  });

  // Treasurer/Admin see the org-wide table below regardless, but they can
  // also be fund-enrolled themselves (a Treasurer paying dues like anyone
  // else is normal) — surface their own contributions the same way a
  // regular member sees theirs, instead of making them hunt their own row
  // in the big table.
  const myContributions = useMemo(
    () => (isElevated && user ? contributions.filter((c) => c.fundMember.orgMember.user.id === user.id) : []),
    [isElevated, user, contributions],
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
        <>
          {myContributions.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-base font-semibold text-gray-800">My Contributions</h2>
              <MyContributionsSection
                contributions={myContributions}
                orgId={activeOrg.id}
                payMutation={payMutation}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-3 text-base font-semibold text-gray-800">All Contributions</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[800px] text-sm">
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
                            disabled={payMutation.isPending && payMutation.variables === c.id}
                            className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {payMutation.isPending && payMutation.variables === c.id ? 'Opening…' : 'Pay'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <MyContributionsSection
            contributions={contributions}
            orgId={activeOrg.id}
            payMutation={payMutation}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        </div>
      )}
    </div>
  );
}
