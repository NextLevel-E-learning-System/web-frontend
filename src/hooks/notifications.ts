import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from '@/api/http'

// ========================
// INTERFACES DAS NOTIFICAÇÕES
// ========================

export interface Notificacao {
  id: string
  usuario_id: string
  titulo: string
  mensagem: string
  tipo:
    | 'INFO'
    | 'SUCESSO'
    | 'AVISO'
    | 'ERRO'
    | 'BADGE'
    | 'CURSO'
    | 'AVALIACAO'
    | 'SISTEMA'
  canal: 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS'
  lida: boolean
  data_criacao: string
  data_leitura?: string
  data_expiracao?: string
  metadata?: Record<string, any>
  acao_url?: string
  acao_texto?: string
  prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE'
}

export interface CriarNotificacao {
  usuario_id: string
  titulo: string
  mensagem: string
  tipo?:
    | 'INFO'
    | 'SUCESSO'
    | 'AVISO'
    | 'ERRO'
    | 'BADGE'
    | 'CURSO'
    | 'AVALIACAO'
    | 'SISTEMA'
  canal?: 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS'
  metadata?: Record<string, any>
  acao_url?: string
  acao_texto?: string
  prioridade?: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE'
  data_expiracao?: string
}

export interface FiltrosNotificacao {
  tipo?: string
  lida?: boolean
  prioridade?: string
  data_inicio?: string
  data_fim?: string
  limit?: number
  offset?: number
}

export interface EstatisticasNotificacao {
  total: number
  nao_lidas: number
  por_tipo: Record<string, number>
  por_prioridade: Record<string, number>
  ultimas_24h: number
  ultimos_7_dias: number
}

export interface ConfiguracaoNotificacao {
  usuario_id: string
  email_habilitado: boolean
  push_habilitado: boolean
  sms_habilitado: boolean
  tipos_habilitados: string[]
  horario_nao_perturbe_inicio?: string
  horario_nao_perturbe_fim?: string
  frequencia_digest: 'NUNCA' | 'DIARIO' | 'SEMANAL'
}

// ========================
// HOOKS DE NOTIFICAÇÕES
// ========================

/**
 * Hook para listar notificações do usuário
 */
export function useNotificacoes(filtros?: FiltrosNotificacao) {
  const params = new URLSearchParams()
  if (filtros?.tipo) params.append('tipo', filtros.tipo)
  if (filtros?.lida !== undefined)
    params.append('lida', filtros.lida.toString())
  if (filtros?.prioridade) params.append('prioridade', filtros.prioridade)
  if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio)
  if (filtros?.data_fim) params.append('data_fim', filtros.data_fim)
  if (filtros?.limit) params.append('limit', filtros.limit.toString())
  if (filtros?.offset) params.append('offset', filtros.offset.toString())

  const queryString = params.toString()
  const url = `/notifications/v1${queryString ? `?${queryString}` : ''}`

  return useQuery<Notificacao[]>({
    queryKey: ['notifications', 'lista', filtros],
    queryFn: async () => {
      return await authGet(url)
    },
  })
}

/**
 * Hook para criar uma nova notificação
 */
