import { api } from '../lib/api';

export interface Organization {
  id: string;
  name: string;
  organizationType: string;
  email?: string;
  status: string;
}

export interface OrgMember {
  id: string;
  role: string;
  status: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export interface OrganizationWithCounts extends Organization {
  _count: { members: number; funds: number };
}

export const orgsApi = {
  listAll: () =>
    api.get<{ organizations: OrganizationWithCounts[] }>('/organizations/admin/all')
      .then((r) => r.data.organizations),

  create: (data: { name: string; organizationType: string; email: string; phone?: string }) =>
    api.post<{ organization: Organization; membership: { id: string; role: string } }>('/organizations', data)
      .then((r) => r.data),

  list: () =>
    api.get<{ organizations: Array<{ organization: Organization; role: string; status: string }> }>('/organizations')
      .then((r) => r.data.organizations),

  get: (orgId: string) =>
    api.get<{ organization: Organization; membership: OrgMember }>(`/organizations/${orgId}`)
      .then((r) => r.data),

  dashboard: (orgId: string) =>
    api.get<{ activeFunds: number; activeCycles: number; totalCollectedKobo: number; totalOutstandingKobo: number }>(
      `/organizations/${orgId}/dashboard`,
    ).then((r) => r.data),

  update: (orgId: string, data: { name?: string; email?: string; phone?: string }) =>
    api.patch<{ organization: Organization }>(`/organizations/${orgId}`, data).then((r) => r.data.organization),

  members: (orgId: string) =>
    api.get<{ members: OrgMember[] }>(`/organizations/${orgId}/members`).then((r) => r.data.members),

  updateMemberRole: (orgId: string, memberId: string, role: string) =>
    api.patch(`/organizations/${orgId}/members/${memberId}`, { role }).then((r) => r.data),

  removeMember: (orgId: string, memberId: string) =>
    api.delete(`/organizations/${orgId}/members/${memberId}`).then((r) => r.data),
};
