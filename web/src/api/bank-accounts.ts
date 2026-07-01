import { api } from '../lib/api';

export interface BankAccount {
  id: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName?: string;
  isDefault: boolean;
  isVerified: boolean;
  status: string;
  createdAt: string;
}

export const bankAccountsApi = {
  list: (orgId: string, memberId: string) =>
    api.get<{ accounts: BankAccount[] }>(`/organizations/${orgId}/members/${memberId}/bank-accounts`)
      .then((r) => r.data.accounts),

  register: (orgId: string, memberId: string, data: { accountNumber: string; bankCode: string; bankName: string; isDefault: boolean }) =>
    api.post<{ account: BankAccount }>(`/organizations/${orgId}/members/${memberId}/bank-accounts`, data)
      .then((r) => r.data.account),

  verify: (orgId: string, accountId: string) =>
    api.post<{ account: BankAccount }>(`/organizations/${orgId}/bank-accounts/${accountId}/verify`)
      .then((r) => r.data.account),

  setDefault: (orgId: string, accountId: string) =>
    api.patch<{ account: BankAccount }>(`/organizations/${orgId}/bank-accounts/${accountId}`, { isDefault: true })
      .then((r) => r.data.account),

  remove: (orgId: string, accountId: string) =>
    api.delete(`/organizations/${orgId}/bank-accounts/${accountId}`).then((r) => r.data),
};
