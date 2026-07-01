import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatKobo } from '../lib/format';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';

interface FundSummary {
  id: string;
  name: string;
  fundType: string;
  status: string;
  memberCount: number;
  cycleCount: number;
  activeCycleId: string | null;
  totalCollectedKobo: number;
}

const FUND_TYPE_LABELS: Record<string, string> = {
  annual_dues: 'Annual Dues',
  savings_fund: 'Savings Fund',
  welfare_fund: 'Welfare Fund',
  emergency_fund: 'Emergency Fund',
  building_fund: 'Building Fund',
  rotational_savings: 'Rotational Savings',
  investment_fund: 'Investment Fund',
};

export function ReportsPage() {
  const { activeOrg } = useAuth();
  const orgId = activeOrg?.id ?? '';

  const { data: funds = [], isLoading, isError } = useQuery({
    queryKey: ['reports', 'fund-summary', orgId],
    queryFn: () =>
      api.get<{ funds: FundSummary[] }>(`/organizations/${orgId}/reports/fund-summary`)
        .then((r) => r.data.funds),
    enabled: !!orgId,
  });

  if (!activeOrg) return null;

  const totalCollected = funds.reduce((s, f) => s + f.totalCollectedKobo, 0);
  const activeFunds = funds.filter((f) => f.status === 'active').length;
  const totalMembers = funds.reduce((s, f) => s + f.memberCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Financial summary for {activeOrg.name}</p>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : funds.length === 0 ? (
        <EmptyState message="No funds yet. Create a fund to start tracking financials." />
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Collected (all time)', value: formatKobo(totalCollected) },
              { label: 'Active Funds', value: activeFunds },
              { label: 'Total Fund Enrollments', value: totalMembers },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Fund-by-fund table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-800">Fund Summary</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Fund</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Members</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Cycles</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-gray-500">Total Collected</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {funds.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{f.name}</td>
                    <td className="px-4 py-3 text-gray-500">{FUND_TYPE_LABELS[f.fundType] ?? f.fundType}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{f.memberCount}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{f.cycleCount}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{formatKobo(f.totalCollectedKobo)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        f.status === 'active' ? 'bg-green-100 text-green-700' :
                        f.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
