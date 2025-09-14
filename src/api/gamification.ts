import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authGet, authPost } from './http';
import { API_ENDPOINTS } from './config';

// Types
export interface Badge {
  codigo: string;
  nome: string;
  descricao?: string;
  criterio?: string;
  icone_url?: string;
  pontos_necessarios?: number;
}

export interface CreateBadgeInput {
  codigo: string;
  nome: string;
  descricao?: string;
  criterio?: string;
  icone_url?: string;
  pontos_necessarios?: number;
}

export interface UserProfile {
  userId: string;
  xp: number;
  nivel: string;
  proximoNivelXp: number;
  badges: Array<{
    codigo: string;
    nome: string;
  }>;
}

export interface UserAchievements {
  userId: string;
  xp: number;
  nivel: string;
  proximoNivelXp: number;
  badges: Array<{
    codigo: string;
    nome: string;
  }>;
  historicoXp: Array<{
    id: string;
    xp_ganho: number;
    motivo: string;
    referencia_id: string | null;
  }>;
}

export interface RankingEntry {
  posicao: number;
  userId: string;
  xpMes?: number;
  xpTotal?: number;
  nome?: string;
  departamento?: string;
}

export interface XpHistoryItem {
  id: string;
  xp_ganho: number;
  motivo: string;
  referencia_id: string | null;
  data_criacao?: string;
}

export interface XpHistoryResponse {
  items: XpHistoryItem[];
  nextCursor: string | null;
}

export interface ProcessBadgesResponse {
  status: string;
  processed: number;
}

// Hooks para Badges
export function useBadges() {
  return useQuery<Badge[]>({
    queryKey: ['gamification', 'badges'],
    queryFn: () => authGet<Badge[]>(`${API_ENDPOINTS.GAMIFICATION}/badges`)
  });
}

export function useBadge(codigo: string) {
  return useQuery<Badge>({
    queryKey: ['gamification', 'badge', codigo],
    queryFn: () => authGet<Badge>(`${API_ENDPOINTS.GAMIFICATION}/badges/${codigo}`),
    enabled: !!codigo
  });
}

export function useCreateBadge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['gamification', 'badges', 'create'],
    mutationFn: (input: CreateBadgeInput) =>
      authPost<Badge>(`${API_ENDPOINTS.GAMIFICATION}/badges`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'badges'] });
    }
  });
}

// Hooks para Perfil do Usuário
export function useMyGamificationProfile() {
  return useQuery<UserProfile>({
    queryKey: ['gamification', 'profile', 'me'],
    queryFn: () => authGet<UserProfile>(`${API_ENDPOINTS.GAMIFICATION}/me`, {
      headers: {
        'X-User-Id': 'current-user' // Será substituído pelo middleware
      }
    })
  });
}

export function useUserGamificationProfile(userId: string) {
  return useQuery<UserProfile>({
    queryKey: ['gamification', 'profile', userId],
    queryFn: () => authGet<UserProfile>(`${API_ENDPOINTS.GAMIFICATION}/me`, {
      headers: {
        'X-User-Id': userId
      }
    }),
    enabled: !!userId
  });
}

// Hooks para Conquistas
export function useMyAchievements() {
  return useQuery<UserAchievements>({
    queryKey: ['gamification', 'achievements', 'me'],
    queryFn: () => authGet<UserAchievements>(`${API_ENDPOINTS.GAMIFICATION}/conquistas`, {
      headers: {
        'X-User-Id': 'current-user' // Será substituído pelo middleware
      }
    })
  });
}

export function useUserAchievements(userId: string) {
  return useQuery<UserAchievements>({
    queryKey: ['gamification', 'achievements', userId],
    queryFn: () => authGet<UserAchievements>(`${API_ENDPOINTS.GAMIFICATION}/conquistas`, {
      headers: {
        'X-User-Id': userId
      }
    }),
    enabled: !!userId
  });
}

// Hooks para Processamento de Badges
export function useProcessAutoBadges() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['gamification', 'process-badges'],
    mutationFn: (userId?: string) => {
      const headers = userId ? { 'X-User-Id': userId } : {};
      return authPost<ProcessBadgesResponse>(`${API_ENDPOINTS.GAMIFICATION}/badges/auto/process`, {}, {
        headers
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'achievements'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'ranking'] });
    }
  });
}

// Hooks para Rankings
export function useGlobalRanking() {
  return useQuery<RankingEntry[]>({
    queryKey: ['gamification', 'ranking', 'global'],
    queryFn: () => authGet<RankingEntry[]>(`${API_ENDPOINTS.GAMIFICATION}/ranking/global`)
  });
}

export function useDepartmentRanking(departamentoId: string) {
  return useQuery<RankingEntry[]>({
    queryKey: ['gamification', 'ranking', 'department', departamentoId],
    queryFn: () => authGet<RankingEntry[]>(`${API_ENDPOINTS.GAMIFICATION}/ranking/departamento`, {
      headers: {
        'X-Departamento-Id': departamentoId
      }
    }),
    enabled: !!departamentoId
  });
}

export interface MonthlyRankingFilters {
  mes?: string; // YYYY-MM format
  departamento?: string;
}

export function useMonthlyRanking(filters: MonthlyRankingFilters = {}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  const url = `${API_ENDPOINTS.GAMIFICATION}/ranking/monthly${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<RankingEntry[]>({
    queryKey: ['gamification', 'ranking', 'monthly', filters],
    queryFn: () => authGet<RankingEntry[]>(url)
  });
}

// Hooks para Badges de Usuário
export function useUserBadges(userId: string) {
  return useQuery<Badge[]>({
    queryKey: ['gamification', 'user-badges', userId],
    queryFn: () => authGet<Badge[]>(`${API_ENDPOINTS.GAMIFICATION}/users/${userId}/badges`),
    enabled: !!userId
  });
}

// Hooks para Histórico de XP
export interface XpHistoryFilters {
  limit?: number;
  cursor?: string;
}

export function useUserXpHistory(userId: string, filters: XpHistoryFilters = {}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  const url = `${API_ENDPOINTS.GAMIFICATION}/users/${userId}/xp-history${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<XpHistoryResponse>({
    queryKey: ['gamification', 'xp-history', userId, filters],
    queryFn: () => authGet<XpHistoryResponse>(url),
    enabled: !!userId
  });
}

// Hook combinado para dashboard de gamificação
export function useGamificationDashboard() {
  const profile = useMyGamificationProfile();
  const achievements = useMyAchievements();
  const globalRanking = useGlobalRanking();
  
  return {
    profile: profile.data,
    achievements: achievements.data,
    globalRanking: globalRanking.data,
    isLoading: profile.isLoading || achievements.isLoading || globalRanking.isLoading,
    error: profile.error || achievements.error || globalRanking.error,
    refetch: () => {
      profile.refetch();
      achievements.refetch();
      globalRanking.refetch();
    }
  };
}

// Utilitários para gamificação
export const formatXp = (xp: number): string => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M XP`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K XP`;
  }
  return `${xp} XP`;
};

export const getLevelFromXp = (xp: number): { nivel: string; progresso: number; proximoNivel: number } => {
  if (xp < 1000) {
    return { nivel: 'Iniciante', progresso: (xp / 1000) * 100, proximoNivel: 1000 };
  } else if (xp < 5000) {
    return { nivel: 'Intermediário', progresso: ((xp - 1000) / 4000) * 100, proximoNivel: 5000 };
  } else {
    return { nivel: 'Avançado', progresso: 100, proximoNivel: xp };
  }
};
