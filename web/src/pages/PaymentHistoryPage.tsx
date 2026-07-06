import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { paymentsApi, PaymentHistoryItem } from '../api/payments';
import { formatKobo, formatDate } from '../lib/format';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';
import { hasRole, FINANCE_ROLES } from '../lib/roles';

const STATUS_COLORS: Record<string, string> = {
  successful: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  initiated: 'bg-yellow-100 text-yellow-700',
  pending_review: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-600',
  reversed: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const METHOD_LABELS: Record<string, string> = {
  checkout: 'Checkout',
  direct_debit: 'Direct Debit',
};

export function PaymentHistoryPage() {
  const { activeOrg } = useAuth();
  const isElevated = hasRole(activeOrg?.role, FINANCE_ROLES);

  const { data: payments = [], isLoading, isError } = useQuery({
    queryKey: ['payment-history', activeOrg?.id],
    queryFn: () => paymentsApi.list(activeOrg!.id),
    enabled: !!activeOrg,
  });

  if (!activeOrg) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{isElevated ? 'Payment History' : 'My Payment History'}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {isElevated
          ? 'Every payment attempt across all members, funds, and cycles'
          : 'Every payment attempt you’ve made, across all funds and cycles'}
      </p>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : payments.length === 0 ? (
        <EmptyState
          message={
            isElevated
              ? 'No payments recorded yet.'
              : "You haven't made any payments yet. They'll show up here once you pay a contribution."
          }
        />
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {isElevated && <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Member</th>}
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Fund</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Cycle</th>
                <th scope="col" className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Method</th>
                <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p: PaymentHistoryItem) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  {isElevated && (
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">
                        {p.contribution.fundMember.orgMember.user.firstName} {p.contribution.fundMember.orgMember.user.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{p.contribution.fundMember.orgMember.user.email}</p>
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-600">{p.contribution.collectionCycle.fund.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.contribution.collectionCycle.name}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatKobo(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-600">{METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-gray-100'}`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}
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
