import { API_BASE_URL } from '@/config/api'

export type HttpOptions = RequestInit & { headers?: Record<string, string> }

const ACCESS_TOKEN_KEY = 'access_token'

export function setAccessToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
    else sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {}
}

export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearAccessToken() {
  setAccessToken(null)
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? ((await res.json()) as T) : ((await res.text()) as unknown as T)
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

export async function apiGet<T>(path: string, opts: HttpOptions = {}) {
  const res = await fetch(apiUrl(path), { ...opts, method: 'GET' })
  return handle<T>(res)
}

export async function apiPost<T>(path: string, body?: unknown, opts: HttpOptions = {}) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: body != null ? JSON.stringify(body) : undefined,
    ...opts,
  })
  return handle<T>(res)
}

export async function apiPut<T>(path: string, body?: unknown, opts: HttpOptions = {}) {
  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: body != null ? JSON.stringify(body) : undefined,
    ...opts,
  })
  return handle<T>(res)
}

export async function apiDelete<T>(path: string, opts: HttpOptions = {}) {
  const res = await fetch(apiUrl(path), { ...opts, method: 'DELETE' })
  return handle<T>(res)
}

// -------- Authenticated client with auto-refresh --------
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

async function refreshAccessToken(): Promise<string> {
  // Usa cookie HttpOnly do refresh; precisa de credentials:'include'
  const res = await fetch(apiUrl('/auth/v1/refresh'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  const data = await handle<{ accessToken: string }>(res)
  setAccessToken(data.accessToken)
  return data.accessToken
}

async function requestWithAuth<T>(method: Method, path: string, body?: unknown, opts: HttpOptions = {}, retry = true): Promise<T> {
  const token = getAccessToken()
  const headers = {
    ...(method === 'POST' || method === 'PUT' ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const init: RequestInit = {
    ...opts,
    method,
    headers,
    body: body != null ? JSON.stringify(body) : opts.body,
  }
  let res = await fetch(apiUrl(path), init)
  if (res.status === 401 && retry) {
    try {
      const newToken = await refreshAccessToken()
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` }
      res = await fetch(apiUrl(path), { ...init, headers: retryHeaders })
    } catch (e) {
      clearAccessToken()
      throw e
    }
  }
  return handle<T>(res)
}

export function authGet<T>(path: string, opts: HttpOptions = {}) {
  return requestWithAuth<T>('GET', path, undefined, opts)
}

export function authPost<T>(path: string, body?: unknown, opts: HttpOptions = {}) {
  return requestWithAuth<T>('POST', path, body, opts)
}

export function authPut<T>(path: string, body?: unknown, opts: HttpOptions = {}) {
  return requestWithAuth<T>('PUT', path, body, opts)
}

export function authDelete<T>(path: string, opts: HttpOptions = {}) {
  return requestWithAuth<T>('DELETE', path, undefined, opts)
}
