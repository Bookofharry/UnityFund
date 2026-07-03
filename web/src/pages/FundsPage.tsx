import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fundsApi, Fund } from '../api/funds';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';
import { hasRole, ORG_MANAGER_ROLES } from '../lib/roles';
import { useToast, getErrorMessage } from '../context/ToastContext';

const FUND_TYPE_LABELS: Record<string, string> = {
  annual_dues: 'Annual Dues',
  savings_fund: 'Savings Fund',
  welfare_fund: 'Welfare Fund',
  emergency_fund: 'Emergency Fund',
  building_fund: 'Building Fund',
  rotational_savings: 'Rotational Savings',
  investment_fund: 'Investment Fund',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-500',
  archived: 'bg-red-100 text-red-600',
};

export function FundsPage() {
  const { activeOrg } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const isAdmin = hasRole(activeOrg?.role, ORG_MANAGER_ROLES);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', fundType: 'savings_fund', description: '' });

  const { data: funds = [], isLoading, isError } = useQuery({
    queryKey: ['funds', activeOrg?.id],
    queryFn: () => fundsApi.list(activeOrg!.id),
    enabled: !!activeOrg,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => fundsApi.create(activeOrg!.id, data),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['funds', activeOrg?.id] });
      setShowCreate(false);
      setForm({ name: '', fundType: 'savings_fund', description: '' });
      toast.success(`"${created.name}" fund created.`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to create fund'));
    },
  });

  if (!activeOrg) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Funds</h1>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            New Fund
          </button>
        )}
      </div>

      {isAdmin && showCreate && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">Create Fund</h2>
          <div className="space-y-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Fund name" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <select value={form.fundType} onChange={(e) => setForm((f) => ({ ...f, fundType: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              {Object.entries(FUND_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)" rows={2}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreate(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : funds.length === 0 ? (
        <EmptyState message="No funds yet. Create your first fund above." />
      ) : (
        <div className="mt-6 space-y-3">
          {funds.map((fund: Fund) => (
            <button key={fund.id}
              onClick={() => navigate(`/funds/${fund.id}`)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-left">
              <div>
                <p className="font-semibold text-gray-800">{fund.name}</p>
                <p className="text-sm text-gray-500">{FUND_TYPE_LABELS[fund.fundType] ?? fund.fundType}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[fund.status] ?? 'bg-gray-100'}`}>
                {fund.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
