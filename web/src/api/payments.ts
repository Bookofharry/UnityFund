import { api } from '../lib/api';

export interface Payment {
  id: string;
  contributionId: string;
  organizationId: string;
  fundId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  provider: string;
  providerReference?: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export const paymentsApi = {
  list: (orgId: string, filters?: { fundId?: string; contributionId?: string }) =>
    api.get<{ payments: Payment[] }>(`/organizations/${orgId}/payments`, { params: filters })
      .then((r) => r.data.payments),

  get: (orgId: string, paymentId: string) =>
    api.get<{ payment: Payment }>(`/organizations/${orgId}/payments/${paymentId}`)
      .then((r) => r.data.payment),
};
