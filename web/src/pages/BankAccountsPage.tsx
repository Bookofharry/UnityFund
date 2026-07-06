import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { orgsApi } from '../api/organizations';
import { bankAccountsApi, BankAccount } from '../api/bank-accounts';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';
import { useToast, getErrorMessage } from '../context/ToastContext';
import { hasRole, FINANCE_ROLES } from '../lib/roles';

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank' },
  { code: '023', name: 'Citibank' },
  { code: '063', name: 'Diamond Bank' },
  { code: '050', name: 'EcoBank' },
  { code: '011', name: 'First Bank' },
  { code: '214', name: 'FCMB' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '058', name: 'GTBank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Moniepoint' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'ProvidusBank' },
  { code: '221', name: 'Stanbic IBTC' },
  { code: '068', name: 'Standard Chartered' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'SunTrust Bank' },
  { code: '032', name: 'Union Bank' },
  { code: '033', name: 'UBA' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

interface AddAccountForm {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddAccountForm = { accountNumber: '', bankCode: '', bankName: '', isDefault: false };

export function BankAccountsPage() {
  const { activeOrg } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  // Verify/set-default/remove are Org Admin & Treasurer only, even on your own
  // account — a member can register a bank account but an admin/treasurer
  // must verify it before it's usable for payouts.
  const canManage = hasRole(activeOrg?.role, FINANCE_ROLES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddAccountForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // Get current user's org member ID
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['org-detail', activeOrg?.id],
    queryFn: () => orgsApi.get(activeOrg!.id),
    enabled: !!activeOrg,
  });
  const memberId = orgData?.membership?.id;

  const { data: accounts = [], isLoading, isError } = useQuery({
    queryKey: ['bank-accounts', activeOrg?.id, memberId],
    queryFn: () => bankAccountsApi.list(activeOrg!.id, memberId!),
    enabled: !!activeOrg && !!memberId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['bank-accounts'] });

  const addMutation = useMutation({
    mutationFn: (data: AddAccountForm) => bankAccountsApi.register(activeOrg!.id, memberId!, data),
    onSuccess: () => {
      setShowForm(false);
      setForm(EMPTY_FORM);
      invalidate();
      toast.success('Bank account added.');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to add bank account.'),
  });

  const verifyMutation = useMutation({
    mutationFn: (accountId: string) => bankAccountsApi.verify(activeOrg!.id, accountId),
    onSuccess: () => { invalidate(); toast.success('Bank account verified.'); },
    onError: (err) => toast.error(getErrorMessage(err, 'Verification failed.')),
  });

  const defaultMutation = useMutation({
    mutationFn: (accountId: string) => bankAccountsApi.setDefault(activeOrg!.id, accountId),
    onSuccess: () => { invalidate(); toast.success('Default account updated.'); },
    onError: (err) => toast.error(getErrorMessage(err, 'Action failed.')),
  });

  const removeMutation = useMutation({
    mutationFn: (accountId: string) => bankAccountsApi.remove(activeOrg!.id, accountId),
    onSuccess: () => { invalidate(); toast.success('Bank account removed.'); },
    onError: (err) => toast.error(getErrorMessage(err, 'Action failed.')),
  });

  function handleBankCodeChange(code: string) {
    const bank = NIGERIAN_BANKS.find((b) => b.code === code);
    setForm((f) => ({ ...f, bankCode: code, bankName: bank?.name ?? f.bankName }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (form.accountNumber.length !== 10) {
      setFormError('Account number must be exactly 10 digits.');
      return;
    }
    if (!form.bankCode) { setFormError('Please select a bank.'); return; }
    addMutation.mutate(form);
  }

  if (!activeOrg) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the bank account used to receive payouts</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Bank Account
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">Add Bank Account</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank</label>
              <select
                value={form.bankCode}
                onChange={(e) => handleBankCodeChange(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select bank…</option>
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '') }))}
                required
                placeholder="0123456789"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              id="isDefault"
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default payout account</label>
          </div>

          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {addMutation.isPending ? 'Saving…' : 'Save Account'}
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

      {/* List */}
      <div className="mt-6">
        {orgLoading || isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState />
        ) : accounts.length === 0 ? (
          <EmptyState message="No bank accounts yet. Add one to receive payouts." />
        ) : (
          <div className="space-y-3">
            {accounts.map((acc: BankAccount) => (
              <div key={acc.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">
                      {acc.bankName} — {acc.accountNumber}
                    </p>
                    {acc.isDefault && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Default</span>
                    )}
                    {acc.isVerified ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Verified</span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Unverified</span>
                    )}
                  </div>
                  {acc.accountName && (
                    <p className="mt-0.5 text-sm text-gray-500">{acc.accountName}</p>
                  )}
                  {!acc.isVerified && !canManage && (
                    <p className="mt-0.5 text-xs text-gray-400">Awaiting verification by your organization's Treasurer or Admin.</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!acc.isVerified && canManage && (
                    <button
                      onClick={() => verifyMutation.mutate(acc.id)}
                      disabled={verifyMutation.isPending}
                      className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-60"
                    >
                      Verify
                    </button>
                  )}
                  {!acc.isDefault && acc.isVerified && canManage && (
                    <button
                      onClick={() => defaultMutation.mutate(acc.id)}
                      disabled={defaultMutation.isPending}
                      className="text-xs font-medium text-gray-600 hover:underline disabled:opacity-60"
                    >
                      Set default
                    </button>
                  )}
                  {canManage && (
                    <button
                      onClick={() => {
                        if (confirm('Remove this bank account?')) removeMutation.mutate(acc.id);
                      }}
                      disabled={removeMutation.isPending}
                      className="text-xs font-medium text-red-500 hover:underline disabled:opacity-60"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
