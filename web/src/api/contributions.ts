import { api } from '../lib/api';

export interface Contribution {
  id: string;
  expectedAmount: number;
  paidAmount: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  fundMember: {
    id: string;
    rotationPosition?: number;
    orgMember: { user: { id: string; firstName: string; lastName: string; email: string } };
  };
  collectionCycle: {
    id: string;
    name: string;
    cycleNumber: number;
    status: string;
    fundId: string;
    fund: { id: string; name: string };
  };
}

export const contributionsApi = {
  list: (orgId: string, filters?: { fundId?: string; cycleId?: string; status?: string }) =>
    api.get<{ contributions: Contribution[] }>(`/organizations/${orgId}/contributions`, { params: filters })
      .then((r) => r.data.contributions),

  get: (orgId: string, contributionId: string) =>
    api.get<{ contribution: Contribution }>(`/organizations/${orgId}/contributions/${contributionId}`)
      .then((r) => r.data.contribution),

  initiatePayment: (orgId: string, contributionId: string, data: { paymentMethod: string; mandateId?: string }) =>
    api.post<{ payment: unknown; checkoutUrl?: string }>(
      `/organizations/${orgId}/contributions/${contributionId}/payments`, data,
    ).then((r) => r.data),
};
