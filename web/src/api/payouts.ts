import { api } from '../lib/api';

export const payoutsApi = {
  approve: (orgId: string, payoutId: string, note?: string) =>
    api.post(`/organizations/${orgId}/payouts/${payoutId}/approve`, { note })
      .then((r) => r.data),

  execute: (orgId: string, payoutId: string) =>
    api.post(`/organizations/${orgId}/payouts/${payoutId}/execute`)
      .then((r) => r.data),
};
