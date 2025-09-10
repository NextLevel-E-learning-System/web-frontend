import { API_BASE_URL } from '@/api/api'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

export type HttpOptions = AxiosRequestConfig & {
  credentials?: RequestCredentials
}

const ACCESS_TOKEN_KEY = 'access_token'

export function setAccessToken(
  token: string | null,
  persistent: boolean = true
) {
  try {
    if (token) {
      if (persistent) {
        // Salvar no localStorage (persiste ao fechar navegador)
        localStorage.setItem(ACCESS_TOKEN_KEY, token)
        sessionStorage.removeItem(ACCESS_TOKEN_KEY) // Limpar sessionStorage se existir
      } else {
        // Salvar no sessionStorage (não persiste ao fechar navegador)
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
        localStorage.removeItem(ACCESS_TOKEN_KEY) // Limpar localStorage se existir
      }
    } else {
      // Limpar ambos
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  } catch {}
}

export function getAccessToken(): string | null {
  try {
    // Tentar localStorage primeiro (persistente), depois sessionStorage
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY)
    )
  } catch {
    return null
  }
}

export function clearAccessToken() {
  setAccessToken(null)
}

export function isTokenPersistent(): boolean {
  try {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return false
  }
}

const api: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

function mapOptions(opts: HttpOptions = {}): AxiosRequestConfig {
  const { credentials, ...rest } = opts
  return {
    ...rest,
    withCredentials: credentials === 'include' ? true : rest.withCredentials,
  }
}

// Refresh via cookie HttpOnly + access token atual
async function doRefresh(): Promise<string> {
  const currentToken = getAccessToken() // Pega token atual (mesmo expirado)

  const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Para enviar refresh token via cookie
  })

  // Configurar headers com access token atual (mesmo se expirado)
  const headers: any = {}
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`
  }

  const { data } = await refreshClient.post<{ accessToken: string }>(
    '/auth/v1/refresh',
    {}, // Corpo vazio, refresh token vai via cookie
    { headers }
  )

  setAccessToken(data.accessToken)
  return data.accessToken
}

// Interceptor: injeta Bearer e faz auto-refresh
api.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) {
    const headers = (config.headers ?? {}) as any
    if (typeof headers.set === 'function')
      headers.set('Authorization', `Bearer ${token}`)
    else headers['Authorization'] = `Bearer ${token}`
    config.headers = headers
  }
  return config
})

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined
    const status = error.response?.status

    // Se 401 e não é a primeira tentativa, tentar refresh
    if (status === 401 && original && !original._retry) {
      try {
        console.log('[HTTP] Tentando refresh automático...')
        const newToken = await doRefresh()
        console.log(
          '[HTTP] Refresh bem-sucedido, repetindo requisição original'
        )

        original._retry = true
        const hdrs = (original.headers ?? {}) as any
        if (typeof hdrs.set === 'function')
          hdrs.set('Authorization', `Bearer ${newToken}`)
        else hdrs['Authorization'] = `Bearer ${newToken}`
        original.headers = hdrs

        return api.request(original)
      } catch (refreshError) {
        console.error('[HTTP] Falha no refresh automático:', refreshError)
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

export async function apiPost<T>(
  path: string,
  body?: unknown,
  opts: HttpOptions = {}
) {
  const { data } = await api.post<T>(path, body ?? {}, mapOptions(opts))
  return data
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  opts: HttpOptions = {}
) {
  const { data } = await api.put<T>(path, body ?? {}, mapOptions(opts))
  return data
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  opts: HttpOptions = {}
) {
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
