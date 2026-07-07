import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  // /me returns orgMemberships; /login returns memberships — normalize to orgMemberships
  orgMemberships?: Array<{
    organization: { id: string; name: string; organizationType: string };
    role: string;
  }>;
  memberships?: Array<{
    organization: { id: string; name: string; organizationType: string };
    role: string;
    status: string;
  }>;
}

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', data).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { email, password }).then((r) => r.data),

  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),

  logout: (refreshToken: string | null) =>
    api.post('/auth/logout', { refreshToken }).then((r) => r.data),

  requestReset: (email: string) =>
    api.post('/auth/password-reset/request', { email }).then((r) => r.data),

  confirmReset: (token: string, newPassword: string) =>
    api.post('/auth/password-reset/confirm', { token, newPassword }).then((r) => r.data),
};
