import { api } from '../lib/api';

export interface Mandate {
  id: string;
  maxAmount: number;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: string;
  setupUrl?: string;
  providerMandateId?: string;
  createdAt: string;
}

export const mandatesApi = {
  list: (orgId: string, memberId: string) =>
    api.get<{ mandates: Mandate[] }>(`/organizations/${orgId}/members/${memberId}/mandates`)
      .then((r) => r.data.mandates),

  initiate: (orgId: string, memberId: string, data: { maxAmount: number; frequency: string; startDate: string; endDate?: string }) =>
    api.post<{ mandate: Mandate; setupUrl: string }>(`/organizations/${orgId}/members/${memberId}/mandates`, data)
      .then((r) => r.data),

  suspend: (orgId: string, mandateId: string) =>
    api.post(`/organizations/${orgId}/mandates/${mandateId}/suspend`).then((r) => r.data),

  cancel: (orgId: string, mandateId: string) =>
    api.post(`/organizations/${orgId}/mandates/${mandateId}/cancel`).then((r) => r.data),
};
