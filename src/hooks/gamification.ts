import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost } from '@/api/http'

// ========================
// INTERFACES DA GAMIFICAÇÃO
// ========================

export interface Badge {
  id?: string
  codigo: string
  nome: string
  descricao?: string
  criterio?: string
  icone_url?: string
  pontos_necessarios: number
  data_criacao?: string
  ativo?: boolean
}

export interface CriarBadge {
  codigo: string
  nome: string
  descricao?: string
  criterio?: string
  icone_url?: string
  pontos_necessarios: number
}

export interface BadgeUsuario {
  id: string
  usuario_id: string
  badge_codigo: string
  badge_nome: string
  badge_descricao?: string
  badge_icone_url?: string
  data_conquista: string
  nivel_obtido?: string
}

export interface PerfilGamificacao {
  usuario_id: string
  xp_total: number
  nivel_atual: number
  nivel_nome: string
  xp_proximo_nivel: number
  progresso_nivel: number
  badges_total: number
  badges_conquistados: BadgeUsuario[]
  posicao_ranking_global?: number
  posicao_ranking_mensal?: number
  posicao_ranking_departamento?: number
}

export interface Conquista {
  id: string
  usuario_id: string
  tipo: 'XP' | 'BADGE' | 'NIVEL'
  descricao: string
  valor?: number
  data_conquista: string
  badge_codigo?: string
  badge_nome?: string
  badge_icone_url?: string
}

export interface HistoricoXP {
  id: string
  usuario_id: string
  delta_xp: number
  xp_anterior: number
  xp_novo: number
  motivo: string
  fonte: string
  data_evento: string
  metadata?: Record<string, any>
}

export interface UsuarioRanking {
  usuario_id: string
  nome: string
  xp_total: number
  nivel_atual: number
  nivel_nome: string
  posicao: number
  badges_total: number
  departamento_id?: string
  departamento_nome?: string
}

export interface RankingGlobal {
  usuarios: UsuarioRanking[]
  total_usuarios: number
  data_atualizacao: string
}

export interface RankingMensal {
  usuarios: UsuarioRanking[]
  mes: string
  ano: number
  total_usuarios: number
  data_atualizacao: string
}

export interface RankingDepartamento {
  departamento_id: string
  departamento_nome: string
  usuarios: UsuarioRanking[]
  total_usuarios: number
  data_atualizacao: string
}

// ========================
// HOOKS DE BADGES
// ========================

/**
 * Hook para criar um novo badge
 */
export function useCriarBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dadosBadge: CriarBadge) => {
      return await authPost('/gamification/v1/badges', dadosBadge)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'badges'] })
    },
  })
}

/**
 * Hook para obter um badge específico por código
 */
export function useBadge(codigo: string, enabled: boolean = true) {
  return useQuery<Badge>({
    queryKey: ['gamification', 'badge', codigo],
    queryFn: async () => {
      return await authGet(`/gamification/v1/badges/${codigo}`)
    },
    enabled: enabled && !!codigo,
  })
}

/**
 * Hook para listar badges de um usuário
 */
export function useBadgesUsuario(userId: string, enabled: boolean = true) {
  return useQuery<BadgeUsuario[]>({
    queryKey: ['gamification', 'badges-usuario', userId],
    queryFn: async () => {
      return await authGet(`/gamification/v1/users/${userId}/badges`)
    },
    enabled: enabled && !!userId,
  })
}

// ========================
// HOOKS DE PERFIL GAMIFICAÇÃO
// ========================

/**
 * Hook para obter perfil de gamificação do usuário logado
 * Usa cabeçalho X-User-Id enquanto autenticação real não é integrada
 */
