import { api } from '../lib/api';

export interface Fund {
  id: string;
  name: string;
  fundType: string;
  description?: string;
  status: string;
  rules?: FundRules;
}

export interface FundRules {
  id: string;
  contributionAmount: number;
  contributionFrequency: string;
  collectionDay?: number;
  allowPartialPayment: boolean;
  payoutAllowed: boolean;
  payoutTrigger?: string;
  payoutThresholdPct?: number;
  approvalRequired: boolean;
  penaltyEnabled: boolean;
}

export interface CollectionCycle {
  id: string;
  name: string;
  cycleNumber: number;
  status: string;
  startDate?: string;
  endDate?: string;
  snapshotContributionAmount?: number;
  progress?: {
    total: number; paid: number; overdue: number; outstanding: number;
    totalExpected: number; totalCollected: number; percentagePaid: number;
  };
}

export const fundsApi = {
  list: (orgId: string) =>
    api.get<{ funds: Fund[] }>(`/organizations/${orgId}/funds`).then((r) => r.data.funds),

  get: (orgId: string, fundId: string) =>
    api.get<{ fund: Fund }>(`/organizations/${orgId}/funds/${fundId}`).then((r) => r.data.fund),

  create: (orgId: string, data: { name: string; fundType: string; description?: string }) =>
    api.post<{ fund: Fund }>(`/organizations/${orgId}/funds`, data).then((r) => r.data.fund),

  getRules: (orgId: string, fundId: string) =>
    api.get<{ rules: FundRules }>(`/organizations/${orgId}/funds/${fundId}/rules`).then((r) => r.data.rules),

  upsertRules: (orgId: string, fundId: string, data: Partial<FundRules>) =>
    api.post<{ rules: FundRules }>(`/organizations/${orgId}/funds/${fundId}/rules`, data).then((r) => r.data.rules),

  listCycles: (orgId: string, fundId: string) =>
    api.get<{ cycles: CollectionCycle[] }>(`/organizations/${orgId}/funds/${fundId}/collection-cycles`)
      .then((r) => r.data.cycles),

  getCycle: (orgId: string, fundId: string, cycleId: string) =>
    api.get<{ cycle: CollectionCycle }>(`/organizations/${orgId}/funds/${fundId}/collection-cycles/${cycleId}`)
      .then((r) => r.data.cycle),

  createCycle: (orgId: string, fundId: string, data: { name: string; cycleNumber: number; startDate: string; endDate?: string }) =>
    api.post<{ cycle: CollectionCycle }>(`/organizations/${orgId}/funds/${fundId}/collection-cycles`, data)
      .then((r) => r.data.cycle),

  startCycle: (orgId: string, fundId: string, cycleId: string) =>
    api.post<{ cycle: CollectionCycle }>(`/organizations/${orgId}/funds/${fundId}/collection-cycles/${cycleId}/start`)
      .then((r) => r.data.cycle),

  closeCycle: (orgId: string, fundId: string, cycleId: string) =>
    api.post<{ cycle: CollectionCycle }>(`/organizations/${orgId}/funds/${fundId}/collection-cycles/${cycleId}/close`)
      .then((r) => r.data.cycle),
};
