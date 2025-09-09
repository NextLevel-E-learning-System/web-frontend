import { API_BASE_URL } from '@/api/api'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

export type HttpOptions = AxiosRequestConfig & {
  credentials?: RequestCredentials
}

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

const api: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

function mapOptions(opts: HttpOptions = {}): AxiosRequestConfig {
  const { credentials, ...rest } = opts
  return {
    ...rest,
    withCredentials: credentials === 'include' ? true : rest.withCredentials,
  }
}

// Refresh via cookie HttpOnly
async function doRefresh(): Promise<string> {
  const refreshClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true })
  const { data } = await refreshClient.post<{ accessToken: string }>('/auth/v1/refresh', {})
  setAccessToken(data.accessToken)
  return data.accessToken
}

// Interceptor: injeta Bearer e faz auto-refresh
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    const headers = (config.headers ?? {}) as any
    if (typeof headers.set === 'function') headers.set('Authorization', `Bearer ${token}`)
    else headers['Authorization'] = `Bearer ${token}`
    config.headers = headers
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status
    if (status === 401 && original && !original._retry) {
      try {
        const newToken = await doRefresh()
        original._retry = true
        const hdrs = (original.headers ?? {}) as any
        if (typeof hdrs.set === 'function') hdrs.set('Authorization', `Bearer ${newToken}`)
        else hdrs['Authorization'] = `Bearer ${newToken}`
        original.headers = hdrs
        return api.request(original)
      } catch (e) {
        clearAccessToken()
      }
    }
    return Promise.reject(error)
  }
)

// -------- API helpers --------
export async function apiGet<T>(path: string, opts: HttpOptions = {}) {
  const { data } = await api.get<T>(path, mapOptions(opts))
  return data
}

export async function apiPost<T>(path: string, body?: unknown, opts: HttpOptions = {}) {
  const { data } = await api.post<T>(path, body ?? {}, mapOptions(opts))
  return data
}

export async function apiPut<T>(path: string, body?: unknown, opts: HttpOptions = {}) {
  const { data } = await api.put<T>(path, body ?? {}, mapOptions(opts))
  return data
}

export async function apiPatch<T>(path: string, body?: unknown, opts: HttpOptions = {}) {
  const { data } = await api.patch<T>(path, body ?? {}, mapOptions(opts))
  return data
}

export async function apiDelete<T>(path: string, opts: HttpOptions = {}) {
  const { data } = await api.delete<T>(path, mapOptions(opts))
  return data
}

export const authGet = apiGet
export const authPost = apiPost
export const authPut = apiPut
export const authDelete = apiDelete
export const authPatch = apiPatch
