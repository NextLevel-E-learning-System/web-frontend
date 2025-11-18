import { useQuery } from '@tanstack/react-query'
import { authGet } from './http'
import { API_ENDPOINTS } from './config'

type Badge = {
  codigo: string
  nome: string
  descricao?: string
  criterio?: string
  icone_url?: string
  pontos_necessarios?: number
  criado_em?: string
  data_conquista?: string
}

type MyGamificationProfile = {
  badges: Badge[]
}

type GlobalRankingEntry = {
  user_id: string
  nome: string
  xp: number
  posicao: number | null
}

type MonthlyRankingEntry = {
  posicao: number
  userId: string
  nome: string
  xpMes: number
}

type MonthlyRankingFilters = {
  mes?: string
  departamento?: string
}

export function useMyGamificationProfile() {
  return useQuery<MyGamificationProfile>({
    queryKey: ['gamification', 'profile', 'me'],
    queryFn: () =>
      authGet<MyGamificationProfile>(`${API_ENDPOINTS.GAMIFICATION}/me`),
  })
}

export function useGlobalRanking() {
  return useQuery<GlobalRankingEntry[]>({
    queryKey: ['gamification', 'ranking', 'global'],
    queryFn: () =>
      authGet<GlobalRankingEntry[]>(
        `${API_ENDPOINTS.GAMIFICATION}/ranking/global`
      ),
  })
}

export function useMonthlyRanking(filters: MonthlyRankingFilters = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value)
    }
  })

  const queryString = searchParams.toString()
  const url = `${API_ENDPOINTS.GAMIFICATION}/ranking/monthly${queryString ? `?${queryString}` : ''}`

  return useQuery<MonthlyRankingEntry[]>({
    queryKey: ['gamification', 'ranking', 'monthly', filters],
    queryFn: () => authGet<MonthlyRankingEntry[]>(url),
  })
}
