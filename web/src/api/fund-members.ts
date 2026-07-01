import { api } from '../lib/api';

export interface FundMember {
  id: string;
  orgMemberId: string;
  rotationPosition?: number;
  status: string;
  joinedAt: string;
  orgMember: {
    id: string;
    role: string;
    user: { id: string; firstName: string; lastName: string; email: string };
  };
}

export const fundMembersApi = {
  list: (orgId: string, fundId: string) =>
    api.get<{ members: FundMember[] }>(`/organizations/${orgId}/funds/${fundId}/members`)
      .then((r) => r.data.members),

  enroll: (orgId: string, fundId: string, data: { orgMemberId: string; rotationPosition?: number }) =>
    api.post<{ fundMember: FundMember }>(`/organizations/${orgId}/funds/${fundId}/members`, data)
      .then((r) => r.data.fundMember),

  remove: (orgId: string, fundId: string, fundMemberId: string) =>
    api.delete(`/organizations/${orgId}/funds/${fundId}/members/${fundMemberId}`),
};
