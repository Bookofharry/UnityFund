import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { contributionsApi, Contribution } from '../api/contributions';
import { formatKobo, formatDate } from '../lib/format';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-600',
};

export function ContributionsPage() {
  const { activeOrg } = useAuth();

  const { data: contributions = [], isLoading, isError } = useQuery({
    queryKey: ['contributions', activeOrg?.id],
    queryFn: () => contributionsApi.list(activeOrg!.id),
    enabled: !!activeOrg,
  });

  const payMutation = useMutation({
    mutationFn: (contributionId: string) =>
      contributionsApi.initiatePayment(activeOrg!.id, contributionId, { paymentMethod: 'checkout' }),
    onSuccess: (data) => {
      if (data.checkoutUrl) window.open(data.checkoutUrl, '_blank');
    },
  });

  if (!activeOrg) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
      <p className="mt-1 text-sm text-gray-500">Track all member contributions across cycles</p>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : contributions.length === 0 ? (
        <EmptyState message="No contributions found. Start a collection cycle to generate contributions." />
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Member</th>
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
                    {['pending', 'partial', 'overdue'].includes(c.status) && c.collectionCycle.status === 'active' && (
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
      )}
    </div>
  );
}
