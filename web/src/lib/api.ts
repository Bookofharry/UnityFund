import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// In dev: Vite proxies /api → localhost:4000 (see vite.config.ts).
// In production: set VITE_API_URL=https://api.unityfund.io in .env.production
// or configure your reverse proxy to forward /api to the backend.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Concurrent 401s (e.g. a page firing several requests at once right when
// the access token expires) must share a single refresh call — refresh
// tokens are rotated on use, so a second independent refresh attempt would
// be handed a token the first one already consumed and would fail.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    // Plain axios, not the `api` instance — this must not carry the
    // (expired) access token, nor loop back through this same interceptor.
    const res = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${BASE_URL}/auth/refresh`,
      { refreshToken },
    );
    localStorage.setItem('access_token', res.data.accessToken);
    localStorage.setItem('refresh_token', res.data.refreshToken);
    return res.data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function forceLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh'].some((p) =>
      originalRequest?.url?.includes(p),
    );

    // A session-expiry 401 (a token existed before this request, on a
    // non-auth endpoint we haven't already retried): try one silent
    // refresh-and-retry before giving up. A 401 with no prior token means
    // the request itself was an auth attempt (e.g. wrong password on
    // login) — let the caller show its own inline error instead.
    if (
      err.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      localStorage.getItem('access_token')
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        forceLogout();
      }
    }

    return Promise.reject(err);
  },
);