export function usePerfilGamificacao(userId: string, enabled: boolean = true) {
  return useQuery<PerfilGamificacao>({
    queryKey: ['gamification', 'perfil', userId],
    queryFn: async () => {
      return await authGet('/gamification/v1/me', {
        headers: {
          'X-User-Id': userId,
        },
      })
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook para obter conquistas de gamificação do usuário
 */
export function useConquistasGamificacao(
  userId: string,
  enabled: boolean = true
) {
  return useQuery<{ badges: BadgeUsuario[]; historico_xp: HistoricoXP[] }>({
    queryKey: ['gamification', 'conquistas', userId],
    queryFn: async () => {
      return await authGet('/gamification/v1/conquistas', {
        headers: {
          'X-User-Id': userId,
        },
      })
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook para obter histórico de XP do usuário
 */
export function useHistoricoXP(userId: string, enabled: boolean = true) {
  return useQuery<HistoricoXP[]>({
    queryKey: ['gamification', 'historico-xp', userId],
    queryFn: async () => {
      return await authGet(`/gamification/v1/users/${userId}/xp-history`)
    },
    enabled: enabled && !!userId,
  })
}

// ========================
// HOOKS DE RANKING
// ========================

/**
 * Hook para obter ranking global
 */
export function useRankingGlobal() {
  return useQuery<RankingGlobal>({
    queryKey: ['gamification', 'ranking', 'global'],
    queryFn: async () => {
      return await authGet('/gamification/v1/ranking/global')
    },
  })
}

/**
 * Hook para obter ranking mensal
 */
export function useRankingMensal() {
  return useQuery<RankingMensal>({
    queryKey: ['gamification', 'ranking', 'mensal'],
    queryFn: async () => {
      return await authGet('/gamification/v1/ranking/monthly')
    },
  })
}

/**
 * Hook para obter ranking por departamento
 */
export function useRankingDepartamento(
  departamentoId: string,
  enabled: boolean = true
) {
  return useQuery<RankingDepartamento>({
    queryKey: ['gamification', 'ranking', 'departamento', departamentoId],
    queryFn: async () => {
      return await authGet('/gamification/v1/ranking/departamento', {
        headers: {
          'X-Departamento-Id': departamentoId,
        },
      })
    },
    enabled: enabled && !!departamentoId,
  })
}

// ========================
// HOOKS DE PROCESSAMENTO
// ========================

/**
 * Hook para reprocessar badges automáticos
 */
export function useReprocessarBadges() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId?: string) => {
      const headers = userId ? { 'X-User-Id': userId } : {}
      return await authPost(
        '/gamification/v1/badges/auto/process',
        {},
        { headers }
      )
    },
    onSuccess: (_, userId) => {
      // Invalida cache relevante
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ['gamification', 'perfil', userId],
        })
        queryClient.invalidateQueries({
          queryKey: ['gamification', 'badges-usuario', userId],
        })
        queryClient.invalidateQueries({
          queryKey: ['gamification', 'conquistas', userId],
        })
      }
      queryClient.invalidateQueries({ queryKey: ['gamification', 'ranking'] })
    },
  })
}

// ========================
// HOOKS COMPOSTOS/UTILITÁRIOS
// ========================

/**
 * Hook que combina perfil de gamificação com conquistas
 */
export function useGamificacaoCompleta(
  userId: string,
  enabled: boolean = true
) {
  const perfil = usePerfilGamificacao(userId, enabled)
  const conquistas = useConquistasGamificacao(userId, enabled)
  const historico = useHistoricoXP(userId, enabled)

  return {
    perfil: perfil.data,
    conquistas: conquistas.data,
    historico: historico.data || [],
    isLoading: perfil.isLoading || conquistas.isLoading || historico.isLoading,
    isError: perfil.isError || conquistas.isError || historico.isError,
    error: perfil.error || conquistas.error || historico.error,
    refetch: () => {
      perfil.refetch()
      conquistas.refetch()
      historico.refetch()
    },
  }
}

/**
 * Hook para obter posição do usuário em todos os rankings
 */
export function usePosicaoRankings(
  userId: string,
  departamentoId?: string,
  enabled: boolean = true
) {
  const rankingGlobal = useRankingGlobal()
  const rankingMensal = useRankingMensal()
  const rankingDepartamento = useRankingDepartamento(
    departamentoId || '',
    enabled && !!departamentoId
  )

  const posicoes = React.useMemo(() => {
    const global = rankingGlobal.data?.usuarios?.find(
      u => u.usuario_id === userId
    )?.posicao
    const mensal = rankingMensal.data?.usuarios?.find(
      u => u.usuario_id === userId
    )?.posicao
    const departamento = rankingDepartamento.data?.usuarios?.find(
      u => u.usuario_id === userId
    )?.posicao

    return {
      global,
      mensal,
      departamento,
    }
  }, [rankingGlobal.data, rankingMensal.data, rankingDepartamento.data, userId])

  return {
    posicoes,
    isLoading:
      rankingGlobal.isLoading ||
      rankingMensal.isLoading ||
      rankingDepartamento.isLoading,
    isError:
      rankingGlobal.isError ||
      rankingMensal.isError ||
      rankingDepartamento.isError,
  }
}

/**
 * Hook para estatísticas de gamificação do usuário
 */
export function useEstatisticasGamificacao(
  userId: string,
  enabled: boolean = true
) {
  const { perfil, conquistas, historico } = useGamificacaoCompleta(
    userId,
    enabled
  )

  const stats = React.useMemo(() => {
    if (!perfil || !conquistas || !historico) {
      return null
    }

    const xpUltimos30Dias = historico
      .filter(h => {
        const dataEvento = new Date(h.data_evento)
        const agora = new Date()
        const diasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
        return dataEvento >= diasAtras
      })
      .reduce((sum, h) => sum + h.delta_xp, 0)

    const badgesUltimos30Dias = conquistas.badges.filter(b => {
      const dataConquista = new Date(b.data_conquista)
      const agora = new Date()
      const diasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
      return dataConquista >= diasAtras
    }).length

    return {
      xp_total: perfil.xp_total,
      nivel_atual: perfil.nivel_atual,
      badges_total: perfil.badges_total,
      xp_ultimos_30_dias: xpUltimos30Dias,
      badges_ultimos_30_dias: badgesUltimos30Dias,
      progresso_proximo_nivel: perfil.progresso_nivel,
      xp_para_proximo_nivel: perfil.xp_proximo_nivel - perfil.xp_total,
    }
  }, [perfil, conquistas, historico])

  return stats
}

/**
 * Hook para validações de gamificação
 */
export function useValidacoesGamificacao() {
  return {
    validarCodigoBadge: (codigo: string): boolean => {
      return /^[A-Za-z0-9_-]+$/.test(codigo) && codigo.length >= 3
    },
    validarNomeBadge: (nome: string): boolean => {
      return nome.trim().length >= 3
    },
    validarPontosNecessarios: (pontos: number): boolean => {
      return pontos > 0 && pontos <= 100000
    },
    validarIconeUrl: (url: string): boolean => {
      try {
        new URL(url)
        return /\.(jpg|jpeg|png|gif|svg)$/i.test(url)
      } catch {
        return false
      }
    },
  }
}

// Importar React para useMemo
import React from 'react'