export function useCriarNotificacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dadosNotificacao: CriarNotificacao) => {
      return await authPost('/notifications/v1', dadosNotificacao)
    },
    onSuccess: () => {
      // Invalida cache das notificações
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook para marcar notificação como lida
 */
export function useMarcarComoLida() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificacaoId: string) => {
      // Endpoint não especificado na API, mas é comum ter essa funcionalidade
      return await authPatch(`/notifications/v1/${notificacaoId}/read`)
    },
    onSuccess: () => {
      // Invalida cache das notificações
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook para marcar múltiplas notificações como lidas
 */
export function useMarcarMultiplasComoLidas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificacaoIds: string[]) => {
      // Endpoint não especificado na API, mas implementação comum
      return await authPatch('/notifications/v1/bulk/read', {
        ids: notificacaoIds,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook para deletar notificação
 */
export function useDeletarNotificacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificacaoId: string) => {
      // Endpoint não especificado na API
      return await authPost(`/notifications/v1/${notificacaoId}/delete`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// ========================
// HOOKS DE ESTATÍSTICAS
// ========================

/**
 * Hook para obter estatísticas das notificações
 */
export function useEstatisticasNotificacoes() {
  return useQuery<EstatisticasNotificacao>({
    queryKey: ['notifications', 'estatisticas'],
    queryFn: async () => {
      // Endpoint não especificado na API, implementação personalizada
      return await authGet('/notifications/v1/stats')
    },
  })
}

/**
 * Hook para obter contagem de notificações não lidas
 */
export function useNotificacaoNaoLidas() {
  return useQuery<{ count: number }>({
    queryKey: ['notifications', 'nao-lidas'],
    queryFn: async () => {
      return await authGet('/notifications/v1/unread-count')
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })
}

// ========================
// HOOKS DE CONFIGURAÇÃO
// ========================

/**
 * Hook para obter configurações de notificação do usuário
 */
export function useConfiguracaoNotificacoes(
  userId: string,
  enabled: boolean = true
) {
  return useQuery<ConfiguracaoNotificacao>({
    queryKey: ['notifications', 'config', userId],
    queryFn: async () => {
      return await authGet(`/notifications/v1/config/${userId}`)
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook para atualizar configurações de notificação
 */
export function useAtualizarConfiguracaoNotificacoes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      config,
    }: {
      userId: string
      config: Partial<ConfiguracaoNotificacao>
    }) => {
      return await authPatch(`/notifications/v1/config/${userId}`, config)
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'config', userId],
      })
    },
  })
}

// ========================
// HOOKS COMPOSTOS/UTILITÁRIOS
// ========================

/**
 * Hook para notificações em tempo real (simulação via polling)
 */
export function useNotificacoesTempoReal(intervalo: number = 30000) {
  const naoLidas = useNotificacaoNaoLidas()
  const notificacoes = useNotificacoes({ lida: false, limit: 10 })

  return {
    count_nao_lidas: naoLidas.data?.count || 0,
    notificacoes_recentes: notificacoes.data || [],
    isLoading: naoLidas.isLoading || notificacoes.isLoading,
    refetch: () => {
      naoLidas.refetch()
      notificacoes.refetch()
    },
  }
}

/**
 * Hook para agrupar notificações por data
 */
export function useNotificacoesAgrupadas(filtros?: FiltrosNotificacao) {
  const { data: notificacoes, ...rest } = useNotificacoes(filtros)

  const agrupadas = React.useMemo(() => {
    if (!notificacoes) return {}

    return notificacoes.reduce(
      (grupos, notificacao) => {
        const data = new Date(notificacao.data_criacao).toDateString()
        if (!grupos[data]) grupos[data] = []
        grupos[data].push(notificacao)
        return grupos
      },
      {} as Record<string, Notificacao[]>
    )
  }, [notificacoes])

  return {
    notificacoes_agrupadas: agrupadas,
    notificacoes_array: notificacoes || [],
    ...rest,
  }
}

/**
 * Hook para filtrar notificações por tipo
 */
export function useNotificacoesPorTipo() {
  const { data: notificacoes } = useNotificacoes()

  const porTipo = React.useMemo(() => {
    if (!notificacoes) return {}

    return notificacoes.reduce(
      (tipos, notificacao) => {
        const tipo = notificacao.tipo
        if (!tipos[tipo]) tipos[tipo] = []
        tipos[tipo].push(notificacao)
        return tipos
      },
      {} as Record<string, Notificacao[]>
    )
  }, [notificacoes])

  return porTipo
}

/**
 * Hook para ações em lote com notificações
 */
export function useAcoesLoteNotificacoes() {
  const marcarMultiplasLidas = useMarcarMultiplasComoLidas()
  const queryClient = useQueryClient()

  return {
    marcarTodasComoLidas: async () => {
      // Busca todas as notificações não lidas
      const notificacoes = (await queryClient.fetchQuery({
        queryKey: ['notifications', 'lista', { lida: false }],
        queryFn: () => authGet('/notifications/v1?lida=false'),
      })) as Notificacao[]

      const ids = notificacoes.map(n => n.id)
      if (ids.length > 0) {
        return marcarMultiplasLidas.mutateAsync(ids)
      }
    },

    marcarPorTipoComoLidas: async (tipo: string) => {
      const notificacoes = (await queryClient.fetchQuery({
        queryKey: ['notifications', 'lista', { lida: false, tipo }],
        queryFn: () => authGet(`/notifications/v1?lida=false&tipo=${tipo}`),
      })) as Notificacao[]

      const ids = notificacoes.map(n => n.id)
      if (ids.length > 0) {
        return marcarMultiplasLidas.mutateAsync(ids)
      }
    },
  }
}

/**
 * Hook para validações de notificação
 */
export function useValidacoesNotificacao() {
  return {
    validarTitulo: (titulo: string): boolean => {
      return titulo.trim().length >= 3 && titulo.length <= 100
    },
    validarMensagem: (mensagem: string): boolean => {
      return mensagem.trim().length >= 5 && mensagem.length <= 500
    },
    validarTipo: (tipo: string): boolean => {
      const tiposValidos = [
        'INFO',
        'SUCESSO',
        'AVISO',
        'ERRO',
        'BADGE',
        'CURSO',
        'AVALIACAO',
        'SISTEMA',
      ]
      return tiposValidos.includes(tipo)
    },
    validarCanal: (canal: string): boolean => {
      const canaisValidos = ['IN_APP', 'EMAIL', 'PUSH', 'SMS']
      return canaisValidos.includes(canal)
    },
    validarPrioridade: (prioridade: string): boolean => {
      const prioridadesValidas = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE']
      return prioridadesValidas.includes(prioridade)
    },
    validarUrl: (url: string): boolean => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    },
  }
}

// Importar React para useMemo
import React from 'react'
