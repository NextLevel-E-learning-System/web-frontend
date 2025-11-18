import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPut } from './http'
import { API_ENDPOINTS } from './config'

export type Notification = {
  id: number
  funcionario_id: string
  titulo: string
  mensagem: string
  tipo: string | null
  data_criacao: string
  lida: boolean
  canal: string | null
}

type NotificationsPagination = {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

type UnreadCountResponse = {
  unreadCount: number
}

type MarkAllAsReadResponse = {
  message: string
  markedCount: number
}

type NotificationsParams = {
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
      authGet<UnreadCountResponse>(`${API_ENDPOINTS.NOTIFICATIONS}/count`),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['notifications', 'mark-read'],
    mutationFn: (notificationId: number) =>
      authPut(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`),
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
      authPut<MarkAllAsReadResponse>(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}
