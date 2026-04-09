/**
 * Single HTTP client (SRP). All API calls go through this.
 * DIP: callers depend on fetch; no direct axios/etc in services.
 */

import { env } from '@/config/env';
import type { ErrorResponse } from '@/types/api';

const HTTP_NO_CONTENT = 204;

export type RequestConfig = RequestInit & { params?: Record<string, string> };

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...init } = config;
  const base = env.apiBase || (typeof window !== 'undefined' ? window.location.origin : '');
  const href = path.startsWith('http') ? path : base + (path.startsWith('/') ? path : `/${path}`);
  const url = new URL(href);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!res.ok) {
    const err: ErrorResponse = await res.json().catch(() => ({
      message: res.statusText,
      status: res.status,
    }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  if (res.status === HTTP_NO_CONTENT) return undefined as T;
  return res.json() as Promise<T>;
}

export const client = {
  get: <T>(path: string, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'GET' }),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'DELETE' }),
};
