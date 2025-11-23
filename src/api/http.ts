import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig
} from 'axios'
import { API_BASE_URL } from './config'

export type HttpOptions = AxiosRequestConfig & {
  credentials?: RequestCredentials
}

// ⚠️ AUTENTICAÇÃO VIA HTTP-ONLY COOKIES
// Tokens são armazenados em cookies seguros pelo backend
// Não há mais localStorage/sessionStorage

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // ✅ Sempre enviar cookies
})

function mapOptions(opts: HttpOptions = {}): AxiosRequestConfig {
  const { ...rest } = opts
  return {
    ...rest,
    withCredentials: true // ✅ Sempre incluir cookies
  }
}

// Refresh via cookie HttpOnly
async function doRefresh(): Promise<void> {
  const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true // Para enviar refresh token via cookie
  })

  await refreshClient.post('/auth/v1/refresh', {})
  // Cookie accessToken será atualizado automaticamente pelo backend
}

// Interceptor: auto-refresh em caso de 401
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
        await doRefresh()
        console.log(
          '[HTTP] Refresh bem-sucedido, repetindo requisição original'
        )

        original._retry = true
        return api.request(original)
      } catch (refreshError) {
        console.error('[HTTP] Falha no refresh automático:', refreshError)
        // Redirecionar para login será feito pelo contexto de auth
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
