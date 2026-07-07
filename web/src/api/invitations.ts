import { api } from '../lib/api';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedByName?: string;
}

export interface InviteValidation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  organization: { id: string; name: string };
  requiresRegistration: boolean;
}

export const invitationsApi = {
  // Resolves with the invitation on success; rejects (axios error) if invalid/expired/etc.
  validate: (token: string) =>
    api.get<{ invitation: InviteValidation }>(`/invitations/${token}`).then((r) => r.data.invitation),

  accept: (token: string, data?: { firstName?: string; lastName?: string; password?: string }) =>
    api.post<{ message: string; accessToken: string; refreshToken: string; membership: { id: string; role: string }; isNewUser: boolean }>(
      `/invitations/${token}/accept`, data ?? {},
    ).then((r) => r.data),

  list: (orgId: string, status?: string) =>
    api.get<{ invitations: Invitation[] }>(`/organizations/${orgId}/invitations`, { params: status ? { status } : undefined })
      .then((r) => r.data.invitations),

  send: (orgId: string, data: { email: string; role: string }) =>
    api.post<{ message: string; invitation: Invitation }>(`/organizations/${orgId}/invitations`, data)
      .then((r) => r.data),

  resend: (orgId: string, invitationId: string) =>
    api.post(`/organizations/${orgId}/invitations/${invitationId}/resend`).then((r) => r.data),

  cancel: (orgId: string, invitationId: string) =>
    api.delete(`/organizations/${orgId}/invitations/${invitationId}`).then((r) => r.data),
};
