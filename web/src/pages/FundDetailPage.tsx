import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fundsApi, FundRules } from '../api/funds';
import { fundMembersApi, FundMember } from '../api/fund-members';
import { orgsApi } from '../api/organizations';
import { formatKobo, formatDate } from '../lib/format';
import { LoadingState, ErrorState } from '../components/QueryStates';
import { hasRole, ORG_MANAGER_ROLES, FINANCE_ROLES } from '../lib/roles';
import { useToast } from '../context/ToastContext';

const CYCLE_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
};

const FUND_TYPE_LABELS: Record<string, string> = {
  annual_dues:            'Annual Dues',
  savings_fund:           'Savings Fund',
  welfare_fund:           'Welfare Fund',
  emergency_fund:         'Emergency Fund',
  building_fund:          'Building Fund',
  rotational_savings:     'Rotational Savings',
  investment_fund:        'Investment Fund',
};

const FUND_STATUS_LABELS: Record<string, string> = {
  draft:    'Draft',
  active:   'Active',
  inactive: 'Inactive',
  archived: 'Archived',
};

const CYCLE_STATUS_LABELS: Record<string, string> = {
  draft:     'Draft',
  active:    'Active',
  closed:    'Closed',
  cancelled: 'Cancelled',
};

const FREQUENCY_LABELS: Record<string, string> = {
  daily:     'Daily',
  weekly:    'Weekly',
  monthly:   'Monthly',
  quarterly: 'Quarterly',
  annually:  'Annually',
};

const PAYOUT_TRIGGER_LABELS: Record<string, string> = {
  all_paid:              'When all members have paid',
  cycle_closed:          'When cycle is closed',
  threshold_percentage:  'When collection threshold is met',
};

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly', 'annually'];
const PAYOUT_TRIGGERS = [
  { value: 'all_paid',              label: 'When all members have paid' },
  { value: 'cycle_closed',          label: 'When cycle is closed' },
  { value: 'threshold_percentage',  label: 'When collection % threshold is met' },
];

type RulesFormState = {
  contributionAmount: string;
  contributionFrequency: string;
  collectionDay: string;
  allowPartialPayment: boolean;
  payoutAllowed: boolean;
  payoutTrigger: string;
  payoutThresholdPct: string;
  approvalRequired: boolean;
  penaltyEnabled: boolean;
};

function defaultRulesForm(existing?: FundRules): RulesFormState {
  return {
    contributionAmount: existing ? String(existing.contributionAmount / 100) : '',
    contributionFrequency: existing?.contributionFrequency ?? 'monthly',
    collectionDay: existing?.collectionDay ? String(existing.collectionDay) : '',
    allowPartialPayment: existing?.allowPartialPayment ?? false,
    payoutAllowed: existing?.payoutAllowed ?? false,
    payoutTrigger: existing?.payoutTrigger ?? 'cycle_closed',
    payoutThresholdPct: existing ? '' : '',
    approvalRequired: existing?.approvalRequired ?? false,
    penaltyEnabled: false,
  };
}

function getMutationError(err: unknown): string {
  const e = err as { response?: { data?: { error?: string; message?: string } } };
  return e?.response?.data?.error ?? e?.response?.data?.message ?? 'Something went wrong. Please try again.';
}

