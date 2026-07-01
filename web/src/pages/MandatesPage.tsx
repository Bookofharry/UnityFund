import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orgsApi } from '../api/organizations';
import { mandatesApi, Mandate } from '../api/mandates';
import { formatKobo, formatDate } from '../lib/format';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-orange-100 text-orange-700',
  deleted: 'bg-red-100 text-red-600',
  expired: 'bg-gray-100 text-gray-500',
};

interface SetupForm {
  maxAmountNaira: string;
  frequency: string;
  startDate: string;
  endDate: string;
}

const today = new Date().toISOString().split('T')[0];
const EMPTY_FORM: SetupForm = { maxAmountNaira: '', frequency: 'monthly', startDate: today, endDate: '' };

export function MandatesPage() {
  const { activeOrg } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SetupForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get current user's org member ID
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['org-detail', activeOrg?.id],
    queryFn: () => orgsApi.get(activeOrg!.id),
    enabled: !!activeOrg,
  });
  const memberId = orgData?.membership?.id;

  const { data: mandates = [], isLoading, isError } = useQuery({
    queryKey: ['mandates', activeOrg?.id, memberId],
    queryFn: () => mandatesApi.list(activeOrg!.id, memberId!),
    enabled: !!activeOrg && !!memberId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['mandates'] });

  const initiateMutation = useMutation({
    mutationFn: (data: { maxAmount: number; frequency: string; startDate: string; endDate?: string }) =>
      mandatesApi.initiate(activeOrg!.id, memberId!, data),
    onSuccess: () => {
      setShowForm(false);
      setForm(EMPTY_FORM);
      setFormError('');
      invalidate();
      setSuccessMessage('Mandate created. Your bank will send a confirmation code to the phone number on file — approve it there to activate the mandate.');
      setTimeout(() => setSuccessMessage(''), 8000);
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const suspendMutation = useMutation({
    mutationFn: (mandateId: string) => mandatesApi.suspend(activeOrg!.id, mandateId),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (mandateId: string) => mandatesApi.cancel(activeOrg!.id, mandateId),
    onSuccess: invalidate,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const maxAmountNaira = parseFloat(form.maxAmountNaira);
    if (!maxAmountNaira || maxAmountNaira <= 0) {
      setFormError('Enter a valid maximum amount.');
      return;
    }
    if (!form.startDate) { setFormError('Start date is required.'); return; }

    initiateMutation.mutate({
      maxAmount: Math.round(maxAmountNaira * 100), // convert Naira → Kobo
      frequency: form.frequency,
      startDate: form.startDate,
      ...(form.endDate ? { endDate: form.endDate } : {}),
    });
  }

  if (!activeOrg) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Direct Debit Mandates</h1>
          <p className="mt-1 text-sm text-gray-500">Authorize automatic deductions for contributions</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Set Up Mandate
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>
      )}

      {/* Setup form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-gray-800">New Direct Debit Mandate</h2>
          <p className="mb-4 text-sm text-gray-500">
            Debits will be pulled from your verified default bank account. Don't have one yet?{' '}
            <Link to="/bank-accounts" className="font-medium text-indigo-600 hover:underline">Add one first →</Link>
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum amount per debit (₦)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={form.maxAmountNaira}
                onChange={(e) => setForm((f) => ({ ...f, maxAmountNaira: e.target.value }))}
                required
                placeholder="e.g. 5000"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start date</label>
              <input
                type="date"
                min={today}
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End date <span className="font-normal text-gray-400">(optional)</span></label>
              <input
                type="date"
                min={form.startDate || today}
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={initiateMutation.isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {initiateMutation.isPending ? 'Creating…' : 'Create Mandate'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Mandate list */}
      <div className="mt-6">
        {orgLoading || isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState />
        ) : mandates.length === 0 ? (
          <EmptyState message="No mandates yet. Set up a direct debit mandate to enable automatic contributions." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Max Amount</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Frequency</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Start Date</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">End Date</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                  <th scope="col" className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mandates.map((m: Mandate) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{formatKobo(m.maxAmount)}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{m.frequency}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(m.startDate)}</td>
                    <td className="px-4 py-3 text-gray-500">{m.endDate ? formatDate(m.endDate) : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[m.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        {m.status === 'active' && (
                          <button
                            onClick={() => suspendMutation.mutate(m.id)}
                            disabled={suspendMutation.isPending}
                            className="text-xs font-medium text-yellow-600 hover:underline disabled:opacity-60"
                          >
                            Suspend
                          </button>
                        )}
                        {['active', 'pending', 'suspended'].includes(m.status) && (
                          <button
                            onClick={() => {
                              if (confirm('Cancel this mandate? This cannot be undone.')) {
                                cancelMutation.mutate(m.id);
                              }
                            }}
                            disabled={cancelMutation.isPending}
                            className="text-xs font-medium text-red-500 hover:underline disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        )}
                        {m.status === 'pending' && (
                          <span className="text-xs text-gray-400">Awaiting bank confirmation</span>
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
    </div>
  );
}
