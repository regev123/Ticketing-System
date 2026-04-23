/**
 * Single HTTP client (SRP). All API calls go through this.
 * DIP: callers depend on fetch; no direct axios/etc in services.
 */

import { env } from '@/config/env';
import type { ErrorResponse } from '@/types/api';
import { emitGlobalError } from '@/lib/globalErrorBus';
import { clearTokens, getToken } from '@/auth/tokenStore';

const HTTP_NO_CONTENT = 204;

export type RequestConfig = RequestInit & { params?: Record<string, string> };

function resolveBaseUrl(path: string) {
  const base = env.apiBase || (typeof window !== 'undefined' ? window.location.origin : '');
  return path.startsWith('http') ? path : base + (path.startsWith('/') ? path : `/${path}`);
}

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...init } = config;
  const href = resolveBaseUrl(path);
  const url = new URL(href);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  };
  const token = getToken();
  if (token && !(headers as Record<string, string>).Authorization) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers,
  });
  if (res.status === 401) {
    clearTokens();
  }
  if (!res.ok) {
    const err: ErrorResponse = await res.json().catch(() => ({
      message: res.statusText,
      status: res.status,
    }));
    const message = err.message ?? `HTTP ${res.status}`;
    emitGlobalError(message);
    throw new Error(message);
  }
  if (res.status === HTTP_NO_CONTENT) return undefined as T;
  return res.json() as Promise<T>;
}

async function requestBlob(path: string, config: RequestConfig = {}): Promise<Blob> {
  const { params, ...init } = config;
  const href = resolveBaseUrl(path);
  const url = new URL(href);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: HeadersInit = {
    ...init.headers,
  };
  const token = getToken();
  if (token && !(headers as Record<string, string>).Authorization) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers,
  });
  if (res.status === 401) {
    clearTokens();
  }
  if (!res.ok) {
    const err: ErrorResponse = await res.json().catch(() => ({
      message: res.statusText,
      status: res.status,
    }));
    const message = err.message ?? `HTTP ${res.status}`;
    emitGlobalError(message);
    throw new Error(message);
  }
  return res.blob();
}

export const client = {
  get: <T>(path: string, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'GET' }),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'DELETE' }),
  getBlob: (path: string, config?: RequestConfig) =>
    requestBlob(path, { ...config, method: 'GET' }),
};
