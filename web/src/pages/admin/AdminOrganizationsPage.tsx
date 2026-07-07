import { useQuery } from '@tanstack/react-query';
import { orgsApi } from '../../api/organizations';
import { LoadingState, ErrorState, EmptyState } from '../../components/QueryStates';

export function AdminOrganizationsPage() {
  const { data: organizations = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => orgsApi.listAll(),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Organizations</h1>
      <p className="mt-1 text-sm text-slate-400">All organizations on the platform</p>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : organizations.length === 0 ? (
        <EmptyState message="No organizations yet." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-700 bg-slate-800">
          <table className="w-full min-w-[600px] text-sm text-slate-200">
            <thead className="border-b border-slate-700 bg-slate-900/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium text-slate-400">Name</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-slate-400">Type</th>
                <th scope="col" className="px-4 py-3 text-center font-medium text-slate-400">Status</th>
                <th scope="col" className="px-4 py-3 text-center font-medium text-slate-400">Members</th>
                <th scope="col" className="px-4 py-3 text-center font-medium text-slate-400">Funds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-4 py-3 font-medium">{org.name}</td>
                  <td className="px-4 py-3 text-slate-400">{org.organizationType}</td>
                  <td className="px-4 py-3 text-center">{org.status}</td>
                  <td className="px-4 py-3 text-center">{org._count.members}</td>
                  <td className="px-4 py-3 text-center">{org._count.funds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
