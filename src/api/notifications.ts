import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPut } from './http'
import { API_ENDPOINTS } from './config'

// Types
export interface Notification {
  id: number
  usuario_id: string
  titulo: string
  mensagem: string
  tipo: string | null
  data_criacao: string
  lida: boolean
  canal: string | null
}

export interface NotificationsPagination {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export interface CreateNotificationInput {
  usuario_id: string
  titulo: string
  mensagem: string
  tipo?: string
  canal?: string
}

export interface UnreadCountResponse {
  unreadCount: number
}

export interface MarkAllAsReadResponse {
  message: string
  markedCount: number
}

// Hooks para Templates
export function useTemplates() {
  return useQuery({
    queryKey: ['notifications', 'templates'],
    queryFn: () => authGet(`${API_ENDPOINTS.NOTIFICATIONS}/templates`),
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['notifications', 'templates', 'create'],
    mutationFn: (input: { nome: string; assunto: string; corpo: string }) =>
      authPost(`${API_ENDPOINTS.NOTIFICATIONS}/templates`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'templates'],
      })
    },
  })
}

// Hooks para Fila de Emails
export function useEmailQueue() {
  return useQuery({
    queryKey: ['notifications', 'email-queue'],
    queryFn: () => authGet(`${API_ENDPOINTS.NOTIFICATIONS}/filas`),
  })
}

export function useRetryEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['notifications', 'email', 'retry'],
    mutationFn: (emailId: string) =>
      authPost(`${API_ENDPOINTS.NOTIFICATIONS}/filas/${emailId}/retry`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'email-queue'],
      })
    },
  })
}

// Hooks para Notificações
export interface NotificationsParams {
  page?: number
  limit?: number
  unread?: boolean
}

export function useNotifications(params: NotificationsParams = {}) {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.unread !== undefined)
    searchParams.append('unread', params.unread.toString())

  const queryString = searchParams.toString()
  const url = `${API_ENDPOINTS.NOTIFICATIONS}${queryString ? `?${queryString}` : ''}`

  return useQuery<NotificationsPagination>({
    queryKey: ['notifications', 'list', params],
    queryFn: () => authGet<NotificationsPagination>(url),
  })
}

export function useUnreadNotificationsCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () =>
      authGet<UnreadCountResponse>(
        `${API_ENDPOINTS.NOTIFICATIONS}/count`
      ),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['notifications', 'create'],
    mutationFn: (input: CreateNotificationInput) =>
      authPost<Notification>(
        `${API_ENDPOINTS.NOTIFICATIONS}`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['notifications', 'mark-read'],
    mutationFn: (notificationId: number) =>
      authPut(
        `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['notifications', 'mark-all-read'],
    mutationFn: () =>
      authPut<MarkAllAsReadResponse>(
        `${API_ENDPOINTS.NOTIFICATIONS}/read-all`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}