export function FundDetailPage() {
  const { fundId } = useParams<{ fundId: string }>();
  const { activeOrg } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const orgId = activeOrg!.id;
  // Fund rules (create/configure) are Org Admin + Platform Admin only — backend restricts this too.
  const canManageRules = hasRole(activeOrg?.role, ORG_MANAGER_ROLES);
  // Collection cycle start/close/create is still Treasurer-inclusive, unchanged.
  const canManageCycles = hasRole(activeOrg?.role, FINANCE_ROLES);

  const { data: fund, isLoading: fundLoading, isError: fundError } = useQuery({
    queryKey: ['fund', orgId, fundId],
    queryFn: () => fundsApi.get(orgId, fundId!),
    enabled: !!fundId,
  });

  const { data: cycles = [] } = useQuery({
    queryKey: ['cycles', orgId, fundId],
    queryFn: () => fundsApi.listCycles(orgId, fundId!),
    enabled: !!fundId,
  });

  // Rules form
  const [showRulesForm, setShowRulesForm] = useState(false);
  const [rulesForm, setRulesForm] = useState<RulesFormState>(() => defaultRulesForm());
  const rf = (patch: Partial<RulesFormState>) => setRulesForm((f) => ({ ...f, ...patch }));

  const openRulesForm = () => {
    setRulesForm(defaultRulesForm(fund?.rules));
    setShowRulesForm(true);
  };

  const rulesMutation = useMutation({
    mutationFn: () => {
      const amountKobo = Math.round(parseFloat(rulesForm.contributionAmount) * 100);
      return fundsApi.upsertRules(orgId, fundId!, {
        contributionAmount: amountKobo,
        contributionFrequency: rulesForm.contributionFrequency as FundRules['contributionFrequency'],
        collectionDay: rulesForm.collectionDay ? Number(rulesForm.collectionDay) : undefined,
        allowPartialPayment: rulesForm.allowPartialPayment,
        payoutAllowed: rulesForm.payoutAllowed,
        payoutTrigger: rulesForm.payoutAllowed ? (rulesForm.payoutTrigger as FundRules['payoutTrigger']) : undefined,
        payoutThresholdPct: rulesForm.payoutTrigger === 'threshold_percentage' ? Number(rulesForm.payoutThresholdPct) : undefined,
        approvalRequired: rulesForm.approvalRequired,
        penaltyEnabled: rulesForm.penaltyEnabled,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fund', orgId, fundId] });
      setShowRulesForm(false);
      toast.success('Fund rules saved.');
    },
    onError: (err) => toast.error(getMutationError(err)),
  });

  // Cycle form
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [cycleForm, setCycleForm] = useState({ name: '', cycleNumber: 1, startDate: '', endDate: '' });

  const createCycleMutation = useMutation({
    mutationFn: () => fundsApi.createCycle(orgId, fundId!, {
      ...cycleForm,
      endDate: cycleForm.endDate || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles', orgId, fundId] });
      setShowCreateCycle(false);
      setCycleForm({ name: '', cycleNumber: 1, startDate: '', endDate: '' });
      toast.success('Collection cycle created.');
    },
    onError: (err) => toast.error(getMutationError(err)),
  });

  const startCycleMutation = useMutation({
    mutationFn: (cycleId: string) => fundsApi.startCycle(orgId, fundId!, cycleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles', orgId, fundId] });
      toast.success('Cycle started.');
    },
    onError: (err) => toast.error(getMutationError(err)),
  });

  const closeCycleMutation = useMutation({
    mutationFn: (cycleId: string) => fundsApi.closeCycle(orgId, fundId!, cycleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles', orgId, fundId] });
      toast.success('Cycle closed.');
    },
    onError: (err) => toast.error(getMutationError(err)),
  });

  if (fundLoading) return <LoadingState />;
  if (fundError || !fund) return <ErrorState />;

  const hasRules = !!fund.rules;

  return (
    <div className="space-y-8">
      {/* Fund header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{fund.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {FUND_TYPE_LABELS[fund.fundType] ?? fund.fundType} · {FUND_STATUS_LABELS[fund.status] ?? fund.status}
        </p>
        {fund.description && <p className="mt-2 text-gray-600">{fund.description}</p>}
      </div>

      {/* ── FUND RULES ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Fund Rules</h2>
          {canManageRules && hasRules && !showRulesForm && (
            <button onClick={openRulesForm}
              className="text-sm text-indigo-600 hover:text-indigo-800">
              Edit rules
            </button>
          )}
        </div>

        {!hasRules && !showRulesForm && (
          <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">No rules configured yet</p>
            <p className="mt-1 text-sm text-amber-700">
              Fund rules define contribution amounts, frequency, and payout settings.
              {canManageRules ? ' You must configure rules before creating a collection cycle.' : ' Contact your administrator to configure fund rules.'}
            </p>
            {canManageRules && (
              <button onClick={openRulesForm}
                className="mt-3 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
                Configure rules →
              </button>
            )}
          </div>
        )}

        {hasRules && !showRulesForm && (
          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Contribution: </span>
              <span className="font-medium">
                {formatKobo(fund.rules!.contributionAmount)} / {FREQUENCY_LABELS[fund.rules!.contributionFrequency] ?? fund.rules!.contributionFrequency}
              </span>
            </div>
            {fund.rules!.collectionDay && (
              <div>
                <span className="text-gray-500">Collection day: </span>
                <span className="font-medium">Day {fund.rules!.collectionDay} of each period</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Partial payment: </span>
              <span className="font-medium">{fund.rules!.allowPartialPayment ? 'Allowed' : 'Not allowed'}</span>
            </div>
            <div>
              <span className="text-gray-500">Payout: </span>
              <span className="font-medium">
                {fund.rules!.payoutAllowed
                  ? (fund.rules!.payoutTrigger === 'threshold_percentage'
                      ? `Enabled · when ${fund.rules!.payoutThresholdPct ?? '?'}% collected`
                      : `Enabled · ${PAYOUT_TRIGGER_LABELS[fund.rules!.payoutTrigger ?? ''] ?? 'enabled'}`)
                  : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Approval required: </span>
              <span className="font-medium">{fund.rules!.approvalRequired ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500">Late penalty: </span>
              <span className="font-medium">{fund.rules!.penaltyEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        )}

        {showRulesForm && (
          <form
            onSubmit={(e) => { e.preventDefault(); rulesMutation.mutate(); }}
            className="mt-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contribution amount (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="1" step="0.01"
                  value={rulesForm.contributionAmount}
                  onChange={(e) => rf({ contributionAmount: e.target.value })}
                  placeholder="e.g. 5000"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <p className="mt-0.5 text-xs text-gray-400">Amount in Naira — stored as Kobo</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={rulesForm.contributionFrequency}
                  onChange={(e) => rf({ contributionFrequency: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Collection day (optional)</label>
              <input
                type="number" min="1" max="31"
                value={rulesForm.collectionDay}
                onChange={(e) => rf({ collectionDay: e.target.value })}
                placeholder="e.g. 1 (first of the month)"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={rulesForm.allowPartialPayment}
                  onChange={(e) => rf({ allowPartialPayment: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600" />
                Allow partial payments
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={rulesForm.approvalRequired}
                  onChange={(e) => rf({ approvalRequired: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600" />
                Require approval for payouts
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={rulesForm.penaltyEnabled}
                  onChange={(e) => rf({ penaltyEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600" />
                Enable late payment penalties
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={rulesForm.payoutAllowed}
                  onChange={(e) => rf({ payoutAllowed: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600" />
                Enable payouts
              </label>
            </div>

            {rulesForm.payoutAllowed && (
              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payout trigger</label>
                  <select
                    value={rulesForm.payoutTrigger}
                    onChange={(e) => rf({ payoutTrigger: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {PAYOUT_TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {rulesForm.payoutTrigger === 'threshold_percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Collection threshold % <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" min="1" max="100"
                      value={rulesForm.payoutThresholdPct}
                      onChange={(e) => rf({ payoutThresholdPct: e.target.value })}
                      placeholder="e.g. 80"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={rulesMutation.isPending || !rulesForm.contributionAmount}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {rulesMutation.isPending ? 'Saving…' : 'Save rules'}
              </button>
              <button type="button" onClick={() => { setShowRulesForm(false); rulesMutation.reset(); }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── COLLECTION CYCLES ── */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Collection Cycles</h2>
          {canManageCycles && hasRules && (
            <button
              onClick={() => setShowCreateCycle(true)}
              disabled={showCreateCycle}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              New Cycle
            </button>
          )}
        </div>

        {canManageRules && !hasRules && (
          <p className="mt-2 text-sm text-amber-700">Configure fund rules above before creating a collection cycle.</p>
        )}

        {showCreateCycle && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-medium text-gray-800">New Collection Cycle</h3>
            <div className="grid grid-cols-2 gap-3">
              <input value={cycleForm.name} onChange={(e) => setCycleForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Cycle name (e.g. June 2026)"
                className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <input type="number" value={cycleForm.cycleNumber}
                onChange={(e) => setCycleForm((f) => ({ ...f, cycleNumber: Number(e.target.value) }))}
                placeholder="Cycle #" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <input type="date" value={cycleForm.startDate}
                onChange={(e) => setCycleForm((f) => ({ ...f, startDate: e.target.value }))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <input type="date" value={cycleForm.endDate}
                onChange={(e) => setCycleForm((f) => ({ ...f, endDate: e.target.value }))}
                placeholder="End date (optional)" className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => createCycleMutation.mutate()}
                disabled={!cycleForm.name || !cycleForm.startDate || createCycleMutation.isPending}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {createCycleMutation.isPending ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => { setShowCreateCycle(false); createCycleMutation.reset(); }}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {cycles.length === 0 ? (
            <p className="text-sm text-gray-400">
              {canManageCycles && hasRules
                ? 'No collection cycles yet. Create your first one above.'
                : canManageRules
                ? 'Configure fund rules before creating a collection cycle.'
                : 'No collection cycles have been started yet.'}
            </p>
          ) : cycles.map((cycle) => (
            <div key={cycle.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800">{cycle.name}</p>
                  <p className="text-xs text-gray-400">#{cycle.cycleNumber} · {formatDate(cycle.startDate!)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CYCLE_STATUS_COLORS[cycle.status] ?? 'bg-gray-100'}`}>
                    {CYCLE_STATUS_LABELS[cycle.status] ?? cycle.status}
                  </span>
                  {canManageCycles && cycle.status === 'draft' && (
                    <button onClick={() => startCycleMutation.mutate(cycle.id)}
                      disabled={startCycleMutation.isPending}
                      className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60">
                      Start
                    </button>
                  )}
                  {canManageCycles && cycle.status === 'active' && (
                    <button onClick={() => closeCycleMutation.mutate(cycle.id)}
                      disabled={closeCycleMutation.isPending}
                      className="rounded-md bg-gray-600 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-60">
                      Close
                    </button>
                  )}
                </div>
              </div>
              {cycle.progress && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>{cycle.progress.paid}/{cycle.progress.total} paid</span>
                    <span>{cycle.progress.percentagePaid}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200">
                    <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${cycle.progress.percentagePaid}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>Collected: {formatKobo(cycle.progress.totalCollected)}</span>
                    <span>Expected: {formatKobo(cycle.progress.totalExpected)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── FUND MEMBERS ── */}
      <FundMembersSection orgId={orgId} fundId={fundId!} fundType={fund.fundType} />
    </div>
  );
}

function FundMembersSection({ orgId, fundId, fundType }: { orgId: string; fundId: string; fundType: string }) {
  const qc = useQueryClient();
  const { activeOrg } = useAuth();
  const isAdmin = ['organization_admin', 'treasurer', 'platform_admin'].includes(activeOrg?.role ?? '');

  const { data: fundMembers = [], isLoading } = useQuery({
    queryKey: ['fund-members', orgId, fundId],
    queryFn: () => fundMembersApi.list(orgId, fundId),
  });

  const { data: orgMembers = [] } = useQuery({
    queryKey: ['members', orgId],
    queryFn: () => orgsApi.members(orgId),
    enabled: isAdmin,
  });

  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ orgMemberId: '', rotationPosition: '' });
  const [enrollError, setEnrollError] = useState('');

  const enrollMutation = useMutation({
    mutationFn: () => fundMembersApi.enroll(orgId, fundId, {
      orgMemberId: enrollForm.orgMemberId,
      rotationPosition: enrollForm.rotationPosition ? Number(enrollForm.rotationPosition) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fund-members', orgId, fundId] });
      setShowEnroll(false);
      setEnrollForm({ orgMemberId: '', rotationPosition: '' });
      setEnrollError('');
    },
    onError: (err) => {
      setEnrollError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to enroll member.');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => fundMembersApi.remove(orgId, fundId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fund-members', orgId, fundId] }),
  });

  const enrolledOrgMemberIds = new Set(fundMembers.map((fm: FundMember) => fm.orgMemberId));
  const eligibleOrgMembers = orgMembers.filter((m) => !enrolledOrgMemberIds.has(m.id) && m.status === 'active');
  const isRotational = fundType === 'rotational_savings';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Fund Members</h2>
        {isAdmin && (
          <button
            onClick={() => setShowEnroll(true)}
            disabled={showEnroll || eligibleOrgMembers.length === 0}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Enroll member
          </button>
        )}
      </div>

      {showEnroll && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-medium text-gray-800">Enroll member into this fund</h3>
          {enrollError && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{enrollError}</div>
          )}
          <div className="flex gap-3">
            <select
              value={enrollForm.orgMemberId}
              onChange={(e) => setEnrollForm((f) => ({ ...f, orgMemberId: e.target.value }))}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select member…</option>
              {eligibleOrgMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user.firstName} {m.user.lastName} ({m.user.email})
                </option>
              ))}
            </select>
            {isRotational && (
              <input
                type="number"
                min={1}
                value={enrollForm.rotationPosition}
                onChange={(e) => setEnrollForm((f) => ({ ...f, rotationPosition: e.target.value }))}
                placeholder="Rotation #"
                className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={!enrollForm.orgMemberId || enrollMutation.isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {enrollMutation.isPending ? 'Enrolling…' : 'Enroll'}
            </button>
            <button onClick={() => { setShowEnroll(false); setEnrollError(''); }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        {isLoading ? (
          <LoadingState />
        ) : fundMembers.length === 0 ? (
          <p className="text-sm text-gray-400">No members enrolled in this fund yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  {isRotational && <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Position</th>}
                  <th scope="col" className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                  {isAdmin && <th scope="col" className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fundMembers.map((fm: FundMember) => (
                  <tr key={fm.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {fm.orgMember.user.firstName} {fm.orgMember.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{fm.orgMember.user.email}</td>
                    {isRotational && (
                      <td className="px-4 py-3 text-center text-gray-600">
                        {fm.rotationPosition ?? '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        fm.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {fm.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { if (confirm('Remove this member from the fund?')) removeMutation.mutate(fm.id); }}
                          disabled={removeMutation.isPending}
                          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </td>
                    )}
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
