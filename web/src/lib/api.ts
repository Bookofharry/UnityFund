import axios from 'axios';

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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect for an expired session (a token existed before this request).
    // A 401 with no prior token means the request itself was an auth attempt
    // (e.g. wrong password on login) — let the caller show its own inline error.
    if (err.response?.status === 401 && localStorage.getItem('access_token')) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
